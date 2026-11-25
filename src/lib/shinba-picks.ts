// 新馬戦の狙い目スコア（第2段階：騎手を追加）。
// 血統（父・母父の勝ち上がり率）、厩舎（仕上がり・勝ち上がりの能力値）、
// 騎手（今の世代のデビュー戦での成績）から出す純粋な計算。
// データが無い項目は重みを付け直して割り算するので、欠けたまま使える
// （騎手は枠順確定まで未定のことが多く、その間は騎手なしで計算される）。

export type ShinbaFactors = {
  /** 父の産駒の勝ち上がり率（%）。サンプルが少ない・データ無しは null */
  sireWinnerRate: number | null;
  sireName?: string | null;
  /** 母父の産駒の勝ち上がり率（%） */
  damsireWinnerRate: number | null;
  damsireName?: string | null;
  /** 厩舎の能力値（1〜100、profile.ts の scoreProfiles 由来） */
  trainerEarly: number | null;
  trainerConsistency: number | null;
  trainerName?: string | null;
  /** 騎手名と、その騎手のデビュー戦成績（jockey-data 由来）。未定・未集計は null */
  jockeyName?: string | null;
  jockeyDebut?: { rides: number; wins: number; places: number } | null;
};

export type ShinbaScore = {
  /** 0〜100。材料が1つも無ければ null */
  score: number | null;
  /** 根拠の短文（スコアが高い順に最大2つ） */
  reasons: string[];
};

const clamp100 = (v: number) => Math.max(0, Math.min(100, v));

/**
 * 勝ち上がり率（%）を 0〜100 のスコアに直す。
 * 実データの分布（種牡馬212頭・産駒50戦以上）では中央値が約27%、上位10%が約47%なので、
 * 10%以下を0、50%以上を100として線形に割り付ける。
 */
export function winnerRateScore(rate: number | null): number | null {
  if (rate === null || !Number.isFinite(rate)) return null;
  return Math.round(clamp100(((rate - 10) / 40) * 100));
}

/** 騎手スコアに使うデビュー戦騎乗数の下限（これ未満はサンプル不足で使わない） */
export const JOCKEY_MIN_DEBUT_RIDES = 15;

/**
 * 騎手のデビュー戦成績を 0〜100 のスコアに直す。
 * 勝率5%以下を0・25%以上を100、複勝率（3着以内）20%以下を0・55%以上を100として、
 * 勝率6：複勝率4で混ぜる。新馬戦は「勝ち切る」より「崩れない」ことも大事だが、
 * 狙い目としては勝率を重くする。
 */
export function jockeyScore(d: { rides: number; wins: number; places: number } | null | undefined): number | null {
  if (!d || d.rides < JOCKEY_MIN_DEBUT_RIDES) return null;
  const winRate = (d.wins / d.rides) * 100;
  const placeRate = (d.places / d.rides) * 100;
  const winScore = clamp100(((winRate - 5) / 20) * 100);
  const placeScore = clamp100(((placeRate - 20) / 35) * 100);
  return Math.round(winScore * 0.6 + placeScore * 0.4);
}

type Part = { weight: number; score: number | null; reason: string | null };

export function scoreShinbaHorse(f: ShinbaFactors): ShinbaScore {
  const sire = winnerRateScore(f.sireWinnerRate);
  const damsire = winnerRateScore(f.damsireWinnerRate);
  const jockey = jockeyScore(f.jockeyDebut);
  const parts: Part[] = [
    {
      weight: 30, score: sire,
      reason: sire !== null && sire >= 60 && f.sireWinnerRate !== null
        ? `父${f.sireName ?? ""}の勝ち上がり率${f.sireWinnerRate.toFixed(1)}%と高い` : null,
    },
    {
      weight: 20, score: f.trainerEarly,
      reason: f.trainerEarly !== null && f.trainerEarly >= 80
        ? `${f.trainerName ?? "厩舎"}は仕上がりが早く、夏の新馬戦から動ける` : null,
    },
    {
      weight: 20, score: f.trainerConsistency,
      reason: f.trainerConsistency !== null && f.trainerConsistency >= 80
        ? `${f.trainerName ?? "厩舎"}の管理馬は勝ち上がり率が高い` : null,
    },
    {
      weight: 20, score: jockey,
      reason: jockey !== null && jockey >= 60 && f.jockeyDebut
        ? `${f.jockeyName ?? "騎手"}騎手はデビュー戦で${f.jockeyDebut.rides}戦${f.jockeyDebut.wins}勝（勝率${((f.jockeyDebut.wins / f.jockeyDebut.rides) * 100).toFixed(0)}%）と新馬戦に強い` : null,
    },
    {
      weight: 10, score: damsire,
      reason: damsire !== null && damsire >= 60 && f.damsireWinnerRate !== null
        ? `母父${f.damsireName ?? ""}の勝ち上がり率${f.damsireWinnerRate.toFixed(1)}%` : null,
    },
  ];
  const usable = parts.filter((p) => p.score !== null);
  if (usable.length === 0) return { score: null, reasons: [] };
  const totalWeight = usable.reduce((a, p) => a + p.weight, 0);
  const score = Math.round(usable.reduce((a, p) => a + p.weight * p.score!, 0) / totalWeight);
  const reasons = usable
    .filter((p) => p.reason !== null)
    .sort((a, b) => b.score! - a.score!)
    .slice(0, 2)
    .map((p) => p.reason!);
  return { score, reasons };
}

/** 狙い目とみなすスコアの下限 */
export const SHINBA_PICK_MIN = 65;
/** 1レースで狙い目にする頭数の上限 */
export const SHINBA_PICK_PER_RACE = 2;

export type Ranked<T> = { item: T; score: ShinbaScore; rank: number; isPick: boolean };

/** レース内（＝渡された配列の中）でスコア順に並べ、狙い目を付ける。同点は元の並び順を保つ */
export function rankShinbaRace<T>(items: T[], scoreOf: (item: T) => ShinbaScore): Ranked<T>[] {
  const sorted = items
    .map((item, i) => ({ item, score: scoreOf(item), i }))
    .sort((a, b) => (b.score.score ?? -1) - (a.score.score ?? -1) || a.i - b.i);
  let pickCount = 0;
  return sorted.map((r, idx) => {
    const isPick = r.score.score !== null && r.score.score >= SHINBA_PICK_MIN && pickCount < SHINBA_PICK_PER_RACE;
    if (isPick) pickCount++;
    return { item: r.item, score: r.score, rank: idx + 1, isPick };
  });
}

/** 全レースを通しての狙い目（スコアが高い順、同点は元の並び順） */
export function shinbaHighlights<T>(rankedRaces: Ranked<T>[][], limit = 5): Ranked<T>[] {
  return rankedRaces
    .flat()
    .filter((r) => r.isPick)
    .sort((a, b) => (b.score.score ?? 0) - (a.score.score ?? 0))
    .slice(0, limit);
}

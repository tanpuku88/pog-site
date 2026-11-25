// 新馬戦の狙い目スコア（第1段階：騎手なし）。
// 血統（父・母父の勝ち上がり率）と厩舎（仕上がり・勝ち上がりの能力値）だけから出す純粋な計算。
// データが無い項目は重みを付け直して割り算するので、欠けたまま使える。

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

type Part = { weight: number; score: number | null; reason: string | null };

export function scoreShinbaHorse(f: ShinbaFactors): ShinbaScore {
  const sire = winnerRateScore(f.sireWinnerRate);
  const damsire = winnerRateScore(f.damsireWinnerRate);
  const parts: Part[] = [
    {
      weight: 35, score: sire,
      reason: sire !== null && sire >= 60 && f.sireWinnerRate !== null
        ? `父${f.sireName ?? ""}の勝ち上がり率${f.sireWinnerRate.toFixed(1)}%と高い` : null,
    },
    {
      weight: 25, score: f.trainerEarly,
      reason: f.trainerEarly !== null && f.trainerEarly >= 80
        ? `${f.trainerName ?? "厩舎"}は仕上がりが早く、夏の新馬戦から動ける` : null,
    },
    {
      weight: 25, score: f.trainerConsistency,
      reason: f.trainerConsistency !== null && f.trainerConsistency >= 80
        ? `${f.trainerName ?? "厩舎"}の管理馬は勝ち上がり率が高い` : null,
    },
    {
      weight: 15, score: damsire,
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

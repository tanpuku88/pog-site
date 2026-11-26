// 大会ごとのルール（2027年シーズン〜）。groups.rules（JSON）に保存する。
// rules が空の大会（2026年に作った大会）は、今までどおり「本賞金の合計」で計算する。

export type ScoringBase = "prize" | "finish";
export type Grade = "G1" | "G2" | "G3";
export type PresetId = "standard" | "simple" | "points" | "custom";

export type GroupRules = {
  version: 1;
  preset: PresetId;
  /** 牡馬（セン馬を含む）・牝馬の指名頭数。null なら内訳は自由 */
  male: number | null;
  female: number | null;
  /** prize: 本賞金（万円）／ finish: 着順ポイント */
  base: ScoringBase;
  /** 1着〜5着のポイント（base が finish のとき） */
  finishPoints: number[];
  /** 重賞を勝ったときのボーナス（prize なら万円、finish ならポイント） */
  gradeBonus: Record<Grade, number>;
  /** 地方・海外のレースを何％で数えるか（0〜100） */
  nonJraRate: number;
  /** 障害レースを数えない */
  excludeJump: boolean;
  /** 上位N頭の合計で順位をつける。null なら全頭 */
  bestN: number | null;
};

const ZERO_BONUS: Record<Grade, number> = { G1: 0, G2: 0, G3: 0 };

/** 今までのルール（2026年の大会）。include_non_jra だけ大会の設定を使う */
export function legacyRules(includeNonJra: boolean): GroupRules {
  return {
    version: 1, preset: "custom", male: null, female: null, base: "prize",
    finishPoints: [10, 5, 3, 2, 1], gradeBonus: { ...ZERO_BONUS },
    nonJraRate: includeNonJra ? 100 : 0, excludeJump: false, bestN: null,
  };
}

export type Preset = { id: Exclude<PresetId, "custom">; name: string; catch: string; picks: number; rules: GroupRules };

/** 大会を作るときの3択。値は仮（2026-11-26 本人と決定、あとで調整） */
export const PRESETS: Preset[] = [
  {
    id: "standard", name: "定番（賞金制）", catch: "大手POGと同じく地方・海外の賞金も数え、重賞を勝つとボーナス。牡馬5頭・牝馬5頭。",
    picks: 10,
    rules: {
      version: 1, preset: "standard", male: 5, female: 5, base: "prize",
      finishPoints: [10, 5, 3, 2, 1], gradeBonus: { G1: 1000, G2: 500, G3: 300 },
      nonJraRate: 100, excludeJump: false, bestN: null,
    },
  },
  {
    id: "simple", name: "シンプル（賞金だけ）", catch: "中央の本賞金をそのまま合計。ボーナスなし、牡牝の内訳も自由。",
    picks: 10,
    rules: { ...legacyRules(false), preset: "simple" },
  },
  {
    id: "points", name: "ポイント制（着順）", catch: "賞金ではなく着順で点数。1着10点・2着5点…、重賞勝ちはさらにボーナス。",
    picks: 10,
    rules: {
      version: 1, preset: "points", male: null, female: null, base: "finish",
      finishPoints: [10, 5, 3, 2, 1], gradeBonus: { G1: 30, G2: 20, G3: 10 },
      nonJraRate: 100, excludeJump: false, bestN: null,
    },
  },
];

export const DEFAULT_PRESET = PRESETS[0];

const clampInt = (v: unknown, min: number, max: number, def: number) => {
  const n = Math.trunc(Number(v));
  return Number.isFinite(n) && n >= min && n <= max ? n : def;
};

/** 保存されている JSON を読み、足りない・おかしい値は初期値で埋める */
export function normalizeRules(raw: unknown, includeNonJra: boolean, picksPerMember: number): GroupRules {
  const base = legacyRules(includeNonJra);
  if (!raw || typeof raw !== "object") return base;
  const o = raw as Record<string, unknown>;
  const preset = (["standard", "simple", "points", "custom"] as const).find((p) => p === o.preset) ?? "custom";
  const fp = Array.isArray(o.finishPoints) ? o.finishPoints : base.finishPoints;
  const gb = (o.gradeBonus && typeof o.gradeBonus === "object" ? o.gradeBonus : {}) as Record<string, unknown>;
  let male: number | null = o.male == null ? null : clampInt(o.male, 0, picksPerMember, 0);
  let female: number | null = o.female == null ? null : clampInt(o.female, 0, picksPerMember, 0);
  if (male === null || female === null || male + female > picksPerMember) { male = null; female = null; }
  return {
    version: 1,
    preset,
    male, female,
    base: o.base === "finish" ? "finish" : "prize",
    finishPoints: [0, 1, 2, 3, 4].map((i) => clampInt(fp[i], 0, 1000, 0)),
    gradeBonus: { G1: clampInt(gb.G1, 0, 100000, 0), G2: clampInt(gb.G2, 0, 100000, 0), G3: clampInt(gb.G3, 0, 100000, 0) },
    nonJraRate: clampInt(o.nonJraRate, 0, 100, base.nonJraRate),
    excludeJump: o.excludeJump === true,
    bestN: o.bestN == null ? null : clampInt(o.bestN, 1, 50, 0) || null,
  };
}

/** 大会の行（groups）からルールを取り出す */
export function rulesOf(group: { rules?: unknown; include_non_jra: boolean; picks_per_member?: number }): GroupRules {
  return normalizeRules(group.rules ?? null, group.include_non_jra, group.picks_per_member ?? 50);
}

/** レース名から格を読む（netkeiba は「朝日杯FS(G1)」「全日本2歳優駿(Jpn1)」のように書く） */
export function gradeOf(raceName: string): Grade | null {
  const m = raceName.match(/[(（]\s*(?:J\.?\s*)?(?:G|Ｇ|Jpn|ＪＰＮ)\s*(1|2|3|Ⅰ|Ⅱ|Ⅲ|I{1,3})\s*[)）]/i);
  if (!m) return null;
  const v = m[1];
  if (v === "1" || v === "Ⅰ" || v === "I") return "G1";
  if (v === "2" || v === "Ⅱ" || v === "II") return "G2";
  return "G3";
}

export type RaceForScore = { prize_man: number; is_jra: boolean; finish: string | null; race_name?: string | null; surface?: string | null };

export type RaceScore = { points: number; bonus: number; grade: Grade | null; counted: boolean };

/** 1レースのポイント（期間のチェックは別） */
export function scoreRace(r: RaceForScore, rules: GroupRules): RaceScore {
  const grade = r.race_name ? gradeOf(r.race_name) : null;
  if (rules.excludeJump && (r.surface === "障" || /障害|ジャンプ|\bJ\.G/.test(r.race_name ?? ""))) {
    return { points: 0, bonus: 0, grade, counted: false };
  }
  const rate = r.is_jra ? 1 : rules.nonJraRate / 100;
  if (rate <= 0) return { points: 0, bonus: 0, grade, counted: false };
  const pos = Number(r.finish);
  const basePts = rules.base === "prize"
    ? r.prize_man
    : Number.isInteger(pos) && pos >= 1 && pos <= 5 ? rules.finishPoints[pos - 1] ?? 0 : 0;
  const bonus = grade && r.finish === "1" ? rules.gradeBonus[grade] : 0;
  return { points: round1((basePts + bonus) * rate), bonus: round1(bonus * rate), grade, counted: true };
}

export function pointUnit(rules: GroupRules): string {
  return rules.base === "prize" ? "万円" : "pt";
}

/** 「1人10頭（牡5・牝5）」のような説明の行 */
export function describeRules(group: { picks_per_member: number; season_start: string; season_end: string; crop_year: number }, rules: GroupRules): string[] {
  const fmt = (d: string) => { const [y, m, dd] = d.split("-"); return `${y}年${Number(m)}月${Number(dd)}日`; };
  const lines: string[] = [];
  lines.push(`${group.crop_year}年生まれ世代・1人${group.picks_per_member}頭${rules.male !== null ? `（牡馬${rules.male}頭・牝馬${rules.female}頭）` : ""}`);
  lines.push(`集計期間：${fmt(group.season_start)}〜${fmt(group.season_end)}`);
  if (rules.base === "prize") lines.push("ポイント：本賞金（万円）の合計");
  else lines.push(`ポイント：着順（${rules.finishPoints.map((p, i) => `${i + 1}着${p}`).filter((_, i) => rules.finishPoints[i] > 0).join("・")}）`);
  const u = pointUnit(rules);
  const gb = (["G1", "G2", "G3"] as Grade[]).filter((g) => rules.gradeBonus[g] > 0);
  if (gb.length) lines.push(`重賞勝ちボーナス：${gb.map((g) => `${g} +${rules.gradeBonus[g].toLocaleString()}${u}`).join("・")}`);
  lines.push(rules.nonJraRate >= 100 ? "地方・海外のレースも数える" : rules.nonJraRate <= 0 ? "中央（JRA）のレースだけ数える" : `地方・海外のレースは${rules.nonJraRate}%で数える`);
  if (rules.excludeJump) lines.push("障害レースは数えない");
  if (rules.bestN) lines.push(`順位は上位${rules.bestN}頭の合計で決める`);
  return lines;
}

/** 牡馬の枠に入るか（セン馬は牡馬扱い） */
export function sexSlot(sex: string | null | undefined): "male" | "female" | null {
  if (sex === "牝") return "female";
  if (sex === "牡" || sex === "セ") return "male";
  return null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

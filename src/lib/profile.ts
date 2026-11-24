// 種牡馬・厩舎・馬主・生産牧場の「名鑑」。今の世代の成績から能力値（1〜100）を出し、
// 二つ名と紹介文を組み立てる。能力値は同じ種類（種牡馬なら種牡馬どうし）の中での順位から付ける。
import type { GroupField, SireHorse, SireRace } from "./sires";
import type { Area } from "./area";

type Tally = Map<string, { points: number; starts: number; wins: number }>;

export type Metrics = {
  name: string;
  horses: number; starters: number; winners: number;
  runs: number; wins: number; places: number; points: number;
  turfRuns: number; turfWins: number; dirtRuns: number; dirtWins: number;
  placeDist: number | null;   // 3着以内に来たレースの平均距離
  earlyWins: number;          // 9月までの勝利数（仕上がりの早さ）
  top: { id: string; name: string; points: number } | null;
};

export type StatKey = "early" | "consistency" | "power" | "turf" | "dirt" | "place" | "tough";
export const STAT_LABELS: Record<StatKey, string> = {
  early: "仕上がり", consistency: "勝ち上がり", power: "稼ぐ力", turf: "芝", dirt: "ダート", place: "堅実さ", tough: "タフさ",
};
/** 各項目が何を見ているか（画面にそのまま出す） */
export const STAT_HELP: Record<StatKey, string> = {
  early: "2歳馬のうちデビューした割合と、6〜9月の勝ち星の多さ",
  consistency: "勝ち上がり率（出走した馬のうち1勝以上した割合）",
  power: "出走した馬1頭あたりの本賞金。高いほど大きいレースで稼いでいる",
  turf: "芝のレースでの勝率",
  dirt: "ダートのレースでの勝率",
  place: "3着以内に来た割合（出走回数あたり）",
  tough: "出走した馬1頭あたりの出走回数。多いほど休まず使えている",
};
/** 中央と地方で見る項目を変える（地方はほとんどダートなので、芝・ダートの代わりに堅実さ・タフさ） */
export const STAT_KEYS: Record<Area, StatKey[]> = {
  jra: ["early", "consistency", "power", "turf", "dirt"],
  nar: ["early", "consistency", "power", "place", "tough"],
};

/** 能力値の元になった実際の数字（「1頭あたり320万円」など） */
export function statValue(k: StatKey, g: Metrics): string | null {
  const r = (a: number, b: number) => (b > 0 ? `${((a / b) * 100).toFixed(1)}%` : null);
  switch (k) {
    case "early": return g.horses > 0 ? `デビュー${g.starters}/${g.horses}頭・夏${g.earlyWins}勝` : null;
    case "consistency": return g.starters > 0 ? `${g.winners}/${g.starters}頭（${r(g.winners, g.starters)}）` : null;
    case "power": return g.starters > 0 ? `1頭あたり${Math.round(g.points / g.starters).toLocaleString()}万円` : null;
    case "turf": return g.turfRuns > 0 ? `勝率${r(g.turfWins, g.turfRuns)}（${g.turfRuns}戦）` : null;
    case "dirt": return g.dirtRuns > 0 ? `勝率${r(g.dirtWins, g.dirtRuns)}（${g.dirtRuns}戦）` : null;
    case "place": return g.runs > 0 ? `${r(g.places, g.runs)}（${g.runs}戦）` : null;
    case "tough": return g.starters > 0 ? `1頭あたり${(g.runs / g.starters).toFixed(1)}戦` : null;
  }
}

export type Profile = {
  m: Metrics;
  winRate: number | null;       // 勝率（1着数 ÷ 出走回数、%）
  scores: Record<StatKey, number | null>; // 1〜100。データが足りなければ null
  distance: number | null;      // 得意な距離の目安（m）
  nick?: string;                // 二つ名（一覧の中で重ならないもの）
  aptSource?: "offspring" | "career" | null; // 種牡馬の芝・ダート・距離をどこから出したか
};

const pct = (a: number, b: number) => (b > 0 ? (a / b) * 100 : null);

/** 馬・成績から、名前ごとの数字を数える */
export function computeMetrics(horses: SireHorse[], tally: Tally, races: SireRace[], field: GroupField): Map<string, Metrics> {
  const m = new Map<string, Metrics>();
  const keyOf = new Map<string, string>();
  const empty = (name: string): Metrics => ({
    name, horses: 0, starters: 0, winners: 0, runs: 0, wins: 0, places: 0, points: 0,
    turfRuns: 0, turfWins: 0, dirtRuns: 0, dirtWins: 0, placeDist: null, earlyWins: 0, top: null,
  });
  for (const h of horses) {
    const k = h[field];
    if (!k) continue;
    keyOf.set(h.id, k);
    const g = m.get(k) ?? empty(k);
    g.horses++;
    const t = tally.get(h.id);
    if (t && t.starts > 0) g.starters++;
    if (t && t.wins > 0) g.winners++;
    if (t) {
      g.points += t.points;
      if (t.points > 0 && (!g.top || t.points > g.top.points)) g.top = { id: h.id, name: h.name, points: t.points };
    }
    m.set(k, g);
  }
  const distSum = new Map<string, { sum: number; n: number }>();
  for (const r of races) {
    const k = keyOf.get(r.horse_id);
    if (!k) continue;
    const g = m.get(k)!;
    const win = r.finish === "1";
    const place = ["1", "2", "3"].includes(r.finish ?? "");
    g.runs++;
    if (win) g.wins++;
    if (place) g.places++;
    if (r.surface === "芝") { g.turfRuns++; if (win) g.turfWins++; }
    if (r.surface === "ダ") { g.dirtRuns++; if (win) g.dirtWins++; }
    if (win && Number(r.race_date.slice(5, 7)) <= 9 && Number(r.race_date.slice(5, 7)) >= 6) g.earlyWins++;
    if (place && r.distance) {
      const d = distSum.get(k) ?? { sum: 0, n: 0 };
      d.sum += r.distance; d.n++;
      distSum.set(k, d);
    }
  }
  for (const [k, d] of distSum) if (d.n >= 2) m.get(k)!.placeDist = Math.round(d.sum / d.n);
  for (const g of m.values()) g.points = Math.round(g.points * 10) / 10;
  return m;
}

/** 値の並びの中での位置を 1〜100 に */
function ranker(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  return (v: number) => {
    if (sorted.length < 2) return 50;
    let lo = 0;
    while (lo < sorted.length && sorted[lo] < v) lo++;
    let hi = lo;
    while (hi < sorted.length && sorted[hi] === v) hi++;
    const p = ((lo + hi - 1) / 2) / (sorted.length - 1);
    return Math.max(1, Math.min(100, Math.round(p * 99) + 1));
  };
}

/** 前の世代の芝・ダート・距離の数字を足す（適性は世代をまたいで見たほうが確か） */
export function addSurfaceHistory(cur: Map<string, Metrics>, prev: Map<string, Metrics>) {
  for (const [k, g] of cur) {
    const p = prev.get(k);
    if (!p) continue;
    g.turfRuns += p.turfRuns; g.turfWins += p.turfWins; g.dirtRuns += p.dirtRuns; g.dirtWins += p.dirtWins;
    if (g.placeDist === null) g.placeDist = p.placeDist;
  }
}

/** 名前ごとの能力値を出す。少なすぎる数字では順位を付けない */
export function scoreProfiles(metrics: Map<string, Metrics>): Map<string, Profile> {
  const all = [...metrics.values()];
  const make = (ok: (g: Metrics) => boolean, val: (g: Metrics) => number) => {
    const r = ranker(all.filter(ok).map(val));
    return (g: Metrics) => (ok(g) ? r(val(g)) : null);
  };
  const early = make((g) => g.horses >= 3, (g) => g.starters / g.horses + g.earlyWins / Math.max(1, g.horses));
  const consistency = make((g) => g.starters >= 3, (g) => g.winners / g.starters);
  const power = make((g) => g.starters >= 3, (g) => g.points / g.starters);
  const place = make((g) => g.runs >= 10, (g) => g.places / g.runs);
  const tough = make((g) => g.starters >= 3, (g) => g.runs / g.starters);
  const turf = make((g) => g.turfRuns >= 5, (g) => g.turfWins / g.turfRuns + (g.turfRuns / Math.max(1, g.runs)) * 0.1);
  const dirt = make((g) => g.dirtRuns >= 5, (g) => g.dirtWins / g.dirtRuns + (g.dirtRuns / Math.max(1, g.runs)) * 0.1);
  const out = new Map<string, Profile>();
  for (const g of all) {
    out.set(g.name, {
      m: g,
      winRate: pct(g.wins, g.runs),
      scores: { early: early(g), consistency: consistency(g), power: power(g), turf: turf(g), dirt: dirt(g), place: place(g), tough: tough(g) },
      distance: g.placeDist,
    });
  }
  return out;
}

export const grade = (v: number | null) =>
  v === null ? "-" : v >= 95 ? "S" : v >= 80 ? "A" : v >= 60 ? "B" : v >= 40 ? "C" : v >= 20 ? "D" : "E";

export function distanceLabel(d: number | null) {
  if (d === null) return null;
  return d < 1300 ? "短距離" : d < 1700 ? "マイル" : d < 2100 ? "中距離" : "長距離";
}

const NOUN: Record<GroupField, string> = { sire: "産駒", trainer: "管理馬", owner: "所有馬", breeder: "生産馬" };

/** 二つ名（いちばん目立つ持ち味から） */
export function nickname(field: GroupField, p: Profile): string {
  const s = p.scores;
  const dist = distanceLabel(p.distance);
  const isDirt = (s.dirt ?? 0) >= 70 && (s.dirt ?? 0) > (s.turf ?? 0) + 15;
  const isTurf = (s.turf ?? 0) >= 70 && (s.turf ?? 0) > (s.dirt ?? 0) + 15;
  const ground = isDirt ? "砂の" : isTurf ? "芝の" : "";
  if ((s.power ?? 0) >= 90 && (s.consistency ?? 0) >= 80) return `${ground}二刀流の大将`;
  if ((s.power ?? 0) >= 85) return `${ground}${dist === "短距離" ? "快速の大砲" : dist === "長距離" ? "遅咲きの大物釣り" : "一撃必殺"}`;
  if ((s.early ?? 0) >= 85 && (s.consistency ?? 0) >= 70) return `${ground}早仕掛けの量産型`;
  if ((s.early ?? 0) >= 85) return `${ground}夏から動く先行逃げ切り`;
  if ((s.consistency ?? 0) >= 80) return `${ground}外さない職人`;
  if ((s.early ?? 100) <= 25 && p.m.horses >= 5) return `${ground}じっくり大器晩成`;
  if (isDirt) return field === "sire" ? "ダートの申し子" : "砂の仕事人";
  if (isTurf) return dist ? `芝${dist}の使い手` : "芝の使い手";
  if ((s.consistency ?? 100) <= 25) return "これからの巻き返し待ち";
  return "伸びしろを秘めた中堅";
}

/** データから作る紹介文（2〜4文）。名鑑の「列伝」に足す */
export function profileLines(field: GroupField, label: string, p: Profile, avgWinRate: number | null): string[] {
  const g = p.m, s = p.scores, noun = NOUN[field];
  const out: string[] = [];
  if (g.starters === 0) {
    out.push(`今年の2歳${noun}${g.horses}頭は、まだ誰もデビューしていない。腕前が明らかになるのはこれから。`);
    return out;
  }
  const surface =
    g.turfRuns + g.dirtRuns >= 6
      ? g.dirtRuns > g.turfRuns * 1.5 ? "ダートを主戦場に" : g.turfRuns > g.dirtRuns * 1.5 ? "芝を主戦場に" : "芝・ダートを問わず"
      : null;
  const dist = distanceLabel(p.distance);
  if (surface || dist) out.push(`${noun}は${surface ?? ""}${dist ? `${surface ? "、" : ""}${dist}（平均${p.distance}m前後）で好走が多い` : "走っている"}。`);
  if (s.early !== null) {
    out.push(s.early >= 70 ? `仕上がりが早く、夏の新馬戦から次々とデビューさせてくる。POGの前半戦で頼れるタイプだ。`
      : s.early <= 30 ? `デビューはゆっくりめ。秋から年明けにかけて本領を発揮する、じっくり型と見たい。`
      : `デビューのペースは平均的。夏から春までまんべんなくポイントを運んでくる。`);
  }
  if (p.winRate !== null && g.runs >= 10) {
    const vs = avgWinRate !== null ? (p.winRate >= avgWinRate + 2 ? "全体平均を上回る" : p.winRate <= avgWinRate - 2 ? "全体平均には届かない" : "全体平均並みの") : "";
    out.push(`勝率は${p.winRate.toFixed(1)}%と${vs}数字${(s.power ?? 0) >= 80 ? "で、当たったときの賞金も大きい" : (s.consistency ?? 0) >= 80 ? "で、とにかく外しにくい" : ""}。`);
  }
  return out;
}

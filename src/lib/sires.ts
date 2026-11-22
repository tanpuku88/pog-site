// 種牡馬ごとの集計（世代単位）。
import type { SupabaseClient } from "@supabase/supabase-js";
import { countPicks, tallyResults, withRanks } from "./popular";
import { countsForRules, isThisWeek, type ResultRow, type Rules } from "./standings";
import { earnedPrize } from "./horse-summary";

export type SireHorse = {
  id: string; name: string; sex: string | null; sire: string | null; dam: string | null; damsire: string | null; trainer: string | null;
  owner?: string | null; breeder?: string | null;
  /** セリの落札価格・一口クラブの募集総額（万円） */
  sale_price_man?: number | null; sale_name?: string | null; club_price_man?: number | null; sale_checked_at?: string | null;
};

/** 何でまとめるか（種牡馬・厩舎・馬主・生産牧場） */
export type GroupField = "sire" | "trainer" | "owner" | "breeder";

export type SireRow = {
  sire: string;
  horses: number;    // 産駒数（このサイトに登録されている数）
  picks: number;     // 産駒の延べ指名数
  starters: number;  // 出走した頭数
  winners: number;   // 勝ち上がった頭数
  points: number;    // 本賞金の合計（万円）
  top: { id: string; name: string; points: number } | null; // 稼ぎ頭
};

type Tally = Map<string, { points: number; starts: number; wins: number }>;

/** 産駒を種牡馬ごとにまとめる（純粋な計算） */
export function aggregateSires(horses: SireHorse[], picks: Map<string, number>, tally: Tally, field: GroupField = "sire"): SireRow[] {
  const m = new Map<string, SireRow>();
  for (const h of horses) {
    const key = h[field];
    if (!key) continue;
    const r = m.get(key) ?? { sire: key, horses: 0, picks: 0, starters: 0, winners: 0, points: 0, top: null };
    const t = tally.get(h.id);
    r.horses += 1;
    r.picks += picks.get(h.id) ?? 0;
    if (t && t.starts > 0) r.starters += 1;
    if (t && t.wins > 0) r.winners += 1;
    if (t) {
      r.points += t.points;
      if (t.points > 0 && (!r.top || t.points > r.top.points)) r.top = { id: h.id, name: h.name, points: t.points };
    }
    m.set(key, r);
  }
  for (const r of m.values()) r.points = Math.round(r.points * 10) / 10;
  return [...m.values()];
}

const PAGE = 1000;

async function pageAll<T>(q: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await q(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...(data ?? []));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

const CHUNK = 150;

/**
 * 世代の馬・指名・成績をまとめて読む。
 * only を渡すと、その種牡馬・厩舎・馬主・生産牧場の馬だけを読む（個別ページ用に軽く）。
 */
export async function loadCropData(db: SupabaseClient, cropYear: number, rules: Rules, only?: { field: GroupField; value: string }) {
  const cols = "id, name, sex, sire, dam, damsire, trainer, owner, breeder, sale_price_man, sale_name, club_price_man, sale_checked_at";
  const horses = await pageAll<SireHorse>((a, b) => {
    let q = db.from("horses").select(cols).eq("birth_year", cropYear);
    if (only) q = q.eq(only.field, only.value);
    return q.order("id").range(a, b);
  });
  type R = ResultRow & { race_name: string; surface?: string | null; distance?: number | null };
  const resultCols = "horse_id, race_date, prize_man, is_jra, finish, race_name, surface, distance";
  let pickRows: { horse_id: string }[];
  let results: R[];
  if (only) {
    // 対象の馬が少ないので、馬IDで絞って読む
    const idList = horses.map((h) => h.id);
    const chunks: string[][] = [];
    for (let i = 0; i < idList.length; i += CHUNK) chunks.push(idList.slice(i, i + CHUNK));
    const parts = await Promise.all(chunks.map(async (ids) => {
      const [p, r] = await Promise.all([
        pageAll<{ horse_id: string }>((a, b) => db.from("picks").select("horse_id").in("horse_id", ids).order("group_id").order("horse_id").range(a, b)),
        pageAll<R>((a, b) => db.from("race_results").select(resultCols).in("horse_id", ids)
          .gte("race_date", rules.season_start).lte("race_date", rules.season_end)
          .order("horse_id").order("race_date").range(a, b)),
      ]);
      return { p, r };
    }));
    pickRows = parts.flatMap((x) => x.p);
    results = parts.flatMap((x) => x.r);
  } else {
    [pickRows, results] = await Promise.all([
      pageAll<{ horse_id: string }>((a, b) => db.from("picks").select("horse_id").order("group_id").order("horse_id").range(a, b)),
      pageAll<R>((a, b) =>
        db.from("race_results").select(resultCols)
          .gte("race_date", rules.season_start).lte("race_date", rules.season_end)
          .order("horse_id").order("race_date").range(a, b)),
    ]);
  }
  const ids = new Set(horses.map((h) => h.id));
  const picks = countPicks(pickRows.map((p) => p.horse_id).filter((id) => ids.has(id)));
  const mine = results.filter((r) => ids.has(r.horse_id)).map((r) => ({ ...r, prize_man: Number(r.prize_man) }));
  const tally = tallyResults(mine, rules);
  const races: SireRace[] = mine.filter((r) => countsForRules(r, rules));
  return { horses, picks, tally, races };
}

// ---- 詳しい表（戦績・勝率・収得賞金・先週・AEI・順位の変動） ----

export type SireRace = {
  horse_id: string; race_date: string; race_name: string; finish: string | null; prize_man: number; is_jra: boolean;
  surface?: string | null; distance?: number | null;
};

export type SireStats = SireRow & {
  runs: number;                               // 出走回数
  record: [number, number, number, number];   // [1着,2着,3着,着外]
  winRate: number;                            // 勝率（%）
  winnerRate: number | null;                  // 勝ち上がり率（勝った頭数 ÷ 出走した頭数、%）
  earned: number;                             // 収得賞金の目安（万円）
  lastWeek: number;                           // 直近7日の賞金（万円）
  aei: number | null;                         // 1出走頭数あたり賞金 ÷ 全体の1出走頭数あたり賞金
  change: number;                             // 先週からの順位変動（+は上昇）
  topSex: string | null;
};

/** 種牡馬ごとの詳しい成績をまとめ、賞金順に並べて順位と変動を付ける（純粋な計算） */
export function sireTable(
  horses: SireHorse[], picks: Map<string, number>, tally: Tally, races: SireRace[], today: string, field: GroupField = "sire",
): (SireStats & { rank: number })[] {
  const base = aggregateSires(horses, picks, tally, field);
  const sireOf = new Map(horses.map((h) => [h.id, h[field] ?? null]));
  const sexOf = new Map(horses.map((h) => [h.id, h.sex]));
  const extra = new Map<string, { runs: number; record: [number, number, number, number]; earned: number; lastWeek: number }>();
  const byHorse = new Map<string, SireRace[]>();
  for (const r of races) {
    const sire = sireOf.get(r.horse_id);
    if (!sire) continue;
    const e = extra.get(sire) ?? { runs: 0, record: [0, 0, 0, 0] as [number, number, number, number], earned: 0, lastWeek: 0 };
    e.runs += 1;
    const n = Number(r.finish);
    if (n >= 1 && n <= 3) e.record[n - 1]++; else e.record[3]++;
    if (isThisWeek(r.race_date, today)) e.lastWeek += r.prize_man;
    extra.set(sire, e);
    byHorse.set(r.horse_id, [...(byHorse.get(r.horse_id) ?? []), r]);
  }
  for (const [id, rs] of byHorse) {
    const e = extra.get(sireOf.get(id)!)!;
    e.earned += earnedPrize(rs);
  }

  const totalPoints = base.reduce((s, r) => s + r.points, 0);
  const totalStarters = base.reduce((s, r) => s + r.starters, 0);
  const avg = totalStarters > 0 ? totalPoints / totalStarters : 0;

  const rows: SireStats[] = base.map((r) => {
    const e = extra.get(r.sire) ?? { runs: 0, record: [0, 0, 0, 0] as [number, number, number, number], earned: 0, lastWeek: 0 };
    return {
      ...r,
      runs: e.runs,
      record: e.record,
      winRate: e.runs > 0 ? Math.round((e.record[0] / e.runs) * 1000) / 10 : 0,
      winnerRate: r.starters > 0 ? Math.round((r.winners / r.starters) * 1000) / 10 : null,
      earned: e.earned,
      lastWeek: Math.round(e.lastWeek * 10) / 10,
      aei: avg > 0 && r.starters > 0 ? Math.round((r.points / r.starters / avg) * 100) / 100 : null,
      change: 0,
      topSex: r.top ? sexOf.get(r.top.id) ?? null : null,
    };
  });

  const order = (key: (r: SireStats) => number) =>
    withRanks([...rows].sort((a, b) => key(b) - key(a) || b.horses - a.horses || a.sire.localeCompare(b.sire)), key);
  const prev = new Map(order((r) => r.points - r.lastWeek).map((r) => [r.sire, r.rank]));
  return order((r) => r.points).map((r) => ({ ...r, change: r.points > 0 && r.lastWeek > 0 ? (prev.get(r.sire) ?? r.rank) - r.rank : 0 }));
}

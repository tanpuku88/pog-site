// 世代全体の「人気馬（指名数）」と「賞金ランキング」。
// 他グループの指名も数えるため、サーバー側で service role を使って集計する。
// 画面に出すのは頭数と馬の情報だけで、誰が指名したかは出さない。
import type { SupabaseClient } from "@supabase/supabase-js";
import { countsForRules, type ResultRow, type Rules } from "./standings";
import type { Horse } from "./group-data";

export type PopularRow = {
  rank: number;
  horse: Horse;
  picks: number;
  /** 直近7日に増えた指名 */
  weekPicks: number;
  /** 7日前の順位（その時点で指名ゼロなら null ＝ 初登場） */
  prevRank: number | null;
  points: number;
  starts: number;
  wins: number;
};

type BaseRow = Omit<PopularRow, "rank" | "prevRank"> & { prevPicks: number };

export type BoardSort = "picks" | "prize";
export type BoardSex = "all" | "牡" | "牝";

const PAGE = 1000;
const CHUNK = 200;
const WEEK = 7 * 86400 * 1000;

/** 同点は同じ順位（1, 2, 2, 4 …） */
export function withRanks<T>(rows: T[], key: (r: T) => number): (T & { rank: number })[] {
  let prev: number | null = null;
  let rank = 0;
  return rows.map((r, i) => {
    const v = key(r);
    if (v !== prev) rank = i + 1;
    prev = v;
    return { ...r, rank };
  });
}

/** 指名数を数える */
export function countPicks(horseIds: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const id of horseIds) m.set(id, (m.get(id) ?? 0) + 1);
  return m;
}

/** 馬ごとの賞金・出走数・勝利数を数える */
export function tallyResults(results: ResultRow[], rules: Rules) {
  const m = new Map<string, { points: number; starts: number; wins: number }>();
  for (const r of results) {
    if (!countsForRules(r, rules)) continue;
    const t = m.get(r.horse_id) ?? { points: 0, starts: 0, wins: 0 };
    t.points += r.prize_man;
    t.starts += 1;
    if (r.finish === "1") t.wins += 1;
    m.set(r.horse_id, t);
  }
  for (const t of m.values()) t.points = Math.round(t.points * 10) / 10;
  return m;
}

export type PickRow = { horse_id: string; created_at: string };

/** 馬ごとに「今の指名数・7日前の指名数・直近7日の指名数」を数える */
export function countPicksWithWeek(picks: PickRow[], now: Date) {
  const cut = now.getTime() - WEEK;
  const m = new Map<string, { picks: number; prevPicks: number; weekPicks: number }>();
  for (const p of picks) {
    const t = m.get(p.horse_id) ?? { picks: 0, prevPicks: 0, weekPicks: 0 };
    t.picks += 1;
    if (Date.parse(p.created_at) < cut) t.prevPicks += 1;
    else t.weekPicks += 1;
    m.set(p.horse_id, t);
  }
  return m;
}

const byName = (a: BaseRow, b: BaseRow) => a.horse.name.localeCompare(b.horse.name, "ja");

function toRow(r: BaseRow & { rank: number }, prevRank: number | null): PopularRow {
  return { rank: r.rank, horse: r.horse, picks: r.picks, weekPicks: r.weekPicks, prevRank, points: r.points, starts: r.starts, wins: r.wins };
}

/** 絞り込み・並べ替えをして順位と前週の順位をつける */
export function rankBoard(rows: BaseRow[], opts: { sort?: BoardSort; sex?: BoardSex; limit?: number } = {}): PopularRow[] {
  const { sort = "picks", sex = "all", limit = 30 } = opts;
  const pool = rows.filter((r) => sex === "all" || r.horse.sex === sex || (sex === "牡" && r.horse.sex === "セ"));
  if (sort === "prize") {
    const ranked = withRanks(
      pool.filter((r) => r.points > 0).sort((a, b) => b.points - a.points || b.wins - a.wins || b.picks - a.picks || byName(a, b)),
      (r) => r.points,
    );
    // 賞金順は前週の比較をしない（毎週の成績で大きく動くため）
    return ranked.slice(0, limit).map((r) => toRow(r, null));
  }
  const prev = new Map(
    withRanks(pool.filter((r) => r.prevPicks > 0).sort((a, b) => b.prevPicks - a.prevPicks || byName(a, b)), (r) => r.prevPicks)
      .map((r) => [r.horse.id, r.rank]),
  );
  const ranked = withRanks(
    [...pool].sort((a, b) => b.picks - a.picks || b.points - a.points || byName(a, b)),
    (r) => r.picks,
  );
  return ranked.slice(0, limit).map((r) => toRow(r, prev.get(r.horse.id) ?? null));
}

/** 直近7日で指名が増えた馬 */
export function risingHorses(rows: BaseRow[], limit = 5) {
  return rows
    .filter((r) => r.weekPicks > 0)
    .sort((a, b) => b.weekPicks - a.weekPicks || b.picks - a.picks || byName(a, b))
    .slice(0, limit);
}

/** 父ごとの指名数（人気の種牡馬） */
export function popularSires(rows: BaseRow[], limit = 10) {
  const m = new Map<string, { sire: string; picks: number; horses: number; top: BaseRow }>();
  for (const r of rows) {
    const s = r.horse.sire;
    if (!s) continue;
    const t = m.get(s) ?? { sire: s, picks: 0, horses: 0, top: r };
    t.picks += r.picks;
    t.horses += 1;
    if (r.picks > t.top.picks) t.top = r;
    m.set(s, t);
  }
  return withRanks(
    [...m.values()].sort((a, b) => b.picks - a.picks || b.horses - a.horses || a.sire.localeCompare(b.sire, "ja")),
    (r) => r.picks,
  ).slice(0, limit);
}

async function allPicks(db: SupabaseClient): Promise<PickRow[]> {
  const out: PickRow[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db
      .from("picks")
      .select("horse_id, created_at")
      .order("group_id")
      .order("horse_id")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    out.push(...((data ?? []) as PickRow[]));
    if (!data || data.length < PAGE) break;
  }
  return out;
}

async function chunked<T>(ids: string[], f: (part: string[]) => Promise<T[]>): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += CHUNK) out.push(...(await f(ids.slice(i, i + CHUNK))));
  return out;
}

/** 世代の人気馬と賞金ランキングの元データ（指名されたことのある馬すべて） */
export async function loadGenerationBoard(db: SupabaseClient, cropYear: number, rules: Rules, limit = 30, now = new Date()) {
  const pickCounts = countPicksWithWeek(await allPicks(db), now);

  // 指名されたことのある、この世代の馬
  const horses = await chunked([...pickCounts.keys()], async (part) => {
    const { data, error } = await db.from("horses").select("*").in("id", part).eq("birth_year", cropYear);
    if (error) throw error;
    return (data ?? []) as Horse[];
  });
  const horseMap = new Map(horses.map((h) => [h.id, h]));

  const results = await chunked([...horseMap.keys()], async (part) => {
    const { data, error } = await db
      .from("race_results")
      .select("horse_id, race_date, prize_man, is_jra, finish")
      .in("horse_id", part)
      .gte("race_date", rules.season_start)
      .lte("race_date", rules.season_end);
    if (error) throw error;
    return (data ?? []).map((r) => ({ ...r, prize_man: Number(r.prize_man) })) as ResultRow[];
  });
  const tally = tallyResults(results, rules);

  // この世代の大会の数（指名率の分母）
  const { count: groupCount } = await db.from("groups").select("id", { count: "exact", head: true }).eq("crop_year", cropYear);

  const rows: BaseRow[] = horses.map((horse) => ({
    horse,
    ...(pickCounts.get(horse.id) ?? { picks: 0, prevPicks: 0, weekPicks: 0 }),
    ...(tally.get(horse.id) ?? { points: 0, starts: 0, wins: 0 }),
  }));

  return {
    rows,
    byPicks: rankBoard(rows, { sort: "picks", limit }),
    byPrize: rankBoard(rows, { sort: "prize", limit }),
    totalHorses: horses.length,
    totalPicks: rows.reduce((s, r) => s + r.picks, 0),
    weekPicks: rows.reduce((s, r) => s + r.weekPicks, 0),
    groupCount: groupCount ?? 0,
  };
}

export type GenerationBoard = Awaited<ReturnType<typeof loadGenerationBoard>>;

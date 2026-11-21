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
  points: number;
  starts: number;
  wins: number;
};

const PAGE = 1000;
const CHUNK = 200;

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

async function allPickedHorseIds(db: SupabaseClient): Promise<string[]> {
  const ids: string[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db.from("picks").select("horse_id").order("group_id").order("horse_id").range(from, from + PAGE - 1);
    if (error) throw error;
    ids.push(...(data ?? []).map((r) => r.horse_id as string));
    if (!data || data.length < PAGE) break;
  }
  return ids;
}

async function chunked<T>(ids: string[], f: (part: string[]) => Promise<T[]>): Promise<T[]> {
  const out: T[] = [];
  for (let i = 0; i < ids.length; i += CHUNK) out.push(...(await f(ids.slice(i, i + CHUNK))));
  return out;
}

/** 世代の人気馬と賞金ランキング（上位 limit 頭ずつ） */
export async function loadGenerationBoard(db: SupabaseClient, cropYear: number, rules: Rules, limit = 30) {
  const pickCounts = countPicks(await allPickedHorseIds(db));

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

  const rows = horses.map((horse) => ({
    horse,
    picks: pickCounts.get(horse.id) ?? 0,
    ...(tally.get(horse.id) ?? { points: 0, starts: 0, wins: 0 }),
  }));

  const byPicks = withRanks(
    [...rows].sort((a, b) => b.picks - a.picks || b.points - a.points || a.horse.name.localeCompare(b.horse.name, "ja")),
    (r) => r.picks,
  ).slice(0, limit);
  const byPrize = withRanks(
    rows.filter((r) => r.points > 0).sort((a, b) => b.points - a.points || b.wins - a.wins || b.picks - a.picks),
    (r) => r.points,
  ).slice(0, limit);

  return { byPicks, byPrize, totalHorses: horses.length, totalPicks: rows.reduce((s, r) => s + r.picks, 0) };
}

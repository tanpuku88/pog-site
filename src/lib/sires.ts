// 種牡馬ごとの集計（世代単位）。
import type { SupabaseClient } from "@supabase/supabase-js";
import { countPicks, tallyResults } from "./popular";
import type { ResultRow, Rules } from "./standings";

export type SireHorse = { id: string; name: string; sex: string | null; sire: string | null; dam: string | null; damsire: string | null; trainer: string | null };

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
export function aggregateSires(horses: SireHorse[], picks: Map<string, number>, tally: Tally): SireRow[] {
  const m = new Map<string, SireRow>();
  for (const h of horses) {
    if (!h.sire) continue;
    const r = m.get(h.sire) ?? { sire: h.sire, horses: 0, picks: 0, starters: 0, winners: 0, points: 0, top: null };
    const t = tally.get(h.id);
    r.horses += 1;
    r.picks += picks.get(h.id) ?? 0;
    if (t && t.starts > 0) r.starters += 1;
    if (t && t.wins > 0) r.winners += 1;
    if (t) {
      r.points += t.points;
      if (t.points > 0 && (!r.top || t.points > r.top.points)) r.top = { id: h.id, name: h.name, points: t.points };
    }
    m.set(h.sire, r);
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

/** 世代の馬・指名・成績をまとめて読む */
export async function loadCropData(db: SupabaseClient, cropYear: number, rules: Rules) {
  const [horses, pickRows, results] = await Promise.all([
    pageAll<SireHorse>((a, b) =>
      db.from("horses").select("id, name, sex, sire, dam, damsire, trainer").eq("birth_year", cropYear).order("id").range(a, b)),
    pageAll<{ horse_id: string }>((a, b) => db.from("picks").select("horse_id").order("group_id").order("horse_id").range(a, b)),
    pageAll<ResultRow>((a, b) =>
      db.from("race_results").select("horse_id, race_date, prize_man, is_jra, finish")
        .gte("race_date", rules.season_start).lte("race_date", rules.season_end)
        .order("horse_id").order("race_date").range(a, b)),
  ]);
  const ids = new Set(horses.map((h) => h.id));
  const picks = countPicks(pickRows.map((p) => p.horse_id).filter((id) => ids.has(id)));
  const tally = tallyResults(results.filter((r) => ids.has(r.horse_id)).map((r) => ({ ...r, prize_man: Number(r.prize_man) })), rules);
  return { horses, picks, tally };
}

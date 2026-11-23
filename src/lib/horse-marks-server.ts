// 馬のアイコン（指名・済・人気）に使う集計をデータベースから読む。サーバー専用。
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";
import { allPicks, countPicks } from "@/lib/popular";
import { popularIds, POPULAR_MIN_PICKS, type HorseMarks } from "@/lib/horse-marks";

/** サイト全体の人気馬（世代ごとに数える。1回の表示で1度だけ） */
export const loadPopularIds = cache(async function loadPopularIds(): Promise<Set<string>> {
  try {
    const db = createAdminClient();
    const counts = countPicks((await allPicks(db)).map((p) => p.horse_id));
    // 候補（3大会以上で指名）の生まれ年を調べ、世代ごとに上位を選ぶ
    const ids = [...counts].filter(([, n]) => n >= POPULAR_MIN_PICKS).map(([id]) => id);
    const byYear = new Map<number, Map<string, number>>();
    for (let i = 0; i < ids.length; i += 200) {
      const { data } = await db.from("horses").select("id, birth_year").in("id", ids.slice(i, i + 200));
      for (const h of data ?? []) {
        const y = (h.birth_year as number | null) ?? 0;
        const m = byYear.get(y) ?? new Map<string, number>();
        m.set(h.id as string, counts.get(h.id as string) ?? 0);
        byYear.set(y, m);
      }
    }
    return new Set([...byYear.values()].flatMap((m) => [...popularIds(m)]));
  } catch {
    return new Set();
  }
});

/** ログイン中の人がどれかの大会で指名している馬 */
export const loadMyPickIds = cache(async function loadMyPickIds(): Promise<Set<string>> {
  try {
    const { supabase, user } = await getUser();
    if (!user) return new Set();
    const { data } = await supabase.from("picks").select("horse_id").eq("user_id", user.id);
    return new Set((data ?? []).map((p) => p.horse_id as string));
  } catch {
    return new Set();
  }
});

/** 大会の中の一覧用：自分の指名（★指）と人気だけ。全頭がだれかの指名馬なので「済」は付けない */
export async function groupBoardMarks(picks: { user_id: string; horse_id: string }[], userId: string): Promise<HorseMarks> {
  const popular = await loadPopularIds();
  return { popular, mine: new Set(picks.filter((p) => p.user_id === userId).map((p) => p.horse_id)) };
}

/**
 * 一覧に出すアイコンの情報をまとめて読む。
 * groupId を渡すと、その大会でほかの人が指名済みの馬（済）と、自分の指名（その大会のみ）を見る。
 */
export async function loadHorseMarks(opts: { groupId?: string } = {}): Promise<HorseMarks> {
  const [popular, mineAll] = await Promise.all([loadPopularIds(), loadMyPickIds()]);
  if (!opts.groupId) return { popular, mine: mineAll };
  try {
    const { supabase, user } = await getUser();
    const { data } = await supabase.from("picks").select("horse_id, user_id").eq("group_id", opts.groupId);
    const mine = new Set<string>();
    const taken = new Set<string>();
    for (const p of data ?? []) (p.user_id === user?.id ? mine : taken).add(p.horse_id as string);
    return { popular, mine, taken };
  } catch {
    return { popular, mine: mineAll };
  }
}

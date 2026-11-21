// 誰でも見られる馬ページ用のデータ。ログインに関係なく同じ内容なので、1時間キャッシュして軽くする。
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { todayJst } from "@/lib/util";

export { horseDescription, isHorseId } from "@/lib/seo";

export type { PublicHorse } from "@/lib/seo";
import type { PublicHorse } from "@/lib/seo";
export type PublicResult = { race_date: string; venue: string; race_name: string; race_id: string | null; finish: string | null; prize_man: number; is_jra: boolean };
export type PublicEntry = { race_id: string; race_date: string; venue: string | null; race_no: number | null; race_name: string | null; post_time: string | null };


export const loadPublicHorse = unstable_cache(
  async (id: string) => {
    const db = createAdminClient();
    const [{ data: horse }, { data: results }, { data: entries }, { count: picks }] = await Promise.all([
      db.from("horses").select("id, name, sex, birth_year, sire, dam, damsire, trainer, owner, breeder, updated_at").eq("id", id).maybeSingle<PublicHorse>(),
      db.from("race_results").select("race_date, venue, race_name, race_id, finish, prize_man, is_jra").eq("horse_id", id).order("race_date", { ascending: false }),
      db.from("entries").select("race_id, race_date, venue, race_no, race_name, post_time").eq("horse_id", id).gte("race_date", todayJst()).order("race_date"),
      db.from("picks").select("horse_id", { count: "exact", head: true }).eq("horse_id", id),
    ]);
    if (!horse) return null;
    const siblings = horse.dam
      ? (await db.from("horses").select("id, name, birth_year, sire").eq("dam", horse.dam).neq("id", id).order("birth_year", { ascending: false }).limit(10)).data ?? []
      : [];
    return {
      horse,
      results: ((results ?? []) as PublicResult[]).map((r) => ({ ...r, prize_man: Number(r.prize_man) })),
      entries: (entries ?? []) as PublicEntry[],
      picks: picks ?? 0,
      siblings: siblings as { id: string; name: string; birth_year: number | null; sire: string | null }[],
    };
  },
  ["public-horse"],
  { revalidate: 3600 },
);

import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchAllResults, type Group, type Horse } from "@/lib/group-data";
import { computeStandings } from "@/lib/standings";
import { verifyShare } from "@/lib/share";
import { todayJst } from "@/lib/util";

/**
 * 公開シェアページ用のデータ。署名が正しいときだけ、ログインなしで大会の順位と指名馬を読む。
 * 招待コードなど参加に必要な情報は返さない。
 */
export const loadShare = cache(async function loadShare(groupId: string, who: string, sig: string) {
  if (!verifyShare({ groupId, who }, sig)) return null;
  const db = createAdminClient();
  const { data: group } = await db
    .from("groups")
    .select("id, name, owner_id, crop_year, picks_per_member, season_start, season_end, include_non_jra, rules")
    .eq("id", groupId)
    .maybeSingle<Omit<Group, "invite_code">>();
  if (!group) return null;

  const [{ data: members }, { data: picks }] = await Promise.all([
    db.from("group_members").select("user_id").eq("group_id", groupId),
    db.from("picks").select("user_id, horse_id").eq("group_id", groupId),
  ]);
  const memberIds = (members ?? []).map((m) => m.user_id as string);
  if (who !== "all" && !memberIds.includes(who)) return null;
  const horseIds = [...new Set((picks ?? []).map((p) => p.horse_id as string))];

  const [{ data: profiles }, { data: horses }, { data: results }] = await Promise.all([
    memberIds.length ? db.from("profiles").select("id, display_name").in("id", memberIds) : Promise.resolve({ data: [] }),
    horseIds.length ? db.from("horses").select("id, name, sex, birth_year, sire, dam, damsire, trainer, results_fetched_at").in("id", horseIds) : Promise.resolve({ data: [] }),
    horseIds.length ? fetchAllResults(db, horseIds, group as Group) : Promise.resolve({ data: [] }),
  ]);

  const names = new Map(((profiles ?? []) as { id: string; display_name: string }[]).map((p) => [p.id, p.display_name]));
  const horseMap = new Map(((horses ?? []) as Horse[]).map((h) => [h.id, h]));
  const rows = (results ?? []).map((r) => ({ ...r, prize_man: Number(r.prize_man) }));
  const standings = computeStandings(memberIds, (picks ?? []) as { user_id: string; horse_id: string }[], rows, group, todayJst());
  const member = who === "all" ? null : standings.find((s) => s.user_id === who) ?? null;
  const updated = [...horseMap.values()].map((h) => h.results_fetched_at).filter((d): d is string => !!d).sort().at(-1) ?? null;
  return { group, standings, names, horseMap, member, updated };
});

export type ShareData = NonNullable<Awaited<ReturnType<typeof loadShare>>>;

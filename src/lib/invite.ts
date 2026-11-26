// 招待リンクの下見（ログイン前でも大会名などを見せる）
import { cache } from "react";
import { createAdminClient } from "@/lib/supabase/admin";
import { isInviteCode } from "@/lib/seo";

export { inviteMessage, isInviteCode, newInviteCode } from "@/lib/seo";

export type InvitePreview = {
  id: string; name: string; crop_year: number; picks_per_member: number;
  season_start: string; season_end: string; include_non_jra: boolean; rules: unknown;
  owner_name: string; members: number;
};


export const loadInvite = cache(async (code: string): Promise<InvitePreview | null> => {
  if (!isInviteCode(code)) return null;
  const db = createAdminClient();
  const { data: g } = await db
    .from("groups")
    .select("id, name, owner_id, crop_year, picks_per_member, season_start, season_end, include_non_jra, rules")
    .eq("invite_code", code)
    .maybeSingle();
  if (!g) return null;
  const [{ data: owner }, { count }] = await Promise.all([
    db.from("profiles").select("display_name").eq("id", g.owner_id).maybeSingle(),
    db.from("group_members").select("user_id", { count: "exact", head: true }).eq("group_id", g.id),
  ]);
  return {
    id: g.id, name: g.name, crop_year: g.crop_year, picks_per_member: g.picks_per_member,
    season_start: g.season_start, season_end: g.season_end, include_non_jra: g.include_non_jra, rules: g.rules ?? null,
    owner_name: owner?.display_name ?? "主催者", members: count ?? 0,
  };
});

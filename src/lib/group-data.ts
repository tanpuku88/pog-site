import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getUser } from "@/lib/supabase/server";
import { computeStandings, type ResultRow } from "@/lib/standings";
import { todayJst } from "@/lib/util";

export type Group = {
  id: string;
  name: string;
  owner_id: string;
  crop_year: number;
  picks_per_member: number;
  season_start: string;
  season_end: string;
  include_non_jra: boolean;
  invite_code: string;
  /** 大会ごとのルール（JSON）。2026年の大会は null */
  rules: unknown;
};

export type Horse = {
  id: string;
  name: string;
  sex: string | null;
  birth_year: number | null;
  sire: string | null;
  dam: string | null;
  damsire: string | null;
  trainer: string | null;
  results_fetched_at: string | null;
};

/** グループ画面の共通チェック: ログイン済みでメンバーであること */
export const requireGroup = cache(async function requireGroup(groupId: string) {
  const { supabase, user } = await getUser();
  if (!user) redirect(`/login?next=/g/${groupId}`);
  const { data: group } = await supabase.from("groups").select("*").eq("id", groupId).maybeSingle<Group>();
  if (!group) notFound();
  return { supabase, user, group };
});

/** ランキングと指名馬の表示に必要なデータをまとめて読む */
export async function loadGroupBoard(groupId: string) {
  const { supabase, user, group } = await requireGroup(groupId);

  const [{ data: members }, { data: picks }] = await Promise.all([
    supabase.from("group_members").select("user_id, joined_at").eq("group_id", groupId),
    supabase.from("picks").select("user_id, horse_id, created_at").eq("group_id", groupId),
  ]);
  const memberIds = (members ?? []).map((m) => m.user_id as string);
  const horseIds = [...new Set((picks ?? []).map((p) => p.horse_id as string))];

  const [{ data: profiles }, { data: horses }, { data: results }] = await Promise.all([
    memberIds.length
      ? supabase.from("profiles").select("id, display_name").in("id", memberIds)
      : Promise.resolve({ data: [] as { id: string; display_name: string }[] }),
    horseIds.length
      ? supabase.from("horses").select("*").in("id", horseIds)
      : Promise.resolve({ data: [] as Horse[] }),
    horseIds.length
      ? fetchAllResults(supabase, horseIds, group)
      : Promise.resolve({ data: [] as ResultWithRace[] }),
  ]);

  const names = new Map((profiles ?? []).map((p) => [p.id as string, p.display_name as string]));
  const horseMap = new Map((horses ?? []).map((h) => [h.id as string, h as Horse]));
  const resultRows = (results ?? []).map((r) => ({ ...r, prize_man: Number(r.prize_man) }));
  const standings = computeStandings(
    memberIds,
    (picks ?? []) as { user_id: string; horse_id: string }[],
    resultRows,
    group,
    todayJst(),
  );

  return { supabase, user, group, standings, names, horseMap, results: resultRows, picks: picks ?? [] };
}

export type ResultWithRace = ResultRow & { venue: string; race_name: string; race_id: string | null };

/** シーズン中の成績を全件読む（1回1000件の上限があるので分けて読む） */
export async function fetchAllResults(
  supabase: SupabaseClient,
  horseIds: string[],
  group: Group,
) {
  const all: ResultWithRace[] = [];
  const PAGE = 1000;
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from("race_results")
      .select("horse_id, race_date, venue, race_name, race_id, finish, prize_man, is_jra, surface")
      .in("horse_id", horseIds)
      .gte("race_date", group.season_start)
      .lte("race_date", group.season_end)
      .order("race_date", { ascending: false })
      .order("horse_id")
      .range(from, from + PAGE - 1);
    if (error) throw error;
    all.push(...((data ?? []) as ResultWithRace[]));
    if (!data || data.length < PAGE) break;
  }
  return { data: all };
}

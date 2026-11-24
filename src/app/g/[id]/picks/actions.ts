"use server";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { syncHorse, searchNetkeiba } from "@/lib/horse-sync";
import { extractHorseId } from "@/lib/netkeiba/fetch";
import { normalizeQuery } from "@/lib/kana";
import { loadPopularIds } from "@/lib/horse-marks-server";

export type Candidate = {
  id: string;
  name: string;
  sex: string | null;
  birth_year: number | null;
  sire: string | null;
  dam: string | null;
  trainer: string | null;
  takenBy: string | null; // 指名済みならその人の名前
  mine?: boolean; // 自分がこの大会で指名済み
  popular?: boolean; // 人気馬（全大会の指名数上位）
};

async function context(groupId: string) {
  const { supabase, user } = await getUser();
  if (!user) throw new Error("ログインしてください");
  const { data: group } = await supabase
    .from("groups").select("id, crop_year").eq("id", groupId).maybeSingle();
  if (!group) throw new Error("グループが見つかりません");
  return { supabase, user, group };
}

async function withTaken(
  supabase: Awaited<ReturnType<typeof context>>["supabase"],
  groupId: string,
  horses: Omit<Candidate, "takenBy">[],
  userId?: string,
): Promise<Candidate[]> {
  if (horses.length === 0) return [];
  const popular = await loadPopularIds();
  const { data: picks } = await supabase
    .from("picks").select("horse_id, user_id").eq("group_id", groupId).in("horse_id", horses.map((h) => h.id));
  const userIds = [...new Set((picks ?? []).map((p) => p.user_id))];
  const { data: profiles } = userIds.length
    ? await supabase.from("profiles").select("id, display_name").in("id", userIds)
    : { data: [] };
  const name = new Map((profiles ?? []).map((p) => [p.id, p.display_name]));
  const taken = new Map((picks ?? []).map((p) => [p.horse_id, name.get(p.user_id) ?? "他の参加者"]));
  const mine = new Set((picks ?? []).filter((p) => p.user_id === userId).map((p) => p.horse_id));
  return horses.map((h) => ({ ...h, takenBy: taken.get(h.id) ?? null, mine: mine.has(h.id), popular: popular.has(h.id) }));
}

const COLS = "id, name, sex, birth_year, sire, dam, trainer";

/** 保存済みの馬から検索（馬名・父・母の部分一致） */
export async function searchLocal(groupId: string, q: string): Promise<Candidate[]> {
  const word = normalizeQuery(q).replace(/[%_,()]/g, "");
  if (word.length < 2) return [];
  const { supabase, group, user } = await context(groupId);
  const { data } = await supabase
    .from("horses")
    .select(COLS)
    .eq("birth_year", group.crop_year)
    .or(`name.ilike.%${word}%,sire.ilike.%${word}%,dam.ilike.%${word}%`)
    .order("name")
    .limit(40);
  return withTaken(supabase, groupId, data ?? [], user.id);
}

/** netkeiba で馬名検索して候補を増やす（ボタンを押したときだけ） */
export async function searchOnNetkeiba(groupId: string, q: string): Promise<Candidate[]> {
  const word = normalizeQuery(q);
  if (word.length < 2) return [];
  const { supabase, group, user } = await context(groupId);
  const hits = await searchNetkeiba(createAdminClient(), word);
  const sameCrop = hits.filter((h) => h.birth_year === null || h.birth_year === group.crop_year);
  return withTaken(supabase, groupId, sameCrop.map((h) => ({
    id: h.id, name: h.name, sex: h.sex, birth_year: h.birth_year, sire: h.sire, dam: h.dam, trainer: h.trainer,
  })), user.id);
}

export type PickResult = { ok: boolean; message: string };

async function insertPick(groupId: string, horseId: string): Promise<PickResult> {
  const { supabase, user, group } = await context(groupId);
  const admin = createAdminClient();
  const { data: horse } = await admin
    .from("horses").select("id, name, birth_year, sire, results_fetched_at").eq("id", horseId).maybeSingle();

  // 初めて指名される馬（または血統が空の馬）は、血統と成績をnetkeibaから取り込む
  let name = horse?.name ?? horseId;
  let birthYear = horse?.birth_year ?? null;
  if (!horse || !horse.results_fetched_at || !horse.sire) {
    try {
      const { profile } = await syncHorse(admin, horseId);
      name = profile.name;
      birthYear = profile.birth_year;
    } catch {
      return { ok: false, message: "netkeibaから馬の情報を取得できませんでした。少し待ってからもう一度お試しください。" };
    }
  }
  if (birthYear !== null && birthYear !== group.crop_year) {
    return { ok: false, message: `${name}は${birthYear}年生まれなので、このグループ（${group.crop_year}年生まれ世代）では指名できません。` };
  }

  const { error } = await supabase.from("picks").insert({ group_id: groupId, user_id: user.id, horse_id: horseId });
  if (error) {
    if (error.code === "23505") return { ok: false, message: `${name}はすでに指名されています。` };
    if (error.message.includes("頭まで")) return { ok: false, message: error.message };
    return { ok: false, message: `登録できませんでした（${error.message}）` };
  }
  revalidatePath(`/g/${groupId}`, "layout");
  return { ok: true, message: `${name}を指名しました。` };
}

export async function addPick(groupId: string, horseId: string): Promise<PickResult> {
  return insertPick(groupId, horseId);
}

export async function addPickByUrl(groupId: string, url: string): Promise<PickResult> {
  const id = extractHorseId(url);
  if (!id) return { ok: false, message: "netkeibaの馬ページのURL（db.netkeiba.com/horse/…）を貼ってください。" };
  return insertPick(groupId, id);
}

/** 改行区切りの馬名をまとめて登録 */
export async function addPicksBulk(groupId: string, text: string): Promise<PickResult[]> {
  const names = text.split(/\r?\n/).map(normalizeQuery).filter(Boolean).slice(0, 50);
  const { supabase, group } = await context(groupId);
  const out: PickResult[] = [];
  for (const n of names) {
    if (extractHorseId(n)) {
      out.push(await addPickByUrl(groupId, n));
      continue;
    }
    let { data } = await supabase
      .from("horses").select("id").eq("birth_year", group.crop_year).eq("name", n).limit(2);
    if (!data || data.length === 0) {
      const hits = await searchNetkeiba(createAdminClient(), n);
      data = hits.filter((h) => h.name === n && (h.birth_year ?? group.crop_year) === group.crop_year).map((h) => ({ id: h.id }));
    }
    if (!data || data.length === 0) out.push({ ok: false, message: `${n}：見つかりませんでした（まだ馬名がない場合はURLで登録してください）` });
    else if (data.length > 1) out.push({ ok: false, message: `${n}：同じ名前の馬が複数います。検索から選んでください。` });
    else out.push(await insertPick(groupId, data[0].id));
  }
  return out;
}

export async function removePick(groupId: string, horseId: string) {
  const { supabase, user } = await context(groupId);
  await supabase.from("picks").delete().eq("group_id", groupId).eq("user_id", user.id).eq("horse_id", horseId);
  revalidatePath(`/g/${groupId}`, "layout");
}

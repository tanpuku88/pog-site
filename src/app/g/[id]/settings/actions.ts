"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";
import { parseRulesForm } from "@/lib/rules-form";
import { newInviteCode } from "@/lib/invite";

export async function updateRules(groupId: string, form: FormData) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");
  const name = String(form.get("name") ?? "").trim().slice(0, 40);
  const { error } = await supabase
    .from("groups")
    .update({ ...(name ? { name } : {}), ...parseRulesForm(form) })
    .eq("id", groupId)
    .eq("owner_id", user.id);
  if (error) throw new Error(`保存できませんでした: ${error.message}`);
  revalidatePath(`/g/${groupId}`, "layout");
  redirect(`/g/${groupId}/settings?saved=1`);
}

export async function leaveGroup(groupId: string) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");
  await supabase.from("picks").delete().eq("group_id", groupId).eq("user_id", user.id);
  await supabase.from("group_members").delete().eq("group_id", groupId).eq("user_id", user.id);
  redirect("/");
}

/** 招待リンクを作り直す（リンクが広まりすぎたときなど）。オーナーだけ */
export async function resetInvite(groupId: string) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");
  const { error } = await supabase
    .from("groups")
    .update({ invite_code: newInviteCode() })
    .eq("id", groupId)
    .eq("owner_id", user.id);
  if (error) throw new Error(`作り直せませんでした: ${error.message}`);
  revalidatePath(`/g/${groupId}`, "layout");
  redirect(`/g/${groupId}/settings?reset=1`);
}

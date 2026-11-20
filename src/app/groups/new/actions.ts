"use server";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { parseRulesForm } from "@/lib/rules-form";

export async function createGroup(form: FormData) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");
  const name = String(form.get("name") ?? "").trim().slice(0, 40) || "POGグループ";
  const { data, error } = await supabase
    .from("groups")
    .insert({ name, owner_id: user.id, ...parseRulesForm(form) })
    .select("id")
    .single();
  if (error) throw new Error(`グループを作れませんでした: ${error.message}`);
  redirect(`/g/${data.id}/settings?created=1`);
}

"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase/server";

export async function updateName(form: FormData) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");
  const name = String(form.get("display_name") ?? "").trim().slice(0, 20);
  if (name) await supabase.from("profiles").update({ display_name: name }).eq("id", user.id);
  revalidatePath("/", "layout");
  redirect("/me?saved=1");
}

export async function updatePassword(form: FormData) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login");
  const pw = String(form.get("password") ?? "");
  if (pw.length < 6) redirect("/me?pwerror=1");
  const { error } = await supabase.auth.updateUser({ password: pw });
  redirect(error ? "/me?pwerror=1" : "/me?pwsaved=1");
}

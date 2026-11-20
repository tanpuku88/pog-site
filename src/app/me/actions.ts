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

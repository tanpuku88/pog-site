"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/util";

export type LoginState = { step: "email" | "code"; email?: string; error?: string; next?: string };

async function siteOrigin() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${h.get("host")}`;
}

export async function sendLoginEmail(_: LoginState, form: FormData): Promise<LoginState> {
  const email = String(form.get("email") ?? "").trim();
  const next = String(form.get("next") ?? "/");
  if (!email.includes("@")) return { step: "email", error: "メールアドレスを入力してください", next };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error) return { step: "email", error: `送信できませんでした（${error.message}）`, next };
  return { step: "code", email, next };
}

export async function verifyCode(state: LoginState, form: FormData): Promise<LoginState> {
  const token = String(form.get("code") ?? "").replace(/\s/g, "");
  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email: state.email!, token, type: "email" });
  if (error) return { ...state, error: "コードが正しくないか、期限が切れています" };
  redirect(safeNext(state.next));
}

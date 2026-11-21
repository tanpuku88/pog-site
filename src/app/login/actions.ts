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

export type PasswordState = { mode: "login" | "signup"; error?: string; info?: string; next?: string };

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "メールアドレスかパスワードが違います",
  "Email not confirmed": "メールアドレスの確認がまだです。届いたメールのリンクを開いてください",
  "User already registered": "このメールアドレスはすでに登録されています。「ログイン」から入ってください",
};
const jaError = (m: string) => AUTH_ERRORS[m] ?? (/password/i.test(m) ? "パスワードは6文字以上にしてください" : m);

/** メールアドレス＋パスワードでログイン、または新規登録 */
export async function passwordAuth(state: PasswordState, form: FormData): Promise<PasswordState> {
  const mode = form.get("mode") === "signup" ? "signup" : "login";
  const email = String(form.get("email") ?? "").trim();
  const password = String(form.get("password") ?? "");
  const next = String(form.get("next") ?? state.next ?? "/");
  if (!email.includes("@")) return { mode, next, error: "メールアドレスを入力してください" };
  if (password.length < 6) return { mode, next, error: "パスワードは6文字以上にしてください" };
  const supabase = await createClient();

  if (mode === "login") {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { mode, next, error: jaError(error.message) };
    redirect(safeNext(next));
  }

  const displayName = String(form.get("display_name") ?? "").trim().slice(0, 20);
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${await siteOrigin()}/auth/callback?next=${encodeURIComponent(next)}`,
      data: displayName ? { display_name: displayName } : undefined,
    },
  });
  if (error) return { mode, next, error: jaError(error.message) };
  if (data.session) redirect(safeNext(next));
  return { mode, next, info: `${email} に確認メールを送りました。メールのリンクを開くと登録が完了します。` };
}

import { createClient } from "@supabase/supabase-js";

/** サーバー専用。RLSを無視して書き込めるので、ユーザーの入力をそのまま渡さないこと */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY が設定されていません");
  return createClient(url, key, { auth: { persistSession: false } });
}

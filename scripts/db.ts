import { createClient } from "@supabase/supabase-js";

export function adminDb() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY を設定してください");
  return createClient(url, key, { auth: { persistSession: false } });
}

/** どこかのグループで指名されている馬のID */
export async function pickedHorseIds(db: ReturnType<typeof adminDb>): Promise<string[]> {
  const ids = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("picks").select("horse_id").range(from, from + 999);
    if (error) throw error;
    data.forEach((r) => ids.add(r.horse_id));
    if (data.length < 1000) break;
  }
  return [...ids];
}

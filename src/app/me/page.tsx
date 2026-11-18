import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { updateName } from "./actions";

export default async function Me({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login?next=/me");
  const { saved } = await searchParams;
  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
  return (
    <>
      <h1>マイページ</h1>
      {saved && <p className="ok">保存しました。</p>}
      <form action={updateName} className="card">
        <label htmlFor="dn">表示名（ランキングに表示されます）</label>
        <input id="dn" name="display_name" defaultValue={profile?.display_name ?? ""} maxLength={20} required />
        <p className="muted">{user.email}</p>
        <button>保存する</button>
      </form>
    </>
  );
}

import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { updateName, updatePassword } from "./actions";

export default async function Me({ searchParams }: { searchParams: Promise<{ saved?: string; pwsaved?: string; pwerror?: string }> }) {
  const { supabase, user } = await getUser();
  if (!user) redirect("/login?next=/me");
  const { saved, pwsaved, pwerror } = await searchParams;
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
      <form action={updatePassword} className="card">
        <label htmlFor="pw" style={{ marginTop: 0 }}>パスワードを設定・変更する</label>
        <input id="pw" name="password" type="password" minLength={6} autoComplete="new-password" required />
        <p className="muted">設定すると、次回からメールを待たずにメールアドレスとパスワードでログインできます（6文字以上）。</p>
        {pwsaved && <p className="ok">パスワードを設定しました。</p>}
        {pwerror && <p className="error">設定できませんでした。6文字以上で、もう一度お試しください。</p>}
        <button>設定する</button>
      </form>
    </>
  );
}

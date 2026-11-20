import Link from "next/link";
import { getUser } from "@/lib/supabase/server";

export default async function Home() {
  const { supabase, user } = await getUser();
  if (!user) {
    return (
      <>
        <h1>POGをもっとラクに</h1>
        <div className="card">
          <p style={{ marginTop: 0 }}>指名馬は馬名や父・母の名前を数文字入れて選ぶだけ。成績とポイントは自動で集計されます。</p>
          <ul>
            <li>馬名・父・母の名前で検索して登録</li>
            <li>netkeibaのURLを貼るだけでも登録できる</li>
            <li>本賞金の合計でランキングを自動更新</li>
            <li>指名馬の今週の出走がひと目でわかる</li>
          </ul>
          <Link href="/login" className="btn">はじめる</Link>
        </div>
      </>
    );
  }
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id, groups(id, name, crop_year)")
    .eq("user_id", user.id);
  const groups = (memberships ?? [])
    .map((m) => m.groups as unknown as { id: string; name: string; crop_year: number } | null)
    .filter((g): g is { id: string; name: string; crop_year: number } => !!g);

  return (
    <>
      <h1>参加中のグループ</h1>
      {groups.length === 0 && (
        <div className="card muted">まだグループがありません。グループを作るか、招待リンクから参加してください。</div>
      )}
      {groups.map((g) => (
        <Link key={g.id} href={`/g/${g.id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <div className="card">
            <strong>{g.name}</strong>
            <div className="muted">{g.crop_year}年生まれ世代</div>
          </div>
        </Link>
      ))}
      <p><Link href="/groups/new" className="btn">新しいグループを作る</Link></p>
    </>
  );
}

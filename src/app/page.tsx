import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { PopularTop, Columns, GuideLink } from "@/components/HomeSections";

export default async function Home() {
  const { supabase, user } = await getUser();
  if (!user) {
    return (
      <>
        <div className="lead">
          <h1>POGを、もっとラクに。もっと熱く。</h1>
          <p>指名馬の登録は馬名を数文字入れるだけ。成績・賞金・順位は毎晩自動で更新されます。</p>
          <Link href="/login" className="btn">無料ではじめる</Link>{" "}<Link href="/guide" style={{ color: "#fff", marginLeft: 12 }}>使い方を見る ›</Link>
        </div>
        <div className="features">
          <div className="card"><strong>かんたん登録</strong><span className="muted">馬名・父・母で検索、URL貼り付け、まとめて登録に対応</span></div>
          <div className="card"><strong>自動で順位表</strong><span className="muted">本賞金の合計でランキングを毎晩更新</span></div>
          <div className="card"><strong>人気馬30傑</strong><span className="muted">世代でよく指名されている馬がひと目でわかる</span></div>
          <div className="card"><strong>今週の出走</strong><span className="muted">指名馬の出走予定と最新の成績をまとめて表示</span></div>
        </div>
        <PopularTop />
        <Columns />
        <GuideLink />
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
      <div className="sec-title" style={{ marginTop: 8 }}><h2>参加中のグループ</h2></div>
      {groups.length === 0 && (
        <div className="card muted">まだグループがありません。グループを作るか、招待リンクから参加してください。</div>
      )}
      {groups.map((g) => (
        <div className="card" key={g.id}>
          <Link href={`/g/${g.id}`} className="group-link">
            <span>
              <strong>{g.name}</strong>
              <div className="muted">{g.crop_year}年生まれ世代</div>
            </span>
            <span className="muted">開く ›</span>
          </Link>
        </div>
      ))}
      <p><Link href="/groups/new" className="btn">新しいグループを作る</Link></p>
      <PopularTop />
      <Columns />
      <GuideLink />
    </>
  );
}

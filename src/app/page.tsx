import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { HomeBoard, Columns, PickupNote } from "@/components/HomeSections";

const MENU = [
  { href: "/popular", icon: "🏆", title: "注目馬30傑", text: "賞金・指名数で世代の注目馬" },
  { href: "/shinba", icon: "🐎", title: "今週の新馬戦", text: "デビュー馬と血統・指名数" },
  { href: "/data", icon: "🧬", title: "POGデータ", text: "種牡馬・厩舎・馬主・牧場の勝ち上がり" },
  { href: "/horses", icon: "🔍", title: "馬を探す", text: "馬名・父・母から2歳馬を検索" },
];

function QuickMenu() {
  return (
    <nav className="quick-menu">
      {MENU.map((m) => (
        <Link key={m.href} href={m.href}>
          <span className="qm-icon" aria-hidden>{m.icon}</span>
          <span><strong>{m.title}</strong><small>{m.text}</small></span>
        </Link>
      ))}
    </nav>
  );
}

export default async function Home() {
  const { supabase, user } = await getUser();
  if (!user) {
    return (
      <>
        <div className="lead lead-home">
          <div className="lead-text">
            <p className="lead-kicker">POG（ペーパーオーナーゲーム）大会を無料で</p>
            <h1>指名はかんたん、<br />順位は毎晩自動更新。</h1>
            <p>馬名を数文字入れるだけで指名完了。成績・賞金・順位はサイトが自動で集計します。招待リンクをLINEで送れば、仲間はそのまま参加できます。</p>
            <div className="lead-actions">
              <Link href="/login?mode=signup" className="btn gold">無料で大会を作る</Link>
              <Link href="/guide" className="btn ghost">使い方を見る</Link>
            </div>
          </div>
          <ul className="lead-points">
            <li><b>かんたん登録</b>馬名・父・母で検索、URL貼り付け、まとめて登録</li>
            <li><b>自動で順位表</b>本賞金の合計でランキングを毎晩更新</li>
            <li><b>出走予定もまとめて</b>指名馬の今週の出走と最新の成績</li>
          </ul>
        </div>
        <QuickMenu />
        <PickupNote />
        <HomeBoard>
          <Columns />
        </HomeBoard>
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
      <div className="sec-title" style={{ marginTop: 8 }}>
        <h2>参加中の大会</h2>
        <Link href="/groups/new">＋ 新しい大会を作る</Link>
      </div>
      {groups.length === 0 && (
        <div className="card muted">まだ大会がありません。大会を作るか、招待リンクから参加してください。</div>
      )}
      <div className="group-grid">
        {groups.map((g) => (
          <Link href={`/g/${g.id}`} className="group-tile" key={g.id}>
            <strong>{g.name}</strong>
            <span className="muted">{g.crop_year}年生まれ世代</span>
            <span className="gt-go">順位表を開く ›</span>
          </Link>
        ))}
      </div>
      <QuickMenu />
      <PickupNote />
      <HomeBoard>
        <Columns />
      </HomeBoard>
    </>
  );
}

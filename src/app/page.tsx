import Link from "next/link";
import { getUser } from "@/lib/supabase/server";
import { HomeBoard, Columns, PickupNote } from "@/components/HomeSections";
import { OFFICIAL_POG } from "@/config/site";

type HomeGroup = { id: string; name: string; crop_year: number; season_start: string; season_end: string };

const fmtDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return `${d.getUTCFullYear()}年${d.getUTCMonth() + 1}月${d.getUTCDate()}日`;
};

function OfficialCard({ group }: { group: HomeGroup | null }) {
  return (
    <section className="official-card">
      <div className="official-main">
        <p className="official-badge">公式POG</p>
        <h2 className="official-name">{group ? group.name : "たんぷくPOG 2026-27"}</h2>
        <p className="official-meta">
          主催：{OFFICIAL_POG.host}
          {group && <>｜{group.crop_year}年生まれ世代｜{fmtDay(group.season_start)}〜{fmtDay(group.season_end)}</>}
        </p>
        <p className="official-blurb">{OFFICIAL_POG.blurb}</p>
      </div>
      <div className="official-actions">
        {group ? (
          <>
            <Link href={`/g/${group.id}`} className="btn gold">順位表を開く</Link>
            <span className="official-joined">参加中です</span>
          </>
        ) : (
          <>
            <Link href={OFFICIAL_POG.joinPath} className="btn gold">参加する</Link>
            <span className="official-joined">まだ参加していません</span>
          </>
        )}
      </div>
    </section>
  );
}

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
    .select("group_id, groups(id, name, crop_year, season_start, season_end)")
    .eq("user_id", user.id);
  const groups = (memberships ?? [])
    .map((m) => m.groups as unknown as HomeGroup | null)
    .filter((g): g is HomeGroup => !!g);
  const official = groups.find((g) => g.name.includes(OFFICIAL_POG.nameIncludes)) ?? null;
  const others = official ? groups.filter((g) => g.id !== official.id) : groups;

  return (
    <>
      <OfficialCard group={official} />
      <div className="sec-title" style={{ marginTop: 8 }}>
        <h2>参加中の大会</h2>
        <Link href="/groups/new">＋ 新しい大会を作る</Link>
      </div>
      {groups.length === 0 && (
        <div className="card muted">まだ大会がありません。大会を作るか、招待リンクから参加してください。</div>
      )}
      {others.length > 0 && (
        <div className={`group-grid cnt-${Math.min(others.length, 3)}`}>
          {others.map((g) => (
            <Link href={`/g/${g.id}`} className="group-tile" key={g.id}>
              <strong>{g.name}</strong>
              <span className="muted">{g.crop_year}年生まれ世代</span>
              <span className="gt-go">順位表を開く ›</span>
            </Link>
          ))}
        </div>
      )}
      {official && others.length === 0 && (
        <p className="muted" style={{ marginTop: -4 }}>参加中の大会は公式POGだけです。仲間との大会は「＋ 新しい大会を作る」から作れます。</p>
      )}
      <QuickMenu />
      <PickupNote />
      <HomeBoard>
        <Columns />
      </HomeBoard>
    </>
  );
}

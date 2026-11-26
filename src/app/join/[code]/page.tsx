import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/supabase/server";
import { loadInvite } from "@/lib/invite";
import { rulesOf, describeRules } from "@/lib/group-rules";

const md = (d: string) => `${Number(d.slice(5, 7))}/${Number(d.slice(8, 10))}`;

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params;
  const g = await loadInvite(code);
  const title = g ? `POG大会「${g.name}」への招待` : "POG大会への招待";
  const description = g
    ? `${g.owner_name}さんからの招待です。${g.crop_year}年生まれ世代・1人${g.picks_per_member}頭。リンクを開いて登録すると、そのまま参加できます。`
    : "リンクを開いて登録すると、そのまま大会に参加できます。";
  return { title, description, robots: { index: false }, openGraph: { title, description }, twitter: { card: "summary_large_image", title, description } };
}

export default async function Join({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { supabase, user } = await getUser();

  if (user) {
    const { data, error } = await supabase.rpc("join_group", { code });
    if (!error && data) redirect(`/g/${data}?joined=1`);
  }

  const g = await loadInvite(code);
  if (!g) {
    return (
      <>
        <h1>参加できませんでした</h1>
        <div className="card error">招待リンクが正しくないか、作り直されたか、大会が削除されています。主催者に新しいリンクをもらってください。</div>
      </>
    );
  }
  const rules = rulesOf(g);
  const [, , ...pointLines] = describeRules(g, rules);
  const next = encodeURIComponent(`/join/${code}`);
  return (
    <>
      <div className="lead">
        <p style={{ margin: "0 0 4px" }}>{g.owner_name}さんから招待が届いています</p>
        <h1>POG大会「{g.name}」</h1>
        <p>無料で登録すると、そのまま大会に参加できます。登録は1分ほどで終わります。</p>
        <Link href={`/login?mode=signup&next=${next}`} className="btn">新規登録して参加する</Link>
      </div>
      <div className="card flush">
        <table className="list">
          <tbody>
            <tr><th style={{ width: "8em", background: "var(--th)" }}>主催者</th><td>{g.owner_name}さん</td></tr>
            <tr><th style={{ background: "var(--th)" }}>参加者</th><td>{g.members}人</td></tr>
            <tr><th style={{ background: "var(--th)" }}>対象の世代</th><td>{g.crop_year}年生まれ</td></tr>
            <tr><th style={{ background: "var(--th)" }}>指名頭数</th><td>1人{g.picks_per_member}頭{rules.male !== null && `（牡馬${rules.male}頭・牝馬${rules.female}頭）`}</td></tr>
            <tr><th style={{ background: "var(--th)" }}>ポイント</th><td>{pointLines.map((l) => <div key={l}>{l.replace(/^ポイント：/, "")}</div>)}</td></tr>
            <tr><th style={{ background: "var(--th)" }}>期間</th><td>{g.season_start.slice(0, 4)}/{md(g.season_start)} 〜 {g.season_end.slice(0, 4)}/{md(g.season_end)}</td></tr>
          </tbody>
        </table>
      </div>
      <div className="card">
        <strong>すでに登録している方</strong>
        <p className="muted" style={{ margin: "4px 0 8px" }}>ログインすると、そのまま「{g.name}」に参加します。</p>
        <Link href={`/login?next=${next}`} className="btn secondary">ログインして参加する</Link>
      </div>
    </>
  );
}

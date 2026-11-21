import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { loadShare } from "@/lib/share-data";
import { formatMan, todayJst } from "@/lib/util";
import { HorseLabel, Rank } from "@/components/HorseLabel";

type P = { params: Promise<{ gid: string; who: string; sig: string }> };

const imagePath = (gid: string, who: string, sig: string) =>
  // 日付を付けて、Xなどが古い画像をいつまでも使わないようにする
  `/share/${gid}/${who}/${sig}/image?d=${todayJst().replace(/-/g, "")}`;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { gid, who, sig } = await params;
  const d = await loadShare(gid, who, sig);
  if (!d) return { title: "見つかりません", robots: { index: false } };
  const name = d.member ? d.names.get(d.member.user_id) ?? "名無し" : null;
  const title = d.member
    ? `${name}さんの指名リスト（${d.group.name}）`
    : `POG大会「${d.group.name}」の順位表`;
  const description = d.member
    ? `${d.standings.length}人中${d.member.rank}位・${formatMan(d.member.points)}万円。POG大会は無料で作れます。`
    : `${d.standings.length}人で競うPOG大会。首位は${d.names.get(d.standings[0]?.user_id ?? "") ?? "-"}さん。POG大会は無料で作れます。`;
  const image = { url: imagePath(gid, who, sig), width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: [image], type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
  };
}

export default async function SharePage({ params }: P) {
  const { gid, who, sig } = await params;
  const d = await loadShare(gid, who, sig);
  if (!d) notFound();
  const { group, standings, names, horseMap, member } = d;

  return (
    <>
      <div className="lead">
        <p style={{ margin: "0 0 4px" }}>{group.crop_year}年生まれ世代・1人{group.picks_per_member}頭・{standings.length}人参加</p>
        <h1>{member ? `${names.get(member.user_id) ?? "名無し"}さんの指名リスト` : `「${group.name}」の順位表`}</h1>
        <p>{member ? `POG大会「${group.name}」で ${standings.length}人中 ${member.rank}位・${formatMan(member.points)}万円` : `首位は${names.get(standings[0]?.user_id ?? "") ?? "-"}さん・${formatMan(standings[0]?.points ?? 0)}万円`}</p>
      </div>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imagePath(gid, who, sig)} alt="シェア画像" width={1200} height={630} style={{ width: "100%", height: "auto", borderRadius: 6, marginBottom: 12, display: "block" }} />

      {member ? (
        <div className="card flush scroll">
          <table className="list">
            <thead><tr><th>馬名</th><th className="num">戦績</th><th className="num">本賞金（万円）</th></tr></thead>
            <tbody>
              {member.horses.map((h) => (
                <tr key={h.horse_id}>
                  <td><HorseLabel id={h.horse_id} horse={horseMap.get(h.horse_id)} /></td>
                  <td className="num">{h.starts ? `${h.starts}戦${h.wins}勝` : <span className="muted">未出走</span>}</td>
                  <td className="num big">{h.points > 0 ? formatMan(h.points) : <span className="muted">-</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card flush scroll">
          <table className="list">
            <thead><tr><th className="c">順位</th><th>参加者</th><th className="num">賞金（万円）</th><th className="num">勝利</th></tr></thead>
            <tbody>
              {standings.map((s) => (
                <tr key={s.user_id}>
                  <td className="c"><Rank rank={s.rank} /></td>
                  <td className="big">{names.get(s.user_id) ?? "名無し"}<div className="sub">{s.horses.length}頭指名</div></td>
                  <td className="num big">{formatMan(s.points)}</td>
                  <td className="num">{s.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="card" style={{ borderLeft: "4px solid var(--gold)" }}>
        <strong>あなたもPOG大会を開いてみませんか？</strong>
        <p className="muted" style={{ margin: "4px 0 8px" }}>無料で大会を作って、招待リンクを送るだけ。馬名を数文字入れれば指名でき、成績と賞金は毎晩自動で集計されます。</p>
        <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
          <Link href="/login?mode=signup&next=/groups/new" className="btn">無料で大会を作る</Link>
          <Link href="/" className="btn secondary">サイトを見てみる</Link>
          <Link href="/horses" className="btn secondary">2歳馬を探す</Link>
        </div>
      </div>
      {d.updated && <p className="muted">成績の最終更新：{new Date(d.updated).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}</p>}
    </>
  );
}

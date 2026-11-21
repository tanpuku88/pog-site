import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { aggregateSires, loadCropData } from "@/lib/sires";
import { defaultSeason } from "@/lib/standings";
import { formatMan } from "@/lib/util";
import { HorseLabel } from "@/components/HorseLabel";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ name: string }> }) {
  const { name } = await params;
  return { title: `${decodeURIComponent(name)}産駒 | POG` };
}

export default async function SirePage({ params }: { params: Promise<{ name: string }> }) {
  const { name: raw } = await params;
  const sire = decodeURIComponent(raw);
  const season = defaultSeason();
  const { horses, picks, tally } = await loadCropData(createAdminClient(), season.crop_year, { ...season, include_non_jra: false });
  const kids = horses.filter((h) => h.sire === sire);
  const summary = aggregateSires(kids, picks, tally)[0];
  const rows = kids
    .map((h) => ({ h, picks: picks.get(h.id) ?? 0, t: tally.get(h.id) ?? { points: 0, starts: 0, wins: 0 } }))
    .sort((a, b) => b.t.points - a.t.points || b.picks - a.picks || a.h.name.localeCompare(b.h.name, "ja"));

  return (
    <>
      <p className="muted" style={{ margin: "0 0 8px" }}><Link href="/sires">‹ 種牡馬ランキング</Link></p>
      <h1 style={{ marginBottom: 4 }}>{sire} 産駒</h1>
      <p className="muted" style={{ marginTop: 0 }}>{season.crop_year}年生まれ世代</p>
      {!summary ? (
        <div className="card muted">この種牡馬の産駒は登録されていません。</div>
      ) : (
        <>
          <div className="stats">
            <div className="stat"><div className="k">産駒</div><div className="v">{summary.horses}<small>頭</small></div></div>
            <div className="stat"><div className="k">勝ち上がり</div><div className="v">{summary.winners}<small>頭 / 出走{summary.starters}頭</small></div></div>
            <div className="stat"><div className="k">賞金合計</div><div className="v">{formatMan(summary.points)}<small>万円</small></div></div>
            <div className="stat"><div className="k">延べ指名数</div><div className="v">{summary.picks}</div></div>
          </div>
          <div className="sec-title"><h2>産駒一覧</h2><span className="muted">賞金の多い順</span></div>
          <div className="card flush scroll">
            <table className="list">
              <thead><tr><th>馬名・母</th><th className="hide-sm">厩舎</th><th className="num">指名</th><th className="num">成績</th><th className="num">賞金</th></tr></thead>
              <tbody>
                {rows.map(({ h, picks: n, t }) => (
                  <tr key={h.id}>
                    <td><HorseLabel id={h.id} horse={{ ...h, sire: null }} /></td>
                    <td className="hide-sm sub">{h.trainer ?? ""}</td>
                    <td className="num">{n || <span className="muted">-</span>}</td>
                    <td className="num sub">{t.starts === 0 ? "未出走" : `${t.starts}戦${t.wins}勝`}</td>
                    <td className="num big">{t.points > 0 ? formatMan(t.points) : <span className="muted">-</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}

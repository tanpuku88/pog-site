import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGenerationBoard } from "@/lib/popular";
import { defaultSeason } from "@/lib/standings";
import { loadFeeds } from "@/lib/feeds";
import { COLUMN_FEEDS } from "@/config/site";
import { formatMan } from "@/lib/util";
import { HorseLabel, Rank } from "./HorseLabel";

/** トップページ：今の世代の人気馬トップ10 */
export async function PopularTop() {
  const season = defaultSeason();
  let board: Awaited<ReturnType<typeof loadGenerationBoard>> | null = null;
  try {
    board = await loadGenerationBoard(createAdminClient(), season.crop_year, { ...season, include_non_jra: false }, 10);
  } catch {
    board = null;
  }
  return (
    <>
      <div className="sec-title"><h2>{season.crop_year}年生まれ世代 人気馬TOP10</h2><span className="muted">このサイトでの指名数</span></div>
      {!board || board.byPicks.length === 0 ? (
        <div className="card muted">まだ指名がありません。グループを作って最初の指名をしてみましょう。</div>
      ) : (
        <div className="card flush scroll">
          <table className="list">
            <thead><tr><th className="c">順位</th><th>馬名・血統</th><th className="num">指名数</th><th className="num">賞金</th></tr></thead>
            <tbody>
              {board.byPicks.map((r) => (
                <tr key={r.horse.id}>
                  <td className="c"><Rank rank={r.rank} /></td>
                  <td><HorseLabel id={r.horse.id} horse={r.horse} /></td>
                  <td className="num big">{r.picks}</td>
                  <td className="num">{r.points > 0 ? formatMan(r.points) : <span className="muted">-</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

/** トップページ：コラム（note・ブログの新着） */
export async function Columns() {
  if (COLUMN_FEEDS.length === 0) return null;
  const items = await loadFeeds(COLUMN_FEEDS, 6);
  if (items.length === 0) return null;
  return (
    <>
      <div className="sec-title"><h2>コラム・新馬情報</h2><span className="muted">新着記事</span></div>
      <div className="columns">
        {items.map((i) => (
          <a key={i.url} href={i.url} target="_blank" rel="noreferrer" className="column-card">
            {/* 外部サイトのサムネイルなので最適化せずそのまま表示する */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {i.image && <img src={i.image} alt="" loading="lazy" />}
            <span className="column-body">
              <span className="column-src">{i.source}{i.date && ` ・ ${new Date(i.date).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}`}</span>
              <strong>{i.title}</strong>
            </span>
          </a>
        ))}
      </div>
    </>
  );
}

export function GuideLink() {
  return (
    <p className="muted" style={{ textAlign: "center", marginTop: 24 }}>
      はじめての方は <Link href="/guide">使い方</Link> をご覧ください。
    </p>
  );
}

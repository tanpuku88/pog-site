import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGenerationBoard, type GenerationBoard } from "@/lib/popular";
import { defaultSeason } from "@/lib/standings";
import { loadFeeds } from "@/lib/feeds";
import { COLUMN_FEEDS, NOTE_URL } from "@/config/site";
import { PopularTable, RisingBox, SireBox } from "./PopularTable";
import { OwnerSide } from "./OwnerSites";

/** トップページ：人気馬TOP10（本文）と急上昇・人気の種牡馬（横の欄） */
export async function HomeBoard({ children }: { children?: React.ReactNode }) {
  const season = defaultSeason();
  let board: GenerationBoard | null = null;
  try {
    board = await loadGenerationBoard(createAdminClient(), season.crop_year, { ...season, include_non_jra: true }, 10);
  } catch {
    board = null;
  }
  return (
    <div className="layout-2col">
      <div>
        <div className="sec-title">
          <h2>{season.crop_year}年生まれ世代 {board?.defaultSort === "picks" ? "注目馬TOP10（指名数順）" : "注目馬TOP10"}</h2>
          <Link href="/popular">30傑をすべて見る ›</Link>
        </div>
        {!board || (board.defaultSort === "picks" ? board.byPicks : board.byPrize).length === 0 ? (
          <div className="card muted">まだデータがありません。</div>
        ) : (
          <PopularTable rows={board.defaultSort === "picks" ? board.byPicks : board.byPrize} sort={board.defaultSort} groupCount={board.groupCount} compact />
        )}
        {children}
      </div>
      <aside className="side">
        <OwnerSide />
        {board && <RisingBox board={board} />}
        {board && <SireBox board={board} limit={5} />}
        <section className="box">
          <h3 className="box-head">📘 はじめての方へ</h3>
          <p className="box-text">大会を作る → 招待リンクをLINEで送る → 馬名を数文字入れて指名。成績と順位は毎晩自動で更新されます。</p>
          <Link href="/guide" className="box-more">使い方を見る ›</Link>
        </section>
      </aside>
    </div>
  );
}

/** トップページ：コラム（note・ブログの新着） */
export async function Columns() {
  if (COLUMN_FEEDS.length === 0) return null;
  const items = await loadFeeds(COLUMN_FEEDS, 6);
  if (items.length === 0 && !NOTE_URL) return null;
  return (
    <>
      <div className="sec-title">
        <h2>コラム・新馬情報</h2>
        {NOTE_URL
          ? <a href={NOTE_URL} target="_blank" rel="noreferrer">運営者のnoteを見る ›</a>
          : <span className="muted">新着記事</span>}
      </div>
      {items.length === 0 && <p className="muted">記事を準備中です。</p>}
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

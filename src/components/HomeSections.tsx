import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadGenerationBoard, type GenerationBoard } from "@/lib/popular";
import { defaultSeason } from "@/lib/standings";
import { loadFeeds } from "@/lib/feeds";
import { noteThumb } from "@/lib/note-thumb";
import { COLUMN_FEEDS, NOTE_URL, PICKUP_NOTE } from "@/config/site";
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

/** トップページ：注目コラム（火下遊さんのnote新着2本を大きく表示） */
export async function PickupNote() {
  const p = PICKUP_NOTE;
  let items = (await loadFeeds([{ label: p.fullName, url: p.rss }], p.count)).filter((i) => i.url.startsWith(p.url));
  if (items.length < p.count) items = p.fallback.map((f) => ({ ...f, source: p.fullName, image: null }));
  return (
    <section className="pickup">
      <div className="pickup-head">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.avatar} alt="" className="pickup-avatar" />
        <div>
          <p className="pickup-kicker">注目コラム ・ note</p>
          <h2>{p.name}のnote（新馬戦予想・コラム）</h2>
          <p className="pickup-catch">{p.catch}</p>
        </div>
        <a href={p.url} target="_blank" rel="noreferrer" className="pickup-more">記事一覧 ›</a>
      </div>
      <div className="pickup-grid">
        {items.slice(0, p.count).map((i, n) => {
          const t = noteThumb(i.title, i.date);
          return (
          <a key={i.url} href={i.url} target="_blank" rel="noreferrer" className="pickup-card">
            <span className={`pickup-thumb pickup-thumb-${(n % p.images.length) + 1} pt-${t.kind}`}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.images[n % p.images.length]} alt="" width={1200} height={628} />
              <span className="pt-text" aria-hidden>
                <span className="pt-kicker">{t.kicker}</span>
                <span className="pt-title" style={t.title.length > 5 ? { fontSize: `${Math.max(5, 43 / t.title.length)}cqw` } : undefined}>{t.title}</span>
                {t.date && <span className="pt-date">{t.date}</span>}
                <span className="pt-by">火下遊</span>
              </span>
            </span>
            <span className="pickup-body">
              <span className="column-src">{p.fullName}{i.date && ` ・ ${new Date(i.date).toLocaleDateString("ja-JP", { timeZone: "Asia/Tokyo" })}`}</span>
              <strong>{i.title}</strong>
              <span className="pickup-go">noteで読む ›</span>
            </span>
          </a>
          );
        })}
      </div>
    </section>
  );
}

export function GuideLink() {
  return (
    <p className="muted" style={{ textAlign: "center", marginTop: 24 }}>
      はじめての方は <Link href="/guide">使い方</Link> をご覧ください。
    </p>
  );
}

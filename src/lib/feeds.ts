// RSS / Atom を読んで、新着記事の一覧にする（コラム欄用）。
import * as cheerio from "cheerio";

export type FeedItem = { title: string; url: string; date: string | null; source: string; image: string | null };

export function parseFeed(xml: string, source: string): FeedItem[] {
  const $ = cheerio.load(xml, { xml: true });
  const items: FeedItem[] = [];
  $("item").each((_, el) => {
    const e = $(el);
    items.push({
      title: e.children("title").first().text().trim(),
      url: e.children("link").first().text().trim(),
      date: toIso(e.children("pubDate").first().text()),
      source,
      image: e.find("media\\:thumbnail").attr("url") ?? e.children("media\\:thumbnail").text().trim() ?? null,
    });
  });
  $("entry").each((_, el) => {
    const e = $(el);
    items.push({
      title: e.children("title").first().text().trim(),
      url: e.children("link").attr("href") ?? "",
      date: toIso(e.children("updated").first().text() || e.children("published").first().text()),
      source,
      image: null,
    });
  });
  return items.filter((i) => i.title && /^https?:\/\//.test(i.url)).map((i) => ({ ...i, image: i.image || null }));
}

function toIso(s: string) {
  const t = Date.parse(s.trim());
  return Number.isNaN(t) ? null : new Date(t).toISOString();
}

/** 複数のフィードを読んで新しい順に並べる。読めないフィードは飛ばす（1時間キャッシュ） */
export async function loadFeeds(feeds: { label: string; url: string }[], limit = 8): Promise<FeedItem[]> {
  const lists = await Promise.all(
    feeds.map(async (f) => {
      try {
        const res = await fetch(f.url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(5000) });
        if (!res.ok) return [];
        return parseFeed(await res.text(), f.label);
      } catch {
        return [];
      }
    }),
  );
  return lists.flat().sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "")).slice(0, limit);
}

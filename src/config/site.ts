// サイト全体の設定。コラム欄に並べる記事の取り込み元（RSS）をここに書く。
// note の場合は https://note.com/<ユーザー名>/rss

/** 運営者のnote */
export const NOTE_URL = "https://note.com/pog2026";

export const COLUMN_FEEDS: { label: string; url: string }[] = [
  { label: "運営者note", url: `${NOTE_URL}/rss` },
];

/** 公開URL（検索エンジン向けのリンクやサイトマップに使う） */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pog-site.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "POG（ペーパーオーナーゲーム）";

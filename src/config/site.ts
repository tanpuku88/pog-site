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

/** Google Search Console の所有権確認（HTMLタグの content の値） */
export const GOOGLE_SITE_VERIFICATION = "8nEJuH-Vqyqw4K_qzI_VgSIhSLCUZx32DHtQnCe2OUM";

/** 監修者（/supervisor ページと横の欄に表示）。文章はここを書き換えれば反映されます。 */
export const SUPERVISOR = {
  name: "たんぷく88",
  title: "本サイト監修",
  avatar: "/brand/tanpuku88.svg",
  catch: "POG大会の主催者目線で、使いやすさとデータの見せ方を監修しています。",
  bio: [
    "仲間内のPOG大会を主催してきた経験から、「馬の登録が面倒」「順位の集計が大変」という悩みを解決するためにこのサイトを立ち上げました。",
    "noteでは、新馬戦の振り返りや血統・指名候補のメモなど、POGに役立つ情報を発信しています。",
  ],
  policy: [
    { head: "登録はかんたんに", text: "馬名を数文字入れるだけで指名できることを最優先にしています。" },
    { head: "成績は自動で", text: "賞金・順位は毎晩自動で集計し、手作業の集計をなくします。" },
    { head: "見て楽しいデータを", text: "注目馬30傑・新馬戦・種牡馬や厩舎のデータなど、指名の参考になる情報をそろえます。" },
  ],
};

/** 監修者が運営しているサイト（横の欄と /supervisor に並ぶ）。増やすときはここに1行足す。 */
export const OWNER_SITES: { name: string; url: string; desc: string; thumb: string; icon: string; label: string }[] = [
  {
    name: "POG2026（note）",
    url: NOTE_URL,
    desc: "新馬戦の振り返り・血統メモ・指名候補などPOGのコラム",
    thumb: "/brand/note-pog2026.svg",
    icon: "/brand/icon-note.svg",
    label: "note",
  },
];

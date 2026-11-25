// サイト全体の設定。コラム欄に並べる記事の取り込み元（RSS）をここに書く。
// note の場合は https://note.com/<ユーザー名>/rss

/** 運営者のnote */
export const NOTE_URL = "https://note.com/pog2026";

export const COLUMN_FEEDS: { label: string; url: string }[] = [
  { label: "運営者note", url: `${NOTE_URL}/rss` },
];

/** トップの「注目コラム」に大きく出すnote執筆者。RSSの新着から上位2本を表示（読めないときは fallback を表示） */
export const PICKUP_NOTE = {
  name: "火下遊",
  fullName: "火下遊（競馬予想家）",
  url: "https://note.com/hishita_asobu",
  rss: "https://note.com/hishita_asobu/rss",
  avatar: "https://assets.st-note.com/production/uploads/images/6763558/profile_7d689eecf274cd40a270394e6993b570.jpg?fit=bounds&format=jpeg&quality=85&width=330",
  catch: "競馬歴20数年。競馬場・距離・コース・馬場を加味した血統予想で、新馬戦から2027年ダービー馬を探す。",
  count: 2,
  fallback: [
    {
      title: "2027年ダービーへの道・火下新馬戦予想11月23日(月）東京５Ｒ芝１６００ｍ【12:20】東京６Ｒ芝１４００ｍ【12:50】",
      url: "https://note.com/hishita_asobu/n/n9484d899a63f",
      date: "2026-11-22T17:54:09.000Z",
      image: "https://assets.st-note.com/production/uploads/images/339464157/rectangle_large_type_2_0dd8f8b07cb1fd8235362c502f8b65a6.png?width=800",
    },
    {
      title: "2027年ダービーへの道・火下新馬戦予想11月22日(日）東京５Ｒ芝２０００ｍ【12:10】京都５Ｒ芝１８００ｍ【12:25】",
      url: "https://note.com/hishita_asobu/n/n66d42ba42d3b",
      date: "2026-11-21T15:43:55.000Z",
      image: "https://assets.st-note.com/production/uploads/images/339003527/rectangle_large_type_2_e00b6b0b06585fe0bfd6b8eb60ce7b4b.png?width=800",
    },
  ],
};

/** 公開URL（検索エンジン向けのリンクやサイトマップに使う） */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://pog-site.vercel.app").replace(/\/$/, "");
export const SITE_NAME = "POG（ペーパーオーナーゲーム）";

/** Google Search Console の所有権確認（HTMLタグの content の値） */
export const GOOGLE_SITE_VERIFICATION = "8nEJuH-Vqyqw4K_qzI_VgSIhSLCUZx32DHtQnCe2OUM";

/** 監修者（/supervisor ページと横の欄に表示）。文章はここを書き換えれば反映されます。 */
export const SUPERVISOR = {
  name: "たんぷく88",
  title: "本サイト監修",
  avatar: "/brand/tanpuku88.jpg",
  catch: "POG大会の主催者目線で、使いやすさとデータの見せ方を監修しています。",
  bio: [
    "仲間内のPOG大会を主催してきた経験から、「馬の登録が面倒」「順位の集計が大変」という悩みを解決するためにこのサイトを立ち上げました。",
    "「トリプル馬単伝道師」として、YouTube・ブログ・Xで地方競馬（南関東）と中央競馬の予想を発信。南関東4場の全コースを集計した「南関競馬データ攻略」も運営しています。",
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
  { name: "POG2026（note）", url: NOTE_URL, desc: "新馬戦の振り返り・血統メモ・指名候補などPOGのコラム", thumb: "/brand/note-pog2026.svg", icon: "/brand/icon-note.svg", label: "note" },
  { name: "たんぷくの当たる無料競馬予想", url: "https://xn--n8j053hxwe15nbnjri1cm7s.com/", desc: "地方重賞・中央重賞を、データと厩舎・調教の声で掘り下げるブログ", thumb: "/brand/thumb-blog.svg", icon: "/brand/icon-blog.svg", label: "ブログ" },
  { name: "南関競馬データ攻略", url: "https://nankan-course-9899.web.app", desc: "大井・浦和・船橋・川崎の全19コースを枠順・脚質・人気別に集計", thumb: "/brand/thumb-nankan.svg", icon: "/brand/icon-nankan.svg", label: "データ" },
  { name: "YouTube たんぷく88", url: "https://www.youtube.com/@kikumasamune88", desc: "地方競馬・中央競馬の予想動画を配信", thumb: "/brand/thumb-youtube.svg", icon: "/brand/icon-youtube.svg", label: "動画" },
  { name: "X @kikumasamune88", url: "https://x.com/kikumasamune88", desc: "予想や最新情報をポスト", thumb: "/brand/thumb-x.svg", icon: "/brand/icon-x.svg", label: "X" },
  { name: "たんぷく88 公式ハブ", url: "https://tanpuku88-hub.web.app/", desc: "サイト・SNS・グッズへのリンクをまとめた公式ページ", thumb: "/brand/thumb-hub.svg", icon: "/brand/icon-hub.svg", label: "リンク集" },
];

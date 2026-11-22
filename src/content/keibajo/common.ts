import type { Source } from "./types";

// 中央・地方で共通の「遊び方」「注意点」。2026-11-22 に JRA・地方競馬情報サイトで確認。

export const JRA_HOWTO = [
  { title: "入場券を用意する", body: "競馬場の入口の券売機で当日券を買うか（現金）、「JRA指定席・入場券ネット予約」で前もって予約します。入場料は東京・中山・京都・阪神が当日200円（ネット予約100円）、ほかの6場は100円。15歳未満は無料です。G1の日は料金が上がり、ネット予約だけになる日もあります。" },
  { title: "出馬表を見る", body: "場内でもらえるレーシングプログラムや、スマホのJRA公式サイトで出走馬を確認。パドック（下見所）で馬の様子を見てから決めるのが競馬場ならではの楽しみです。" },
  { title: "マークカードに記入", body: "券種（単勝・複勝・馬連・ワイド・3連単など）・馬番・金額を鉛筆で塗ります。1枚100円から。わからなければ「インフォメーション」で聞けば教えてもらえます。" },
  { title: "発売機で買う", body: "現金のほか、JRAのカード「UMACA（ウマカ）」でも買えます。スマホで買える「UMACAスマート」もあります。馬券を買えるのは20歳以上です。" },
  { title: "応援して、当たったら払い戻し", body: "当たった馬券は払戻機に入れるとすぐ現金に。平日の払い戻しサービスは2027年6月21日で終わると発表されているので、当たり券は開催日のうちに換金しておくと安心です。" },
];

export const NAR_HOWTO = [
  { title: "入場する", body: "地方競馬の入場料は無料〜数百円ほど。競馬場によって違うので、各ページと公式サイトで確認してください。駐車場が無料の競馬場も多いです。" },
  { title: "出馬表・予想紙を手に入れる", body: "場内の売店で地元の専門紙が買えます。公式サイトの出馬表（無料）でもOK。パドックとコースが近く、馬を間近で見られるのが地方競馬の魅力です。" },
  { title: "マークカードで馬券を買う", body: "中央競馬とほぼ同じ形のマークカード。1枚100円から。馬券を買えるのは20歳以上です。" },
  { title: "ナイターも楽しむ", body: "大井・川崎・船橋・門別・高知・帯広（ばんえい）など、夜にレースをする競馬場がたくさんあります。仕事帰りに寄れるのも地方競馬ならでは。" },
  { title: "ネットでも買える", body: "地方競馬は「SPAT4」「楽天競馬」「オッズパーク」などのネット投票でも買えます。中央競馬の「即PAT」とは別の登録が必要です。" },
];

export const COMMON_MANNERS = [
  "馬券を買えるのは20歳以上。学生でも20歳未満は買えません",
  "パドックや返し馬で、フラッシュ撮影や大きな声で馬を驚かせない",
  "開催日・入場方法・料金は変わることがあります。出かける前に公式サイトを確認",
  "遊ぶ金額は先に決めておく。のめり込みが心配なときは公式の相談窓口へ",
];

export const JRA_SOURCES: Source[] = [
  { label: "JRA 各競馬場の「所在地・アクセス」「コース紹介」", url: "https://www.jra.go.jp/facilities/", date: "2026-11-22 確認" },
  { label: "JRA 各競馬場「開催日のご入場方法」（入場料）", url: "https://www.jra.go.jp/facilities/race/tokyo/news/nyujou.html", date: "2026-11-22 確認" },
  { label: "JRA「2026年度競馬番組等」（開催日数）", url: "https://www.jra.go.jp/news/202511/111801.html", date: "2025-11-18" },
  { label: "JRA「中央競馬の平日払戻サービスの終了」", url: "https://www.jra.go.jp/news/202609/092805.html", date: "2026-09-28" },
  { label: "広島空港 国内線フライト時刻表（2026/10/25〜2027/1/31）", url: "https://www.hij.airport.jp/flight/diagram/", date: "2026-11-22 確認" },
];

export const NAR_SOURCES: Source[] = [
  { label: "地方競馬情報サイト 競馬場ガイド（アクセス・施設）", url: "https://www.keiba.go.jp/guide/", date: "2026-11-22 確認" },
  { label: "地方競馬情報サイト コース一覧（1周・直線・高低差）", url: "https://www.keiba.go.jp/guide/course/", date: "2026-11-22 確認" },
];

/** 時刻表などのリンク */
export const LINKS = {
  jrWest: { label: "JRおでかけネット（山陽・東海道新幹線の時刻）", url: "https://www.jr-odekake.net/" },
  jrEast: { label: "JR東日本（東北・上越新幹線の時刻）", url: "https://www.jreast.co.jp/" },
  hij: { label: "広島空港 フライト時刻表", url: "https://www.hij.airport.jp/flight/diagram/" },
  hijBus: { label: "広島空港 リムジンバス時刻表（広島駅新幹線口）", url: "https://www.hij.airport.jp/access/timetable/2.html" },
  hnd: { label: "羽田空港 国内線フライト情報", url: "https://tokyo-haneda.com/" },
};

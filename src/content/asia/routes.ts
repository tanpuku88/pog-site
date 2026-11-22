import type { JapanRoute } from "./types";

// 東京・広島からの行き方。時刻は例。
// 広島空港の国際線は、空港公式の時刻表（2026年10月25日〜2027年1月31日）を 2026-11-22 に確認して記載。
// それ以外の便は「例」として目安の時刻・所要時間を書き、公式の時刻表へのリンクを付ける。

const HIJ_BUS = { label: "広島空港 リムジンバス時刻表（広島駅新幹線口）", url: "https://www.hij.airport.jp/access/timetable/2.html" };
const HIJ_FLIGHTS = { label: "広島空港 フライト時刻表", url: "https://www.hij.airport.jp/flight/diagram/" };
const HND = { label: "羽田空港 国際線フライト情報", url: "https://tokyo-haneda.com/" };
const NRT = { label: "成田空港 フライト情報", url: "https://www.narita-airport.jp/" };

export const ROUTES: Record<string, JapanRoute[]> = {
  korea: [
    {
      from: "東京",
      title: "羽田→金浦（ソウル）で土日のソウル競馬",
      summary: "飛行機 約2時間半＋地下鉄 約1時間。金曜の夜に出れば土曜の朝から競馬場へ",
      steps: [
        { time: "金 18:00ごろ", mode: "plane", text: "羽田空港を出発（例）。羽田〜金浦はJAL・ANA・大韓航空・アシアナ航空などが毎日運航、約2時間半" },
        { time: "金 20:30ごろ", mode: "plane", text: "金浦（キンポ）空港に到着。韓国と日本は時差なし" },
        { mode: "subway", text: "地下鉄9号線（急行）で「銅雀（トンジャク）」へ約25分、4号線に乗り換えて明洞（ミョンドン）などのホテルへ" },
        { time: "土 10:00", mode: "subway", text: "明洞駅から4号線に乗って約40分、「競馬公園（キョンマゴンウォン）」駅で下車。駅から歩いてすぐ" },
        { time: "日 夕方", mode: "plane", text: "金浦空港から羽田へ（例）。日曜の最終レースまで見るなら夜の便を" },
      ],
      links: [HND, { label: "金浦空港 フライト情報", url: "https://www.airport.co.kr/gimpo/" }],
    },
    {
      from: "広島",
      title: "広島空港→仁川（ソウル）直行便で土日のソウル競馬",
      summary: "チェジュ航空の直行便が毎日2往復（2026年10月25日〜2027年1月31日の時刻）",
      steps: [
        { time: "金 9:00", mode: "bus", text: "広島駅新幹線口からリムジンバス。約45〜50分・1,500円。10〜20分おきに出ています" },
        { time: "金 10:30", mode: "plane", text: "広島空港発 チェジュ航空 7C1616 便（毎日運航）" },
        { time: "金 12:20", mode: "plane", text: "仁川（インチョン）空港に到着" },
        { mode: "train", text: "空港鉄道（AREX）でソウル駅へ（直通列車で約45分）。地下鉄4号線に乗り換えてホテルへ" },
        { time: "土 10:00", mode: "subway", text: "4号線で「競馬公園」駅へ。ソウル駅から約35分" },
        { time: "月 13:30", mode: "plane", text: "仁川発 7C1617 便で15:15に広島着。土日とも競馬を見るなら月曜の便で帰るのがおすすめ（日曜の便は13:30発なので、日曜のレースは見られません）" },
      ],
      links: [{ label: "広島空港 ソウル便の時刻表", url: "https://www.hij.airport.jp/flight/kokusai/korea.html" }, HIJ_BUS],
    },
    {
      from: "東京",
      title: "成田・羽田→金海（釜山）で金曜の釜山競馬",
      summary: "飛行機 約2時間15分＋車 約20分。金海空港のすぐ近くに競馬場があります",
      steps: [
        { time: "金 朝", mode: "plane", text: "成田・羽田から金海（キメ）空港へ直行便（例）。約2時間15分" },
        { mode: "taxi", text: "金海空港からタクシーで約20分で釜山慶南競馬場" },
        { time: "金 夕方", mode: "train", text: "競馬のあとは釜山市内へ。翌日KTX（約2時間半）でソウルへ移動すれば、週末のソウル競馬とはしごできます" },
      ],
      links: [NRT, HND],
    },
    {
      from: "広島",
      title: "新幹線で博多→福岡空港から金海（釜山）へ",
      summary: "広島空港に釜山便はないので、福岡経由が近道。合計 約3時間半〜",
      steps: [
        { time: "金 7:00ごろ", mode: "train", text: "広島駅から山陽新幹線で博多へ。のぞみ・みずほで約1時間05分（例）" },
        { mode: "subway", text: "博多駅から福岡市地下鉄で福岡空港駅へ約5分。国際線ターミナルへは連絡バス" },
        { time: "金 10:00ごろ", mode: "plane", text: "福岡空港から金海空港へ。約55分（例。大韓航空・エアプサンなど）" },
        { mode: "taxi", text: "金海空港からタクシーで約20分、釜山慶南競馬場へ" },
      ],
      links: [{ label: "JRおでかけネット（山陽新幹線の時刻）", url: "https://www.jr-odekake.net/" }, { label: "福岡空港 国際線フライト情報", url: "https://www.fukuoka-airport.jp/" }],
    },
  ],
  hongkong: [
    {
      from: "東京",
      title: "羽田→香港で週末シャティン",
      summary: "飛行機 約5時間（時差は日本より1時間遅れ）。空港から市内へは電車で約24分",
      steps: [
        { time: "金 9:00ごろ", mode: "plane", text: "羽田空港を出発（例）。羽田・成田から香港へは毎日多くの便があります" },
        { time: "金 13:00ごろ（現地）", mode: "plane", text: "香港国際空港に到着" },
        { mode: "train", text: "エアポートエクスプレスで九龍駅または香港駅へ（約20〜24分）" },
        { time: "土 or 日 昼", mode: "train", text: "MTR東鉄線で「馬場（レースコース）」駅へ。開催日だけ止まる駅で、競馬場の目の前" },
        { time: "日 or 月", mode: "plane", text: "香港から羽田へ（例）" },
      ],
      links: [HND, NRT, { label: "MTR（香港の鉄道）", url: "https://www.mtr.com.hk/" }],
    },
    {
      from: "広島",
      title: "広島空港→香港直行便で、着いたその夜にハッピーバレー",
      summary: "香港エクスプレスの直行便が月・水・金・土に1往復（2026年10月25日〜2027年1月31日の時刻）。水曜の便ならその夜のナイターへ",
      steps: [
        { time: "水 13:00", mode: "bus", text: "広島駅新幹線口からリムジンバス。約45〜50分・1,500円" },
        { time: "水 14:40", mode: "plane", text: "広島空港発 香港エクスプレス UO823 便（キャセイパシフィック航空との共同運航）" },
        { time: "水 18:00（現地）", mode: "plane", text: "香港国際空港に到着" },
        { mode: "train", text: "エアポートエクスプレスで香港駅へ約24分。タクシーかトラムでハッピーバレーへ" },
        { time: "水 19:30ごろ", mode: "walk", text: "ハッピーバレー競馬場に到着。ナイターの後半のレースに間に合う計算です（入国審査の混み具合しだい）" },
        { time: "金 9:30（現地）", mode: "plane", text: "香港発 UO822 便で13:45に広島着。リムジンバスで広島駅へ" },
      ],
      links: [{ label: "広島空港 香港便の時刻表", url: "https://www.hij.airport.jp/flight/kokusai/hongkong.html" }, HIJ_BUS],
    },
  ],
  uae: [
    {
      from: "東京",
      title: "成田・羽田からドバイ直行便",
      summary: "夜行便で約11時間。到着日の夕方からメイダンへ",
      steps: [
        { time: "夜", mode: "plane", text: "成田・羽田からドバイへ直行便（例。エミレーツ航空）。約11時間、日本より5時間遅れ" },
        { time: "翌朝", mode: "plane", text: "ドバイ国際空港に到着。ホテルで休憩" },
        { time: "夕方", mode: "taxi", text: "タクシーでメイダン競馬場へ約20分" },
      ],
      links: [NRT, HND],
    },
    {
      from: "広島",
      title: "関西空港または羽田で乗り継いでドバイへ",
      summary: "広島からは関空・羽田に出て直行便に乗るのが近道",
      steps: [
        { mode: "train", text: "広島駅から新幹線で新大阪へ約1時間20分、特急はるかで関西空港へ約50分（例）" },
        { mode: "plane", text: "または広島空港から羽田へ国内線で約1時間20分" },
        { time: "夜", mode: "plane", text: "関西空港・羽田からドバイへ直行便（例）" },
      ],
      links: [HIJ_FLIGHTS, { label: "関西空港 フライト情報", url: "https://www.kansai-airport.or.jp/" }],
    },
  ],
};

/** 共通の行き方（直行便のない国など） */
export function genericRoutes(country: string, airport: string, tokyoNote: string, hiroshimaNote: string): JapanRoute[] {
  return [
    {
      from: "東京",
      title: `成田・羽田から${airport}へ`,
      summary: tokyoNote,
      steps: [
        { mode: "plane", text: tokyoNote },
        { mode: "taxi", text: `${airport}から競馬場へはタクシー・配車アプリが便利` },
      ],
      links: [NRT, HND],
    },
    {
      from: "広島",
      title: `関西空港・羽田・アジアの空港で乗り継いで${country}へ`,
      summary: hiroshimaNote,
      steps: [
        { mode: "train", text: "広島駅から新幹線で新大阪へ約1時間20分、特急はるかで関西空港へ約50分（例）" },
        { mode: "plane", text: "または広島空港から羽田へ国内線（約1時間20分）、ソウル・台北・香港へ直行便で出て乗り継ぐ方法も" },
        { mode: "plane", text: hiroshimaNote },
      ],
      links: [HIJ_FLIGHTS, { label: "関西空港 フライト情報", url: "https://www.kansai-airport.or.jp/" }],
    },
  ];
}

ROUTES.saudi = genericRoutes("サウジアラビア", "リヤド（キング・ハーリド国際空港）", "日本からリヤドへの直行便はないため、ドバイ・ドーハなど中東の空港で乗り継ぎ（合計 約15〜18時間・例）", "中東の空港で乗り継いでリヤドへ（例）");
ROUTES.qatar = genericRoutes("カタール", "ドーハ（ハマド国際空港）", "成田・羽田からドーハへ直行便（例。カタール航空）。約12時間", "羽田などで乗り継いでドーハへ（例）");
ROUTES.bahrain = genericRoutes("バーレーン", "バーレーン国際空港", "日本からの直行便はないため、ドーハ・ドバイなどで乗り継ぎ（例）。空港から競馬場のあるサヒールまで車で約40分", "中東の空港で乗り継いでバーレーンへ（例）");
ROUTES.india = genericRoutes("インド", "ムンバイ（チャトラパティ・シヴァージー国際空港）", "成田・羽田からデリーまたはムンバイへ（直行便または乗り継ぎ、約10時間・例）。ムンバイ空港から競馬場へは車で約40分〜1時間", "アジアの空港などで乗り継いでムンバイへ（例）");
ROUTES.malaysia = genericRoutes("マレーシア", "クアラルンプール国際空港", "成田・羽田からクアラルンプールへ直行便（約7時間半・例）。空港からセランゴール・ターフクラブへは車で約40分", "関西空港からの直行便や、台北・香港での乗り継ぎでクアラルンプールへ（例）");
ROUTES.philippines = genericRoutes("フィリピン", "マニラ（ニノイ・アキノ国際空港）", "成田・羽田からマニラへ直行便（約5時間・例）。マニラから競馬場のあるバタンガス州へは車で約1.5〜2時間", "福岡・関西空港からの直行便や、香港・台北での乗り継ぎでマニラへ（例）");
ROUTES.turkey = genericRoutes("トルコ", "イスタンブール空港", "成田・羽田からイスタンブールへ直行便（例。ターキッシュエアラインズ）。約13時間。空港から競馬場へは車で約45分", "関西空港・羽田からの直行便に乗り継いでイスタンブールへ（例）");

/** おすすめサイト（相互リンク先）。フッターにも一部を掲載する */
export type RecommendedSite = { name: string; url: string; label: string; desc: string };

export const RECOMMENDED_SITES: RecommendedSite[] = [
  {
    name: "競馬の魅力",
    url: "https://www.keibanomiryoku.com/",
    label: "総合情報",
    desc: "レース予想・結果から読み物まで、競馬の話題を幅広く扱う総合情報サイト。週末の重賞チェックや、競馬をもっと楽しみたいときの読み物にもどうぞ。",
  },
  {
    name: "ゆるゆる日和",
    url: "https://yuruyuru-biyori.com/",
    label: "データ・血統",
    desc: "ウイニングポストのデータ検証や血統・産駒分析が充実したサイト。POGドラフト向けの記事もあり、指名馬選びの参考になります。",
  },
  {
    name: "まとまり系競馬サロン Mラジ",
    url: "https://keiba-mradio.com/",
    label: "ラジオ",
    desc: "「Mの法則」を軸にした競馬予想ラジオ／ポッドキャスト。レース回顧から週末の展望まで、音声でじっくり楽しめます。",
  },
];

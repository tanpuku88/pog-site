import type { CountryGuide } from "./types";

// 内容は 2026年11月22日 に、Racing Post（2026/9/3 従化の開催延期）、The Standard（2026/7/1 従化競馬場）、
// Inside Asian Gaming（2025/11/9 初開催の計画）、Thoroughbred Daily News（2020/10/3 武漢の競馬再開）、
// Wikipedia（中国の競馬の歴史）で確認。

export const china: CountryGuide = {
  slug: "china",
  name: "中国（本土）",
  nameEn: "Mainland China",
  flag: "cn",
  scene: "city",
  sky: ["#3b1f2b", "#c4513b", "#f2c27a"],
  tagline: "馬券のない国で、競馬の再開を待つ広州・従化",
  intro: [
    "中国本土では賭けごととしての競馬が長く禁止されてきました。1999年を最後に、ルールにもとづく公式の競馬は行われていないとされます（香港とマカオは別）。",
    "いま注目されているのが、広州市従化（じゅうか・ツォンファ）にある香港ジョッキークラブの「従化競馬場」です。2018年8月から香港の馬のトレーニング施設として使われ、2026年10月31日に本土で初めての公式レースを開く予定でしたが、関係部門のリスク評価を受けて延期が発表されました（2026年9月時点）。",
    "予定では馬券は売らず、レースそのものを見せる形です。湖北省の武漢でも、国際招待の競馬イベントが開かれてきました。日程は香港ジョッキークラブなどの発表で確認してください。",
  ],
  updated: "2026-11-22",
  quickFacts: [
    { k: "馬券", v: "なし", s: "本土では賭けごと禁止" },
    { k: "従化競馬場", v: "延期中", s: "初開催予定は2026/10/31だった" },
    { k: "広さ", v: "約150", s: "ヘクタール（2010年アジア大会の馬術会場跡）" },
    { k: "香港から", v: "約200", s: "km（車で約3時間）" },
  ],
  tracks: [
    {
      name: "従化競馬場（香港ジョッキークラブ）",
      local: "从化马场（Conghua Racecourse）",
      city: "広東省 広州市 従化区",
      days: "初の公式開催は延期中（2026年9月発表）",
      feature: "香港ジョッキークラブが2018年から使うトレーニング施設。1,000頭以上の馬を収容でき、試験レースや展示レースも行われてきた。",
      access: ["広州市内から車で（従化区は広州の北部）", "香港のシャティン競馬場から車で約3時間"],
      admission: "一般公開の方法は未発表。香港ジョッキークラブの発表を確認",
      nearby: ["従化温泉", "広州の広州塔（カントンタワー）", "沙面（広州の西洋建築の島）"],
      color: "#b23a3a",
    },
    {
      name: "武漢の競馬場",
      local: "武汉（Wuhan）",
      city: "湖北省 武漢市",
      days: "イベント開催時のみ",
      feature: "国際招待の競馬イベントが開かれてきた。2020年10月1日には「チャイナカップ」で競馬が再開され、約3,000人が観戦した。",
      access: ["武漢市内から車で", "開催の有無は現地の発表で確認"],
      admission: "イベントごとに異なる",
      nearby: ["黄鶴楼", "東湖"],
      color: "#7a3a5a",
    },
  ],
  howTo: [
    { title: "開催の発表を待つ", body: "従化の公式レースは延期中。香港ジョッキークラブのニュースで再開の日程を確認します。" },
    { title: "香港とあわせて旅する", body: "香港から広州へは高速鉄道で行けます。香港の競馬と組み合わせる旅がおすすめです。" },
    { title: "入国の条件を確認", body: "日本のパスポートでの入国条件（ビザ）は、出発前に中国大使館などで最新情報を確認します。" },
    { title: "馬券のない競馬を楽しむ", body: "本土では馬券はありません。馬と騎手の走りそのものを楽しみましょう。" },
    { title: "香港で馬券を", body: "馬券を買いたいときは香港のシャティン・ハッピーバレーへ。" },
  ],
  termsTitle: "現地で使えることば（中国語）",
  terms: [
    { jp: "こんにちは", local: "你好", read: "ニーハオ" },
    { jp: "ありがとう", local: "谢谢", read: "シェシェ" },
    { jp: "馬", local: "马", read: "マー" },
    { jp: "競馬", local: "赛马", read: "サイマー" },
    { jp: "競馬場", local: "马场", read: "マーチャン" },
  ],
  plans: [
    {
      id: "hk-gz",
      title: "香港の競馬と広州 3泊4日",
      catch: "香港で馬券、広州で飲茶と従化の温泉",
      nights: "3泊4日",
      best: "従化の開催が決まったら、その週末に",
      days: [
        { label: "1日目（水）", items: [{ time: "夜", text: "香港に着いてハッピーバレーのナイター競馬" }] },
        { label: "2日目", items: [{ time: "午前", text: "高速鉄道で広州へ（香港西九龍駅から）" }, { time: "夜", text: "広州で広東料理" }] },
        { label: "3日目", items: [{ time: "昼", text: "従化へ。開催があれば競馬場、なければ従化温泉でのんびり" }] },
        { label: "4日目", items: [{ time: "", text: "香港へ戻って帰国" }] },
      ],
      tips: ["中国本土ではLINE・Googleが使えないことがあります。地図アプリなどは事前に準備を", "従化の開催日程は延期中。発表を確認してから予約を"],
    },
  ],
  bigRaces: [
    { name: "従化競馬場の初の公式開催", when: "延期中（当初予定は2026年10月31日）", where: "広州・従化", body: "香港ジョッキークラブが本土で初めて開く公式レース。最初の開催は招待客中心、2回目から一般公開の予定と報じられていた。" },
    { name: "武漢の国際招待レース", when: "年によって異なる", where: "武漢", body: "海外の馬・騎手を招いて開かれてきたイベント。" },
  ],
  pogCorner: [
    "香港の馬は従化でトレーニングすることもあります。香港国際競走で日本馬と戦う馬たちの「もう一つの拠点」として知っておくと面白いです。",
  ],
  culture: [
    { title: "競馬の禁止と例外", body: "中国本土では賭けごととしての競馬が禁止されています。香港とマカオは例外で、香港では今も競馬が大人気です。" },
    { title: "少数民族の馬の文化", body: "内モンゴルなどでは、ナーダムのような伝統行事で馬の競技が受けつがれています。" },
    { title: "従化という町", body: "広州の北にある温泉と緑の町。2010年アジア大会では馬術の会場になりました。" },
  ],
  foods: [
    { name: "飲茶（ヤムチャ）", local: "饮茶", where: "広州の茶楼", body: "点心とお茶の朝ごはん。広州が本場。", icon: "rice" },
    { name: "焼味（ロースト）", local: "烧味", where: "広州の食堂", body: "チャーシューやローストダックをご飯にのせて。", icon: "bbq" },
    { name: "熱乾麺", local: "热干面", where: "武漢の朝の屋台", body: "ごまだれをからめた武漢名物の麺。", icon: "noodle" },
    { name: "腸粉", local: "肠粉", where: "広州の食堂", body: "米粉の薄い生地で具を巻いた広東の朝ごはん。", icon: "street" },
  ],
  manners: [
    "中国本土では馬券は売られていません。賭けごとはしないこと",
    "入国条件（ビザ）は出発前に大使館などで確認",
    "従化の開催は延期中。香港ジョッキークラブの発表を確認",
    "撮影禁止の場所があります。表示に従いましょう",
  ],
  sources: [
    { label: "Racing Post 従化の10月の開催が延期（1999年以来の本土の競馬）", url: "https://www.racingpost.com/news/industry/the-27-year-wait-for-racing-to-return-to-mainland-china-goes-on-after-october-raceday-postponed-to-a-later-date-a12FG5W0sYLx/", date: "2026-09-03" },
    { label: "The Standard 従化競馬場（馬券なし・2018年8月から使用・広さ）", url: "https://www.thestandard.com.hk/news/article/336106/Off-to-the-races-Conghua-Racecourse-set-to-usher-in-new-era-for-horse-industry", date: "2026-07-01" },
    { label: "Inside Asian Gaming 初開催は2026年10月31日の計画", url: "https://asgam.com/2025/11/09/hong-kong-jockey-club-to-hold-first-race-meeting-at-new-mainland-china-racecourse-in-october-2026/", date: "2025-11-09" },
    { label: "Thoroughbred Daily News 武漢で競馬再開", url: "https://www.thoroughbreddailynews.com/racing-resumes-in-wuhan-china/", date: "2020-10-03" },
  ],
};

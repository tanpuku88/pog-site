import type { CountryGuide } from "./types";

// 内容は 2026年11月22日 に、RRI（2025/7/30 三冠達成）、ANTARA（2025/7/27 インドネシアダービー）、
// The Jakarta Post（2025/3/26 競馬復活の取り組み）、Wikipedia（インドネシアダービー、プロマス競馬場、インドネシアの競馬）で確認。

export const indonesia: CountryGuide = {
  slug: "indonesia",
  name: "インドネシア",
  nameEn: "Indonesia",
  flag: "id",
  scene: "mountain",
  sky: ["#1d4f6e", "#e58a4e", "#f8d38b"],
  tagline: "ジョグジャカルタのダービーと、島ごとの伝統競馬",
  intro: [
    "インドネシアの競馬の大一番「インドネシアダービー」は、2024年・2025年にジョグジャカルタ特別州バントゥルのスルタン・アグン競馬場で開かれました。2025年は7月27日に行われ、キング・アルヘンティンが三冠を達成しています。",
    "ジャカルタのプロマス競馬場（1971〜2016年）は2018年アジア大会の馬術会場に建て替えられ、いまは競馬の復活をめざす取り組みが進んでいます。2023年から民間団体SARGA.COがPORDASI（インドネシア馬事協会）と一緒にレースのシリーズを開き、2024年のダービーには約3万6千人が集まりました。",
    "インドネシアでは1981年から賭けごとが全国で禁止されていて、馬券はありません。西スマトラの「パチュ・クド」やスンバワ島の「マエン・ジャラン」など、島ごとの伝統の競馬も残っています。",
  ],
  updated: "2026-11-22",
  quickFacts: [
    { k: "ダービー", v: "2000m", s: "3歳・2025年は7月27日" },
    { k: "馬券", v: "なし", s: "1981年から賭けごと禁止" },
    { k: "2024年ダービー", v: "約3.6万", s: "人が観戦" },
    { k: "東京から", v: "約8", s: "時間（ジャカルタへ直行便・目安）" },
  ],
  tracks: [
    {
      name: "スルタン・アグン競馬場",
      local: "Stadion Sultan Agung（Bantul）",
      city: "ジョグジャカルタ特別州 バントゥル県",
      days: "シリーズ開催日（ダービーは7月ごろ）",
      feature: "2024・2025年のインドネシアダービーの舞台。家族向けのイベントや音楽ライブも合わせて開かれ、お祭りのような雰囲気。",
      access: ["ジョグジャカルタ市内から車で約30〜40分（目安）", "ジョグジャカルタへはジャカルタ・バリから国内線で"],
      admission: "大会ごとに異なる。主催者の発表を確認",
      nearby: ["ボロブドゥール寺院（世界遺産）", "プランバナン寺院（世界遺産）", "ジョグジャカルタの王宮", "パラントリティス海岸"],
      color: "#c0392b",
    },
  ],
  howTo: [
    { title: "大会の日程を確認", body: "SARGA.COのシリーズ（Indonesia's Horse Racing）の日程を主催者の発表で確認します。" },
    { title: "ジョグジャカルタへ", body: "ジャカルタやバリから国内線で約1時間。遺跡めぐりとセットにしましょう。" },
    { title: "競馬場へ", body: "市内から車で。大会の日は混むので早めに出発します。" },
    { title: "レースとお祭りを楽しむ", body: "馬券はないので、応援する馬を決めて観戦。屋台や音楽ライブも楽しめます。" },
    { title: "伝統競馬も", body: "西スマトラやスンバワ島などでは、祭りに合わせて伝統の競馬が開かれます。" },
  ],
  termsTitle: "現地で使えることば（インドネシア語）",
  terms: [
    { jp: "こんにちは", local: "Halo / Selamat siang", read: "ハロー／スラマッ・シアン" },
    { jp: "ありがとう", local: "Terima kasih", read: "トゥリマ・カシ" },
    { jp: "馬", local: "Kuda", read: "クダ" },
    { jp: "競馬", local: "Pacuan kuda", read: "パチュアン・クダ" },
    { jp: "がんばれ！", local: "Ayo!", read: "アヨ！" },
  ],
  plans: [
    {
      id: "derby",
      title: "インドネシアダービーと遺跡めぐり 4泊6日",
      catch: "ボロブドゥールの朝日と、ダービーの熱気",
      nights: "4泊6日",
      best: "7月のダービー開催日",
      days: [
        { label: "1日目", items: [{ time: "", text: "成田・羽田からジャカルタへ、国内線でジョグジャカルタへ（例）" }] },
        { label: "2日目", items: [{ time: "早朝", text: "ボロブドゥール寺院で朝日" }, { time: "午後", text: "プランバナン寺院" }] },
        { label: "3日目（ダービー）", items: [{ time: "昼〜夕方", text: "スルタン・アグン競馬場でインドネシアダービー観戦" }] },
        { label: "4日目", items: [{ time: "", text: "王宮と市場めぐり、夜はグドゥッ（ジャックフルーツの煮物）" }] },
        { label: "5〜6日目", items: [{ time: "", text: "ジャカルタ経由で帰国" }] },
      ],
      tips: ["日差しが強いので帽子と水を", "2026年以降の開催地は主催者の発表で確認を"],
    },
  ],
  bigRaces: [
    { name: "インドネシアダービー", when: "7月ごろ（2025年は7月27日）", where: "2024・2025年はバントゥル・2000m", body: "3歳馬のクラシック。2025年の1着賞金は3億ルピア。三冠の最終戦。" },
    { name: "インドネシア三冠", when: "シリーズ戦", where: "1200m・1600m・2000m", body: "2025年にキング・アルヘンティンが達成。2014年のジョハル・マニック以来の三冠馬。" },
    { name: "ハメンクブウォノ10世カップ", when: "2025年に開催", where: "バントゥル", body: "ジョグジャカルタのスルタンの名を冠したレース。" },
  ],
  pogCorner: [
    "インドネシアの三冠はインドネシア生まれの馬のためのシリーズ。日本の三冠と比べながら見ると、国ごとの競馬の作り方の違いがわかります。",
  ],
  culture: [
    { title: "賭けない競馬の復活", body: "1981年の賭けごと禁止で競馬場は勢いを失いましたが、いまは音楽やお祭りと組み合わせた「見て楽しむ競馬」として人気を取り戻しつつあります。" },
    { title: "島ごとの伝統競馬", body: "西スマトラのパチュ・クド、ビマのパチョア・ジャラ、アチェのパチュ・クデなど。2016年に国の無形文化財になったものもあります。" },
    { title: "プロマス競馬場の記憶", body: "ジャカルタのプロマス競馬場は1971年から2016年まで使われ、ダービーも39回開かれました。" },
  ],
  foods: [
    { name: "グドゥッ", local: "Gudeg", where: "ジョグジャカルタ", body: "若いジャックフルーツを甘く煮た古都の名物。", icon: "rice" },
    { name: "ナシゴレン", local: "Nasi goreng", where: "どこでも", body: "インドネシア風チャーハン。", icon: "rice" },
    { name: "サテ", local: "Sate", where: "屋台", body: "ピーナッツソースの串焼き。", icon: "bbq" },
    { name: "バクソ", local: "Bakso", where: "屋台", body: "肉団子のスープ。", icon: "soup" },
  ],
  manners: [
    "インドネシアでは賭けごとが禁止。馬券はありません",
    "寺院の見学は肌を隠す服装で",
    "大会の日程・会場は変わることがあります。主催者の発表を確認",
    "日本のパスポートでの入国条件は大使館などで最新情報を確認",
  ],
  sources: [
    { label: "RRI キング・アルヘンティンが2025年の三冠", url: "https://rri.co.id/en/international/1734801/king-argentine-clinches-2025-triple-crown-in-indonesia", date: "2025-07-30" },
    { label: "ANTARA インドネシアダービー2025（156頭・賞金）", url: "https://jogja.antaranews.com/berita/757401/156-kuda-berlaga-dalam-ihr-indonesia-derby-di-stadion-bantul", date: "2025-07-27" },
    { label: "The Jakarta Post 競馬復活の取り組み", url: "https://www.thejakartapost.com/sports/2025/03/26/sports-promoter-aims-to-revive-indonesian-horse-racing", date: "2025-03-26" },
    { label: "Wikipedia インドネシアダービー", url: "https://en.wikipedia.org/wiki/Indonesia_Derby", date: "2026-11-22 確認" },
    { label: "Wikipedia プロマス競馬場", url: "https://en.wikipedia.org/wiki/Pulomas_Racecourse", date: "2026-11-22 確認" },
    { label: "Wikipedia インドネシアの競馬（伝統競馬）", url: "https://en.wikipedia.org/wiki/Horse_racing_in_Indonesia", date: "2026-11-22 確認" },
  ],
};

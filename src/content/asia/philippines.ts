import type { CountryGuide } from "./types";

// 内容は 2026年11月22日 に、フィリピン競馬の解説（ph-racing.com）と各競馬場・大統領杯の資料で確認。

export const philippines: CountryGuide = {
  slug: "philippines",
  name: "フィリピン",
  nameEn: "Philippines",
  flag: "ph",
  scene: "mountain",
  sky: ["#12305a", "#e0703f", "#ffd27a"],
  tagline: "マニラの南、バタンガスの高原で走るアジアの競馬",
  intro: [
    "フィリピンの競馬は「フィリピン競馬委員会（Philracom）」が管理しています。マニラ首都圏の競馬場は移転・閉場が続き、今はマニラから南へ車で1〜2時間のバタンガス州が中心です。",
    "12月の「大統領杯（プレジデンシャル・ゴールドカップ）」は1973年から続く国内最大のレース。2025年には国内G1になり、賞金は1,500万ペソに。",
    "フィリピン独自の三冠シリーズもあり、国内で生まれた馬の世代戦が楽しめます。",
  ],
  updated: "2026-11-22",
  quickFacts: [
    { k: "大レース", v: "12月", s: "大統領杯（2000m）" },
    { k: "賞金", v: "1,500万", s: "ペソ（大統領杯）" },
    { k: "中心地", v: "バタンガス", s: "マニラから車で1〜2時間" },
    { k: "東京から", v: "約5", s: "時間（マニラ）" },
  ],
  tracks: [
    {
      name: "メトロターフ競馬場",
      local: "MetroTurf Racecourse",
      city: "バタンガス州 マルバール",
      days: "公式サイトで確認を",
      feature: "2013年開場。1周1,525m、スタンド3,000人。マニラ・ターフクラブが運営。",
      access: ["マニラから南ルソン高速道路で車で約1.5〜2時間（目安）"],
      admission: "公式サイトで確認を",
      nearby: ["タール湖・タール火山", "タガイタイ（高原リゾート）"],
      color: "#0038a8",
    },
    {
      name: "ホースメンズ・トラック",
      local: "The Horsemen's Track（PJC）",
      city: "バタンガス州 パドレ・ガルシア",
      days: "公式サイトで確認を",
      feature: "フィリピン・ジョッキークラブの新しい競馬場。2025年の大統領杯もここで行われた。",
      access: ["マニラから車で約2時間（目安）"],
      admission: "公式サイトで確認を",
      nearby: ["リパ市", "バタンガスの海岸"],
      color: "#ce1126",
    },
  ],
  howTo: [
    { title: "開催日を確認", body: "開催日はクラブの公式サイトやSNSで確認します。" },
    { title: "車で向かう", body: "競馬場はマニラから離れているので、車をチャーターするのが便利です。" },
    { title: "観戦する", body: "地元のファンの熱い応援も見どころ。英語が広く通じます。" },
    { title: "帰りは早めに", body: "夕方からはマニラ方面の高速道路が混むので、余裕をもって出発を。" },
  ],
  termsTitle: "現地で使える英語・タガログ語",
  terms: [
    { jp: "単勝", local: "Win", read: "ウィン" },
    { jp: "競馬", local: "Karera ng kabayo", read: "カレラ・ナン・カバヨ" },
    { jp: "ありがとう", local: "Salamat", read: "サラマット" },
    { jp: "おいしい", local: "Masarap", read: "マサラップ" },
  ],
  plans: [
    {
      id: "batangas",
      title: "マニラ＋バタンガス 競馬と高原リゾート3泊4日",
      catch: "競馬のあとは火山湖を見下ろす高原へ",
      nights: "3泊4日",
      best: "12月（大統領杯の時期）",
      days: [
        { label: "1日目", items: [{ time: "夕方", text: "マニラ着。イントラムロス（城壁都市）を散歩" }] },
        { label: "2日目", items: [
          { time: "朝", text: "車でバタンガスへ" },
          { time: "午後", text: "競馬場で観戦" },
          { time: "夜", text: "バタンガス名物の牛骨スープ「ブラロ」" },
        ] },
        { label: "3日目", items: [{ time: "昼", text: "タガイタイでタール湖を見ながらのんびり" }] },
        { label: "4日目", items: [{ time: "朝", text: "マニラへ戻って帰国" }] },
      ],
      tips: ["移動は車のチャーターが安心", "12月は乾季で過ごしやすい"],
    },
  ],
  bigRaces: [
    { name: "PCSO大統領杯（G1）", when: "12月", where: "ダート2000m", body: "1973年創設。2025年に国内G1になり賞金1,500万ペソ。2025年はドン・フリオが優勝。" },
    { name: "フィリピン三冠", when: "年の前半", where: "バタンガス", body: "国内産3歳馬の三冠シリーズ。" },
  ],
  pogCorner: [
    "フィリピンにも国内生産の馬による三冠があり、日本のPOGと同じく「世代の頂点」を追う楽しみがあります。",
  ],
  culture: [
    { title: "競馬場の移転", body: "マニラ首都圏のサン・ラザロやサンタアナの競馬場は閉場・移転し、競馬の中心はバタンガスへ移りました。" },
    { title: "場外で楽しむ文化", body: "フィリピンでは競馬場に行かず、街の場外発売所で楽しむファンも多くいます。" },
  ],
  foods: [
    { name: "レチョン", local: "Lechon", where: "どこでも（お祝いの日に）", body: "豚の丸焼き。皮がパリパリでごちそうの代表。", icon: "bbq" },
    { name: "ブラロ", local: "Bulalo", where: "バタンガス・タガイタイ", body: "牛すね肉と骨髄のスープ。高原の涼しい日にぴったり。", icon: "soup" },
    { name: "アドボ", local: "Adobo", where: "どこでも", body: "鶏や豚を酢と醤油で煮込んだ国民食。", icon: "rice" },
    { name: "ハロハロ", local: "Halo-halo", where: "どこでも", body: "かき氷に豆・フルーツ・アイスをのせた甘いデザート。", icon: "street" },
  ],
  manners: [
    "競馬場は郊外。移動手段を先に確保しておく",
    "日本のパスポートなら短期の観光はビザなしで入国できます（最新の条件は外務省で確認）",
    "開催日は変わることがあります。出発前に公式サイトで確認を",
  ],
  sources: [
    { label: "ph-racing.com フィリピン競馬の基本（競馬場・運営団体）", url: "https://ph-racing.com/en/posts/philippine-racing-basics/", date: "2026-05-24" },
    { label: "Wikipedia メトロターフ競馬場", url: "https://en.wikipedia.org/wiki/MetroTurf_Racecourse", date: "2026-11-22 確認" },
    { label: "Wikipedia PCSO大統領杯（2025年G1・賞金・勝ち馬）", url: "https://en.wikipedia.org/wiki/PCSO_Presidential_Gold_Cup", date: "2026-11-22 確認" },
  ],
};

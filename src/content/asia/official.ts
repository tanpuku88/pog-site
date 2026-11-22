import type { OfficialSite } from "./types";

// 各国の主催者・競馬場の公式サイト。2026-11-22 にブラウザで開けることを確認（URLはWikidataの公式サイト情報とも照合）。

export const OFFICIAL: Record<string, OfficialSite[]> = {
  korea: [
    { name: "韓国馬事会（KRA）", desc: "韓国競馬の主催者。開催日程・出馬表・結果", url: "https://www.kra.co.kr/" },
    { name: "KRA 英語ページ", desc: "外国人向けの案内（英語）", url: "https://www.kra.co.kr/globalEn/main.do" },
  ],
  hongkong: [
    { name: "香港ジョッキークラブ（HKJC）", desc: "香港競馬の主催者。開催日程・出馬表・結果", url: "https://www.hkjc.com/" },
    { name: "HKJC 競馬場の楽しみ方", desc: "シャティン・ハッピーバレーの入場・イベント案内（英語）", url: "https://entertainment.hkjc.com/en-us/visit-us/happy-valley-racecourse" },
  ],
  uae: [
    { name: "ドバイ・レーシングクラブ", desc: "メイダン競馬場の開催日程・チケット", url: "https://www.dubairacingclub.com/" },
    { name: "ドバイワールドカップ", desc: "ドバイワールドカップ公式サイト", url: "https://www.dubaiworldcup.com/" },
  ],
  saudi: [
    { name: "サウジアラビア・ジョッキークラブ", desc: "サウジ競馬の主催者。開催日程・結果", url: "https://www.jcsa.sa/" },
    { name: "サウジカップ", desc: "サウジカップ公式サイト（チケット・日程）", url: "https://thesaudicup.com.sa/" },
  ],
  qatar: [
    { name: "カタール・レーシング＆エクエストリアンクラブ（QREC）", desc: "アル・ラヤン競馬場の主催者。開催日程・結果", url: "https://www.qrec.gov.qa/" },
  ],
  bahrain: [
    { name: "バーレーン・ターフクラブ", desc: "バーレーン競馬の主催者。開催日程・チケット", url: "https://bahrainturfclub.com/" },
  ],
  india: [
    { name: "ロイヤル・ウェスタン・インディア・ターフクラブ", desc: "ムンバイ・プネー競馬の主催者", url: "https://rwitc.com/" },
    { name: "バンガロール・ターフクラブ", desc: "バンガロール競馬場", url: "https://www.bangaloreraces.com/" },
    { name: "ロイヤル・カルカッタ・ターフクラブ", desc: "コルカタ競馬場", url: "https://www.rctconline.com/" },
  ],
  malaysia: [
    { name: "セランゴール・ターフクラブ", desc: "クアラルンプール郊外の競馬場。レースカード・結果", url: "https://www.selangorturfclub.com/" },
    { name: "ペラ・ターフクラブ", desc: "イポーの競馬場", url: "https://www.perakturfclub.my/" },
  ],
  philippines: [
    { name: "フィリピン競馬委員会（PHILRACOM）", desc: "フィリピン競馬を管理する政府機関", url: "https://philracom.gov.ph/" },
    { name: "メトロマニラ・ターフクラブ", desc: "メトロターフ競馬場の運営会社", url: "https://www.mmtci.com/" },
  ],
  kyrgyzstan: [
    { name: "世界遊牧民競技大会（World Nomad Games）", desc: "大会の公式サイト。次回は2028年にロシア・カザンで開催予定", url: "https://worldnomadgames.org/en" },
  ],
  thailand: [
    { name: "王立バンコク・スポーツクラブ（RBSC）", desc: "バンコクの競馬の主催クラブ（2026年11月はサイトがメンテナンス中。LINE @RBSC でも問い合わせ可）", url: "https://www.rbsc.org/" },
  ],
  turkey: [
    { name: "トルコ・ジョッキークラブ（TJK）", desc: "トルコ競馬の主催者。開催日程・出馬表・結果", url: "https://www.tjk.org/" },
  ],
};

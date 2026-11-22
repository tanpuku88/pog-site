import type { Photo } from "./types";

// 写真はすべて Wikimedia Commons の自由ライセンス（CC BY / CC BY-SA / CC0 / パブリックドメイン）。
// 画像は Wikimedia のサーバーから直接表示し、撮影者とライセンスをページに表示する。
// 2026-11-22 に Commons のファイルページでライセンスを確認。

const thumb = (path: string, name: string) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${name}/960px-${name}`;
const page = (name: string) => `https://commons.wikimedia.org/wiki/File:${name}`;
const p = (path: string, name: string, alt: string, credit: string, license: string): Photo => ({ src: thumb(path, name), alt, credit, license, page: page(name) });

export const PHOTOS: Record<string, Photo[]> = {
  korea: [
    p("2/2a", "Seoul_Racecourse_race_time.jpg", "レース前のソウル競馬場。山を背にしたコース", "U2em", "CC BY-SA 3.0"),
    p("7/7b", "Seoul_Racecourse_November_Dawn.jpg", "11月の夕暮れのソウル競馬場スタンド前", "U2em", "CC BY-SA 3.0"),
    p("6/6b", "Jeju_horse_3.jpg", "済州島の草原にいる済州馬", "MOON YOUNG GUN", "CC0"),
  ],
  hongkong: [
    p("e/e4", "Happy_Valley_Racecourse_1.jpg", "高層ビルに囲まれたハッピーバレー競馬場", "Minghong", "CC BY-SA 4.0"),
    p("f/f7", "HKIR_20231206_Happy_Valley_Racecourse_IJC.jpg", "ナイター開催中のハッピーバレー競馬場（2023年国際騎手選手権）", "Will629", "CC BY 4.0"),
    p("8/84", "Sha_Tin_Racecourse_Overview_2009.jpg", "上から見たシャティン競馬場", "WiNG", "CC BY-SA 3.0"),
  ],
  uae: [
    p("7/77", "Meydan_dubai.jpg", "夜のメイダン競馬場のスタンド", "Sakena", "CC BY 2.0"),
    p("7/74", "Horse_Race_scenery.jpg", "ドバイワールドカップ開催日のメイダン競馬場（2018年）", "Imadkayyali", "CC BY-SA 4.0"),
  ],
  saudi: [
    p("1/16", "At-Turaif_District_in_ad-Dir%27iyah_(5).jpg", "リヤド近郊ディルイーヤの世界遺産アッ・トゥライフ地区", "Radosław Botev", "CC BY 3.0 PL"),
  ],
  qatar: [
    p("8/88", "Souq_Waqif%2C_Doha%2C_Catar%2C_2013-08-05%2C_DD_09.JPG", "ドーハの伝統市場スーク・ワキーフ", "Diego Delso", "CC BY-SA 3.0"),
  ],
  bahrain: [
    p("d/de", "Horse_Race_Complex_03.jpg", "サヒールの競馬場でのレース", "Gabby Canonizado", "CC BY 2.0"),
  ],
  india: [
    p("5/5f", "Bombay18.jpg", "マハラクシュミ競馬場のスタンドとムンバイの高層ビル", "Aam422", "パブリックドメイン"),
  ],
  philippines: [
    p("0/0e", "MMTCIjf8322_01.JPG", "メトロターフ競馬場のコースと山並み", "Ramon FVelasquez", "CC BY-SA 3.0"),
  ],
  turkey: [
    p("4/47", "Veliefendi_hipodromu_2024.jpg", "上から見たヴェリエフェンディ競馬場（2024年）", "Lucho3434", "CC0"),
  ],
};

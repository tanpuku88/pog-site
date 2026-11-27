import type { Photo } from "./types";

// 写真はすべて Wikimedia Commons の自由ライセンス（CC BY / CC BY-SA / CC0 / パブリックドメイン）。
// 画像は Wikimedia のサーバーから直接表示し、撮影者とライセンスをページに表示する。
// 2026-11-22 に Commons のファイルページでライセンスを確認。

const thumb = (path: string, name: string) => `https://upload.wikimedia.org/wikipedia/commons/thumb/${path}/${name}/960px-${name}`;
const page = (name: string) => `https://commons.wikimedia.org/wiki/File:${name}`;
const p = (path: string, name: string, alt: string, credit: string, license: string): Photo => ({ src: thumb(path, name), alt, credit, license, page: page(name) });

export const PHOTOS: Record<string, Photo[]> = {
  china: [
    p("f/fe", "Guangzhou_Skyline_20210522-01.jpg", "広州の街並み（従化競馬場は広州市の北部）", "中少", "CC BY-SA 4.0"),
  ],
  indonesia: [
    p("6/6b", "The_Hamengku_Buwono_X_King%27s_Cup_Horse_Race_2025_in_Bantul%2C_Special_Region_of_Yogyakarta%2C_Indonesia.jpg", "2025年ハメンクブウォノ10世カップ（バントゥル）", "Czsalmon", "CC0"),
    p("7/7e", "Pacuan_Kuda_Tradisional_Dataran_Tinggi_Gayo._Aceh.jpg", "アチェ州ガヨ高原の伝統競馬", "Laodeiqbal", "CC BY-SA 4.0"),
    { src: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Pacuan_Kuda_Pulomas.jpg", alt: "1971年のプロマス競馬場（ジャカルタ）", credit: "Indonesian Press Photo Service", license: "パブリックドメイン", page: page("Pacuan_Kuda_Pulomas.jpg") },
  ],
  iran: [
    p("d/d1", "%D9%85%D8%B3%D8%A7%D8%A8%D9%82%D8%A7%D8%AA_%D8%A7%D8%B3%D8%A8_%D8%AF%D9%88%D8%A7%D9%86%DB%8C_%DA%AF%D9%86%D8%A8%D8%AF_%DA%A9%D8%A7%D9%88%D9%88%D8%B3_Horse_racing_In_Iran-_Gonbad-e_Kavus_04.jpg", "ゴンバデ・カーヴースの競馬", "Mostafameraji", "CC BY-SA 4.0"),
    p("6/63", "%D9%85%D8%B3%D8%A7%D8%A8%D9%82%D8%A7%D8%AA_%D8%A7%D8%B3%D8%A8_%D8%AF%D9%88%D8%A7%D9%86%DB%8C_%DA%AF%D9%86%D8%A8%D8%AF_%DA%A9%D8%A7%D9%88%D9%88%D8%B3_Horse_racing_In_Iran-_Gonbad-e_Kavus_09.jpg", "ゴンバデ・カーヴースの競馬", "Mostafameraji", "CC BY-SA 4.0"),
  ],
  mongolia: [
    p("3/3b", "Horse_race_in_Mongolia_Naadam.jpg", "ナーダムの競馬で草原を走る馬と子ども騎手", "Orgio89", "CC BY 3.0"),
    p("9/96", "Young_Naadam_Horse_Racers_in_Mongolia_-_2010.jpg", "ゴールに飛びこむ若い騎手たち（2010年）", "FischerFotos", "CC BY-SA 4.0"),
    p("8/83", "Three_Naadam_riders.jpg", "ナーダムの競馬に出る3人の少年", "InvictaHOG", "パブリックドメイン"),
  ],
  kazakhstan: [
    p("0/08", "Kokpar,_Central_asian_national_game.jpg", "カザフスタンの騎馬競技コクパル", "Rustam Uzbekov", "CC BY-SA 4.0"),
    p("7/7b", "Shymbulak,_Almaty_(P1180205-Pano).jpg", "アルマトイ郊外シンブラクの山並み", "Matti Blume", "CC BY-SA 4.0"),
  ],
  kyrgyzstan: [
    p("2/2a", "Kok-boru,_Cholpon-Ata,_Kyrgyzstan.jpg", "チョルポン・アタでのコクボル", "Helen Owl", "CC BY-SA 4.0"),
    p("7/74", "Kok-boru_Cholpon-Ata,_Kyrgyzstan,_2018_World_Nomad_Games.jpg", "2018年世界遊牧民競技大会のコクボル", "Helen Owl", "CC BY-SA 4.0"),
  ],
  thailand: [
    p("5/5d", "Rbsc_race.JPG", "王立バンコク・スポーツクラブの競馬", "Nini at Thai Wikipedia", "CC BY-SA 3.0"),
    p("2/2e", "Bangkok_skyline,_Bangkok,_Thailand.jpg", "バンコク中心部の高層ビルと緑（競馬場のある一帯）", "Vyacheslav Argenberg", "CC BY 4.0"),
  ],
  oman: [
    p("9/9b", "Royal_Cavalry_of_Oman_001.JPG", "オマーン王室騎兵隊（ドイツの馬術イベントで、2011年）", "Usien", "CC BY-SA 3.0"),
    p("6/6f", "Barka_Fort_(4)_(41446311921).jpg", "競馬場のある町バルカの城", "Hans Birger Nilsen", "CC BY-SA 2.0"),
    p("a/a1", "Muttrah_Corniche_2018.jpg", "マスカットのマトラ海岸通り", "Albinfo", "CC BY 4.0"),
  ],
  pakistan: [
    p("5/59", "Alamgiri_Gate_of_Lahore_Fort_2024.jpg", "ラホール城のアラムギリ門（2024年）", "ほっきー", "CC0"),
    p("d/db", "Badshahi_Mosque_(Lahore).jpg", "ラホールのバードシャーヒー・モスク", "Muhammad Umair Mirza", "CC BY-SA 4.0"),
  ],
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
  malaysia: [
    p("8/87", "Kuala_Lumpur_Malaysia_Skyline-01.jpg", "クアラルンプールの街並み", "CEphoto, Uwe Aranas", "CC BY-SA 3.0"),
    {
      src: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/KITLV_-_80031_-_Kleingrothe%2C_C.J._-_Medan_-_Racetrack_at_Penang_Island%2C_Malaysia_-_circa_1910.tif/lossy-page1-960px-KITLV_-_80031_-_Kleingrothe%2C_C.J._-_Medan_-_Racetrack_at_Penang_Island%2C_Malaysia_-_circa_1910.tif.jpg",
      alt: "1910年ごろのペナン島の競馬場（2025年に閉場）",
      credit: "C.J. Kleingrothe",
      license: "パブリックドメイン",
      page: page("KITLV_-_80031_-_Kleingrothe%2C_C.J._-_Medan_-_Racetrack_at_Penang_Island%2C_Malaysia_-_circa_1910.tif"),
    },
    p("d/d0", "Nasi_lemak_on_banana_leaf.jpg", "バナナの葉にのせたナシレマ", "Jpatokal", "CC BY-SA 4.0"),
  ],
  philippines: [
    p("0/0e", "MMTCIjf8322_01.JPG", "メトロターフ競馬場のコースと山並み", "Ramon FVelasquez", "CC BY-SA 3.0"),
  ],
  turkey: [
    p("4/47", "Veliefendi_hipodromu_2024.jpg", "上から見たヴェリエフェンディ競馬場（2024年）", "Lucho3434", "CC0"),
  ],
};

/** 閉場した競馬場のコラム用 */
export const CLOSED_PHOTOS = {
  singapore: p("d/de", "Kranji_Racecourse_05-12-2024.jpg", "シンガポールのクランジ競馬場（2024年撮影）", "LN9267", "CC BY-SA 4.0"),
  macau: p("6/6e", "Macau_Jockey_Club_Racecourse2021.jpg", "タイパ島のマカオ競馬場（2021年）", "Charlie fong", "CC BY-SA 4.0"),
  penang: p("9/93", "Penang_Turf_Club_in_2025.jpg", "空から見たペナン競馬場（2025年、閉場の年）", "HundenvonPenang", "CC BY-SA 4.0"),
  nangloeng: p("3/31", "Nang_Loeng_horse_race.jpg", "ナーンルーン競馬場（タイ王立競馬場）のレース", "France Sire", "CC BY 3.0"),
};

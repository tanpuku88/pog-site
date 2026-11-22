import type { Photo } from "./types";

// 写真はすべて Wikimedia Commons の自由ライセンス（CC BY / CC BY-SA / CC0 / パブリックドメイン）。
// 画像は Wikimedia のサーバーから直接表示し、撮影者とライセンスをページに表示する。
// 2026-11-22 に Commons でライセンスを確認し、競馬場の写真であることを目で確かめて選んだ。
// 名古屋競馬場は2022年に弥富市へ移転しており、Commons には旧競馬場の写真しかないため載せていない。

const U = "https://upload.wikimedia.org/wikipedia/commons/";
const page = (name: string) => `https://commons.wikimedia.org/wiki/File:${encodeURIComponent(name.replace(/ /g, "_"))}`;
/** path は "4/45/<エンコード済みファイル名>"。thumb=true なら幅960pxの縮小版を使う */
const p = (path: string, name: string, alt: string, credit: string, license: string, thumb = true): Photo => {
  const file = path.split("/").pop()!;
  return { src: thumb ? `${U}thumb/${path}/960px-${file}` : `${U}${path}`, alt, credit, license, page: page(name) };
};
const enc = (s: string) => encodeURIComponent(s.replace(/ /g, "_"));

export const KEIBAJO_PHOTOS: Record<string, Photo[]> = {
  // ── 中央競馬（JRA） ──
  tokyo: [
    p(`4/45/${enc("東京競馬場スタンド20260201-P1079370.jpg")}`, "東京競馬場スタンド20260201-P1079370.jpg", "東京競馬場のスタンド（2026年2月）", "くろふね", "CC BY 4.0"),
    p(`5/5f/${enc("東京競馬場S指定席からの眺望20251130-P1076192.jpg")}`, "東京競馬場S指定席からの眺望20251130-P1076192.jpg", "スタンド上の席から見た東京競馬場のコース", "くろふね", "CC BY 4.0"),
    p(`c/c3/${enc("東京競馬場パドック20261003-IMG 6989.jpg")}`, "東京競馬場パドック20261003-IMG 6989.jpg", "東京競馬場のパドック（2026年10月）", "くろふね", "CC BY 4.0"),
  ],
  nakayama: [
    p(`8/80/${enc("中山競馬場パドック20260922-IMG 6911.jpg")}`, "中山競馬場パドック20260922-IMG 6911.jpg", "中山競馬場のパドック（2026年9月）", "くろふね", "CC BY 4.0"),
    p(`c/ce/${enc("中山競馬場コース20260124-P1079051.jpg")}`, "中山競馬場コース20260124-P1079051.jpg", "中山競馬場のコース", "くろふね", "CC BY 4.0"),
    p(`9/9a/${enc("中山競馬場20260922-IMG 6845.jpg")}`, "中山競馬場20260922-IMG 6845.jpg", "中山競馬場のスタンド前", "くろふね", "CC BY 4.0"),
  ],
  kyoto: [
    p("9/9a/Kyoto_Racecourse_2023_1.jpg", "Kyoto Racecourse 2023 1.jpg", "建て替えた京都競馬場のスタンドと芝生広場（2023年）", "Nadaraikon", "CC BY-SA 3.0"),
    p("7/72/Kyoto_Racecourse_2023_3.jpg", "Kyoto Racecourse 2023 3.jpg", "京都競馬場の新しいスタンド（2023年）", "Nadaraikon", "CC BY-SA 3.0"),
  ],
  hanshin: [
    p("2/2a/Hanshin_racecourse_%2849155930836%29.jpg", "Hanshin racecourse (49155930836).jpg", "阪神競馬場のスタンドと大型ビジョン（2019年）", "nakashi", "CC BY-SA 2.0"),
    p("3/31/Hanshin_Racecourse_Paddock1.jpg", "Hanshin Racecourse Paddock1.jpg", "阪神競馬場のパドック（2007年）", "Goki", "CC BY-SA 3.0"),
  ],
  chukyo: [
    p("b/bb/Chukyo_Racecourse_Main-Stand_PEGASUS%2C_Toyoake_2018.jpg", "Chukyo Racecourse Main-Stand PEGASUS, Toyoake 2018.jpg", "中京競馬場のメインスタンド「ペガサス」（2018年）", "Tomio344456", "CC BY-SA 4.0"),
    p("1/1f/A_soft_racetrack_in_Chukyo_Racecourse.jpg", "A soft racetrack in Chukyo Racecourse.jpg", "中京競馬場の芝コースを走る馬（2014年）", "Nadaraikon", "CC BY-SA 3.0"),
  ],
  niigata: [
    p(`2/2d/${enc("新潟競馬場コース（ゴール前）20261017-IMG 7320.jpg")}`, "新潟競馬場コース（ゴール前）20261017-IMG 7320.jpg", "新潟競馬場のゴール前（2026年10月）", "くろふね", "CC BY 4.0"),
    p(`1/1a/${enc("新潟競馬場20260523-P1083703.jpg")}`, "新潟競馬場20260523-P1083703.jpg", "新潟競馬場のスタンド（2026年5月）", "くろふね", "CC BY 4.0"),
  ],
  fukushima: [
    p(`a/a4/${enc("福島競馬場（スタンド）20250629-P1069928.jpg")}`, "福島競馬場（スタンド）20250629-P1069928.jpg", "福島競馬場のスタンド（2025年6月）", "くろふね", "CC BY 4.0"),
    p("7/7b/Shinobuyama_fukushima_race_course.jpg", "Shinobuyama fukushima race course.jpg", "信夫山の展望台から見た福島競馬場と福島市内", "OKfarm", "CC BY-SA 4.0"),
  ],
  sapporo: [
    p("b/b2/%E6%9C%AD%E5%B9%8C%E7%AB%B6%E9%A6%AC%E5%A0%B4_-_panoramio_%281%29.jpg", "札幌競馬場 - panoramio (1).jpg", "札幌競馬場のコース", "くろふね", "CC BY 3.0"),
  ],
  hakodate: [
    p(`0/04/${enc("函館競馬場（コース）20250628-P1069644.jpg")}`, "函館競馬場（コース）20250628-P1069644.jpg", "函館競馬場のコースと芝生のスタンド前（2025年6月）", "くろふね", "CC BY 4.0"),
    p(`1/1f/${enc("函館競馬場 20240629-P1043880.jpg")}`, "函館競馬場 20240629-P1043880.jpg", "函館競馬場のスタンド（2024年6月）", "くろふね", "CC BY 4.0"),
  ],
  kokura: [
    p("a/a4/Winning_posts_of_Kokura_Racecourse_260712.jpg", "Winning posts of Kokura Racecourse 260712.jpg", "小倉競馬場のゴール板と山なみ（2026年7月）", "Umako", "CC BY-SA 4.0"),
    p("e/ef/Kokura_Racecourse_Japanese_Garden_260712.jpg", "Kokura Racecourse Japanese Garden 260712.jpg", "小倉競馬場の日本庭園（2026年7月）", "Umako", "CC BY-SA 4.0"),
  ],

  // ── 地方競馬（NAR） ──
  obihiro: [
    p("f/ff/Obihiro_Racecourse.jpg", "Obihiro Racecourse.jpg", "帯広競馬場のスタンド（2009年）", "Ozizo", "パブリックドメイン"),
    p("3/3b/2010_obihiro_daijin.jpg", "2010 obihiro daijin.jpg", "重いソリを引いて坂を越えるばんえい競馬（2010年）", "Equus koku", "CC BY-SA 3.0"),
  ],
  monbetsu: [
    p("1/1d/Mombetsu_Racecourse_Stand_20090813.jpg", "Mombetsu Racecourse Stand 20090813.jpg", "門別競馬場のスタンド（2009年）", "Goki", "CC BY-SA 3.0"),
    p(`4/4c/${enc("門別競馬場のゴール板（2015年6月）.JPG")}`, "門別競馬場のゴール板（2015年6月）.JPG", "門別競馬場のゴール板（2015年）", "馬面長伊奈", "CC BY-SA 4.0"),
  ],
  morioka: [
    p("8/81/Morioka_racecourse_grandstand.JPG", "Morioka racecourse grandstand.JPG", "盛岡競馬場のスタンド", "Unmaokur", "CC BY-SA 3.0"),
    p("5/53/The_13th_Mercury_Cup_20090720.jpg", "The 13th Mercury Cup 20090720.jpg", "盛岡競馬場のレース（2009年マーキュリーカップ）", "Goki", "CC BY-SA 4.0"),
  ],
  mizusawa: [
    p("9/9e/Mizusawa_Racecourse_01.jpg", "Mizusawa Racecourse 01.jpg", "水沢競馬場のスタンド（2008年）", "Bedside Moon", "CC BY-SA 3.0", false),
    p("6/6b/Mizusawa_Racecourse_Goal_20080824.JPG", "Mizusawa Racecourse Goal 20080824.JPG", "水沢競馬場のゴール前（2008年）", "Goki", "CC BY-SA 4.0"),
  ],
  urawa: [
    p("8/86/Urawa_kinen_day_at_Urawa_racecourse_%2824722458978%29.jpg", "Urawa kinen day at Urawa racecourse (24722458978).jpg", "浦和記念の日の浦和競馬場（2017年）", "nakashi", "CC BY-SA 2.0"),
    p("c/ca/Urawa_Keiba02.jpg", "Urawa Keiba02.jpg", "浦和競馬場（2010年）", "Cake6", "CC BY-SA 3.0"),
  ],
  funabashi: [
    p(`d/d0/${enc("船橋競馬場のパドック.jpg")}`, "船橋競馬場のパドック.jpg", "船橋競馬場のパドック（2016年）", "くろふね", "CC BY-SA 4.0"),
    p("4/42/Funabashi_Racecourse_20060505_02.jpg", "Funabashi Racecourse 20060505 02.jpg", "船橋競馬場のスタンド（2006年）", "Goki", "CC BY-SA 3.0"),
  ],
  oi: [
    p(`a/ac/${enc("大井競馬場4号スタンド.jpg")}`, "大井競馬場4号スタンド.jpg", "大井競馬場の4号スタンド（2023年）", "モトテツ", "CC0"),
    p("9/9a/%22Tokyo_Mega_Illumi%22_at_Ohi_Racecourse_%2865606%29.jpg", "\"Tokyo Mega Illumi\" at Ohi Racecourse (65606).jpg", "冬の大井競馬場で開かれるイルミネーション", "Syced", "CC0"),
  ],
  kawasaki: [
    p("1/1b/Kawasaki_Racecourse_005.jpg", "Kawasaki Racecourse 005.jpg", "川崎競馬場のスタンド（2011年、改装前）", "Cake6", "CC BY-SA 3.0"),
  ],
  kanazawa: [
    p("a/aa/Kanazawa_racecourse_stand.jpg", "Kanazawa racecourse stand.jpg", "金沢競馬場のスタンド（2016年）", "Unmaokur", "CC BY-SA 4.0"),
    p("f/fd/Kanazawa_racecourse_paddock.JPG", "Kanazawa racecourse paddock.JPG", "金沢競馬場のパドック（2016年）", "Unmaokur", "CC BY-SA 4.0"),
  ],
  kasamatsu: [
    p("e/ea/Kasamatsu_racecourse.jpg", "Kasamatsu racecourse.jpg", "笠松競馬場のコース（2014年）", "Unmaokur", "CC BY-SA 3.0"),
    p("6/66/Kasamatsu_racecourse_entrance.jpg", "Kasamatsu racecourse entrance.jpg", "笠松競馬場の入口（2014年）", "Unmaokur", "CC BY-SA 3.0"),
  ],
  sonoda: [
    p("9/9e/Sonoda-Racecourse-2.jpg", "Sonoda-Racecourse-2.jpg", "園田競馬場のスタンド（2009年）", "Cake6", "CC BY-SA 3.0", false),
    p("7/73/Sonoda-Racecourse-3.jpg", "Sonoda-Racecourse-3.jpg", "園田競馬場のスタンドと大型ビジョン（2009年）", "Cake6", "CC BY-SA 3.0", false),
  ],
  himeji: [
    p("1/11/Himeji_Racecourse_Vision.jpg", "Himeji Racecourse Vision.jpg", "姫路競馬場の大型ビジョン（2021年）", "Fusianasan1350", "CC BY-SA 4.0"),
    p("e/e6/Stands_of_Himeji_park_horse_race_track.jpg", "Stands of Himeji park horse race track.jpg", "姫路競馬場のスタンド（2008年）", "Corpse Reviver", "CC BY-SA 3.0"),
  ],
  kochi: [
    p("f/fd/Kochi_Racecouse_20080720.jpg", "Kochi Racecouse 20080720.jpg", "高知競馬場のスタンド（2008年）", "Goki", "CC BY-SA 3.0"),
    p("0/09/Kochi_Racecouse_Paddock_20080720.jpg", "Kochi Racecouse Paddock 20080720.jpg", "高知競馬場のパドック（2008年）", "Goki", "CC BY-SA 3.0"),
  ],
  saga: [
    p("2/24/Saga_Racecourse._20080815.jpg", "Saga Racecourse. 20080815.jpg", "佐賀競馬場（2008年）", "Goki", "CC BY-SA 3.0"),
    p("8/89/Saga_race_cource_plate.jpg", "Saga race cource plate.jpg", "佐賀競馬場の入口（2008年）", "kanegen", "CC BY 2.0", false),
  ],
};

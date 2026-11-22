// なくなった競馬場の写真。2026-11-22 に Wikimedia Commons でライセンスと撮影者を確認。
// 古い写真はパブリックドメイン、空中写真は国土交通省（出典表示で利用可）。
import type { Photo } from "@/content/asia/types";

export const LOST_PHOTOS: Record<string, Photo[]> = {
  meguro: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f5/Tokyo_Yushun%28Japanese_Derby%2919320423.jpg/960px-Tokyo_Yushun%28Japanese_Derby%2919320423.jpg", "alt": "第1回日本ダービー（1932年4月、目黒競馬場）", "credit": "撮影者不明", "license": "パブリックドメイン", "page": "https://commons.wikimedia.org/wiki/File:Tokyo_Yushun%28Japanese_Derby%2919320423.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b2/Meguro_Racecourse%281923-1937%29.jpg/960px-Meguro_Racecourse%281923-1937%29.jpg", "alt": "東京競馬倶楽部時代の目黒競馬場", "credit": "撮影者不明（『日本競馬史』より）", "license": "パブリックドメイン", "page": "https://commons.wikimedia.org/wiki/File:Meguro_Racecourse%281923-1937%29.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/3a/Betting_Facilities_of_Meguro_Racecourse_in_1933.jpg/960px-Betting_Facilities_of_Meguro_Racecourse_in_1933.jpg", "alt": "目黒競馬場の馬券売り場（1933年）", "credit": "撮影者不明（馬の博物館所蔵）", "license": "パブリックドメイン", "page": "https://commons.wikimedia.org/wiki/File:Betting_Facilities_of_Meguro_Racecourse_in_1933.jpg"},
  ],
  negishi: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/a/a2/THE_GRAND_STAND_YOKOHAMA_RACE_CLUB_1890.jpg/960px-THE_GRAND_STAND_YOKOHAMA_RACE_CLUB_1890.jpg", "alt": "根岸競馬場のメインスタンド（1888年ごろ、英国の新聞の挿絵）", "credit": "The Illustrated Sporting and Dramatic News（1890年）", "license": "パブリックドメイン", "page": "https://commons.wikimedia.org/wiki/File:THE_GRAND_STAND_YOKOHAMA_RACE_CLUB_1890.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/cc/Yokohama_Racecourse_Mainstand_1929.jpg/960px-Yokohama_Racecourse_Mainstand_1929.jpg", "alt": "完成したばかりのメインスタンド（1929年、コースの内側から）", "credit": "撮影者不明（『日本競馬史』より）", "license": "パブリックドメイン", "page": "https://commons.wikimedia.org/wiki/File:Yokohama_Racecourse_Mainstand_1929.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/b8/Yokohama_Racecourse_20260712_01.jpg/960px-Yokohama_Racecourse_20260712_01.jpg", "alt": "いまも残る一等馬見所（2026年7月）", "credit": "Suikotei", "license": "CC BY 4.0", "page": "https://commons.wikimedia.org/wiki/File:Yokohama_Racecourse_20260712_01.jpg"},
  ],
  haruki: [
    {"src": "https://upload.wikimedia.org/wikipedia/commons/c/c2/Haruki_Racecourse.jpg", "alt": "空から見た春木競馬場（1974年）", "credit": "AXT（国土交通省の空中写真をもとに作成）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Haruki_Racecourse.jpg"},
  ],
  kimiidera: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/41/Kimiidera_Racecourse_Aerial_photograph.1985.jpg/960px-Kimiidera_Racecourse_Aerial_photograph.1985.jpg", "alt": "空から見た紀三井寺競馬場（1985年、廃止の3年前）", "credit": "国土交通省（国土情報ウェブマッピングシステム）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Kimiidera_Racecourse_Aerial_photograph.1985.jpg"},
  ],
  nakatsu: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/b/bd/Nakatsu_Racecourse_Aerial_photograph.1974.jpg/960px-Nakatsu_Racecourse_Aerial_photograph.1974.jpg", "alt": "空から見た中津競馬場（1974年）", "credit": "国土交通省（国土情報ウェブマッピングシステム）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Nakatsu_Racecourse_Aerial_photograph.1974.jpg"},
  ],
  sanjo: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/2/25/Sanjo_Racecourse_Aerial_photograph.1975.jpg/960px-Sanjo_Racecourse_Aerial_photograph.1975.jpg", "alt": "空から見た三条競馬場（1975年）", "credit": "国土交通省（国土情報ウェブマッピングシステム）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Sanjo_Racecourse_Aerial_photograph.1975.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/ca/201312sanjo.jpg/960px-201312sanjo.jpg", "alt": "三条競馬場のスタンド（2013年12月、場外発売所だったころ）", "credit": "Umatake", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:201312sanjo.jpg"},
  ],
  masuda: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/c/c4/Masuda_Racecourse_Aerial_photograph.1976.jpg/960px-Masuda_Racecourse_Aerial_photograph.1976.jpg", "alt": "空から見た益田競馬場（1976年）", "credit": "国土交通省（国土情報ウェブマッピングシステム）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Masuda_Racecourse_Aerial_photograph.1976.jpg"},
  ],
  ashikaga: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9b/%E3%83%89%E3%83%BC%E3%82%B8%E3%83%9E%E3%83%95%E3%82%A1%E3%82%A4%E3%82%BF%E3%83%BC%EF%BC%88%E8%B6%B3%E5%88%A9%E7%AB%B6%E9%A6%AC%EF%BC%8919961231-PIC00026.jpg/960px-%E3%83%89%E3%83%BC%E3%82%B8%E3%83%9E%E3%83%95%E3%82%A1%E3%82%A4%E3%82%BF%E3%83%BC%EF%BC%88%E8%B6%B3%E5%88%A9%E7%AB%B6%E9%A6%AC%EF%BC%8919961231-PIC00026.jpg", "alt": "足利競馬場を走るドージマファイター（1996年12月31日）", "credit": "くろふね", "license": "CC BY 4.0", "page": "https://commons.wikimedia.org/wiki/File:%E3%83%89%E3%83%BC%E3%82%B8%E3%83%9E%E3%83%95%E3%82%A1%E3%82%A4%E3%82%BF%E3%83%BC%EF%BC%88%E8%B6%B3%E5%88%A9%E7%AB%B6%E9%A6%AC%EF%BC%8919961231-PIC00026.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/4/4c/Ashikaga_Racecourse_Aerial_photograph.1986.jpg/960px-Ashikaga_Racecourse_Aerial_photograph.1986.jpg", "alt": "空から見た足利競馬場（1986年）", "credit": "国土交通省（国土情報ウェブマッピングシステム）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Ashikaga_Racecourse_Aerial_photograph.1986.jpg"},
  ],
  kaminoyama: [
    {"src": "https://upload.wikimedia.org/wikipedia/commons/f/f4/Kaminoyama_Race_course.jpg", "alt": "上山競馬場（2002年11月3日）", "credit": "Goki", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Kaminoyama_Race_course.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/f3/Kaminoyama_Racecourse_Aerial_photograph.1976.jpg/960px-Kaminoyama_Racecourse_Aerial_photograph.1976.jpg", "alt": "空から見た上山競馬場（1976年）", "credit": "国土交通省（国土情報ウェブマッピングシステム）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Kaminoyama_Racecourse_Aerial_photograph.1976.jpg"},
  ],
  takasaki: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/68/Takasaki_Racecourse.jpg/960px-Takasaki_Racecourse.jpg", "alt": "高崎競馬場", "credit": "PYONICHI", "license": "パブリックドメイン", "page": "https://commons.wikimedia.org/wiki/File:Takasaki_Racecourse.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/0d/Takasaki_Racecourse_Aerial_photograph.1986.jpg/960px-Takasaki_Racecourse_Aerial_photograph.1986.jpg", "alt": "空から見た高崎競馬場（1986年）", "credit": "国土交通省（国土情報ウェブマッピングシステム）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Takasaki_Racecourse_Aerial_photograph.1986.jpg"},
  ],
  utsunomiya: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/1/11/Brian%27s_Roman_20000505R1.jpg/960px-Brian%27s_Roman_20000505R1.jpg", "alt": "宇都宮の名馬ブライアンズロマン（2000年5月）", "credit": "Goki", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Brian%27s_Roman_20000505R1.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6d/Utsunomiya_Racecourse_Aerial_photograph.1974.jpg/960px-Utsunomiya_Racecourse_Aerial_photograph.1974.jpg", "alt": "空から見た宇都宮競馬場（1974年）", "credit": "国土交通省（国土情報ウェブマッピングシステム）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Utsunomiya_Racecourse_Aerial_photograph.1974.jpg"},
  ],
  iwamizawa: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/6/6a/Iwamizawa-racecourse.JPG/960px-Iwamizawa-racecourse.JPG", "alt": "岩見沢競馬場の入場門（2007年）", "credit": "Dddeco", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Iwamizawa-racecourse.JPG"},
  ],
  kitami: [
    {"src": "https://upload.wikimedia.org/wikipedia/commons/2/28/KitamikeibaH14_041.jpg", "alt": "北見競馬場の正面入口（2002年）", "credit": "dora1977", "license": "パブリックドメイン", "page": "https://commons.wikimedia.org/wiki/File:KitamikeibaH14_041.jpg"},
  ],
  asahikawa: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/7b/%E6%97%AD%E5%B7%9D%E7%AB%B6%E9%A6%AC%E5%A0%B4%E5%85%A8%E6%99%AF.jpg/960px-%E6%97%AD%E5%B7%9D%E7%AB%B6%E9%A6%AC%E5%A0%B4%E5%85%A8%E6%99%AF.jpg", "alt": "旭川競馬場の全景（2005年）", "credit": "Kazu2234567", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:%E6%97%AD%E5%B7%9D%E7%AB%B6%E9%A6%AC%E5%A0%B4%E5%85%A8%E6%99%AF.jpg"},
    {"src": "https://upload.wikimedia.org/wikipedia/commons/4/43/Asahikawakeiba.JPG", "alt": "旭川競馬場のスタンド（2008年10月16日、最後の開催日）", "credit": "dora1977", "license": "パブリックドメイン", "page": "https://commons.wikimedia.org/wiki/File:Asahikawakeiba.JPG"},
  ],
  arao: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/5/5c/Arao_Racecourse20080320B1.JPG/960px-Arao_Racecourse20080320B1.JPG", "alt": "荒尾競馬場（2008年3月）", "credit": "Goki", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Arao_Racecourse20080320B1.JPG"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/3/34/Arao_Racecourse_Aerial_photograph.1974.jpg/960px-Arao_Racecourse_Aerial_photograph.1974.jpg", "alt": "空から見た荒尾競馬場（1974年）", "credit": "国土交通省（国土情報ウェブマッピングシステム）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Arao_Racecourse_Aerial_photograph.1974.jpg"},
  ],
  fukuyama: [
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/e/ef/Fukuyama_Racecourse_1981.jpg/960px-Fukuyama_Racecourse_1981.jpg", "alt": "空から見た福山競馬場（1981年）", "credit": "国土交通省の空中写真（加工：M9106TB）", "license": "出典表示", "page": "https://commons.wikimedia.org/wiki/File:Fukuyama_Racecourse_1981.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/d/da/Fukuyama_keiba01.jpg/960px-Fukuyama_keiba01.jpg", "alt": "福山競馬場（2005年11月）", "credit": "Setouchi", "license": "CC BY-SA 3.0", "page": "https://commons.wikimedia.org/wiki/File:Fukuyama_keiba01.jpg"},
    {"src": "https://thumb.wikimedia.org/wikipedia/commons/thumb/7/74/FUKUYAMA-KEIBAJYOU2018.jpg/960px-FUKUYAMA-KEIBAJYOU2018.jpg", "alt": "更地になった跡地（2018年1月）", "credit": "melvil", "license": "CC BY-SA 4.0", "page": "https://commons.wikimedia.org/wiki/File:FUKUYAMA-KEIBAJYOU2018.jpg"},
  ],
};

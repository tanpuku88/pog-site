// 全国競馬場ガイド（中央・地方）のデータの形。
// 競馬場を増やすときは src/content/keibajo/<jra|nar>.ts に1件足すだけでページができる。
// 「行き方」「グルメ」「旅行プラン」などの形はアジア競馬ガイドと共通。

import type { BigRace, Food, JapanRoute, Photo, Plan, Source } from "@/content/asia/types";

export type { BigRace, Food, JapanRoute, Photo, Plan, Source };

/** コース1本分のデータ（公式サイトの数字） */
export type Course = {
  name: string;         // 「芝（外回り）」「ダート」など
  turn: string;         // 右回り・左回り・直線
  lap?: string;         // 1周
  straight?: string;    // 最後の直線
  drop?: string;        // 高低差
};

export type Region = "北海道" | "東北" | "関東" | "北陸・東海" | "関西" | "四国・九州";

export type RaceTrack = {
  slug: string;
  org: "JRA" | "NAR";
  orgLabel: string;           // 「中央競馬（JRA）」「南関東・特別区競馬組合」など
  name: string;               // 東京競馬場
  short: string;              // 東京
  en: string;                 // TOKYO
  region: Region;
  pref: string;               // 都道府県
  address: string;
  scene?: "mountain" | "city" | "desert";
  sky?: [string, string, string];
  tagline: string;
  intro: string[];
  updated: string;            // 内容を確認した日
  quickFacts: { k: string; v: string; s?: string }[];
  season: string;             // 開催時期の目安
  admission: string;          // 入場料
  access: string[];           // 最寄り駅・バス
  courses: Course[];
  courseNotes: string[];      // コースの特徴（このサイトの言葉でまとめたもの）
  fromJapan?: JapanRoute[];   // 東京・広島からの行き方
  bigRaces: BigRace[];
  pogCorner: string[];
  spots: { title: string; body: string }[]; // 場内・周辺の見どころ
  foods: Food[];
  plan: Plan;
  manners?: string[];         // この競馬場だけの注意点
  links?: { label: string; url: string; note?: string }[]; // 公式サイト・関連サイト
  sources: Source[];
  photos?: Photo[];
};

// アジア競馬ガイドのデータの形。国を増やすときは、このファイルの形に合わせて
// src/content/asia/<国>.ts を作り、index.ts の COUNTRIES に1行足すだけでページができる。

export type Source = { label: string; url: string; date: string };

export type Track = {
  name: string;         // 日本語名
  local: string;        // 現地語の名前
  city: string;
  days: string;         // 開催日
  feature: string;      // ひとことで
  access: string[];
  admission: string;
  nearby: string[];     // 近くの見どころ
  color: string;        // 地図・カードの色
  pos?: { x: number; y: number }; // 地図上の位置（0〜100）。地図を出す国だけ
};

export type Step = { title: string; body: string };

export type Plan = {
  id: string;
  title: string;
  catch: string;
  nights: string;
  best: string;         // おすすめの時期・曜日
  days: { label: string; items: { time: string; text: string }[] }[];
  tips: string[];
};

export type Food = { name: string; local: string; where: string; body: string; icon: "soup" | "bbq" | "noodle" | "street" | "fish" | "rice" };

export type BigRace = { name: string; when: string; where: string; body: string };

export type Term = { jp: string; local: string; read: string; note?: string };

/** 日本からの行き方（時刻は例） */
export type RouteStep = { time?: string; mode: "train" | "bus" | "plane" | "subway" | "taxi" | "walk" | "ship"; text: string };
export type JapanRoute = {
  from: "東京" | "広島";
  title: string;
  summary: string;          // 所要時間・費用の目安など
  steps: RouteStep[];
  links?: { label: string; url: string }[]; // 公式の時刻表など
};

export type Photo = { src: string; alt: string; credit: string; license: string; page: string };

export type CountryGuide = {
  slug: string;
  name: string;
  nameEn: string;
  flag: string;               // 国旗のファイル名（public/flags/<flag>.svg、ISOの2文字）
  scene?: "mountain" | "city" | "desert"; // 上部イラストの背景
  sky?: [string, string, string];          // 上部イラストの空の色（上→下）
  showMap?: boolean;          // 地図を出すか（今は韓国だけ）
  tagline: string;
  intro: string[];
  updated: string;            // 内容を確認した日
  quickFacts: { k: string; v: string; s?: string }[];
  tracks: Track[];
  howTo: Step[];
  terms: Term[];
  termsTitle?: string;        // 言葉の表の見出し（なければ「馬券の言葉」）
  plans: Plan[];
  bigRaces: BigRace[];
  pogCorner: string[];        // POG好き向けの見どころ
  culture: { title: string; body: string }[];
  foods: Food[];
  manners: string[];
  sources: Source[];
  fromJapan?: JapanRoute[];
  fromJapanNote?: string;
  photos?: Photo[];
};

export type CountryStub = { slug: string; name: string; flag: string; note: string };

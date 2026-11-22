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
  pos: { x: number; y: number }; // 地図上の位置（0〜100）
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

export type CountryGuide = {
  slug: string;
  name: string;
  nameEn: string;
  flag: string;               // 絵文字の旗
  tagline: string;
  intro: string[];
  updated: string;            // 内容を確認した日
  quickFacts: { k: string; v: string; s?: string }[];
  tracks: Track[];
  howTo: Step[];
  terms: Term[];
  plans: Plan[];
  bigRaces: BigRace[];
  pogCorner: string[];        // POG好き向けの見どころ
  culture: { title: string; body: string }[];
  foods: Food[];
  manners: string[];
  sources: Source[];
};

export type CountryStub = { slug: string; name: string; flag: string; note: string };

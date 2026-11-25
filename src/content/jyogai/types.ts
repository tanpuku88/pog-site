// 全国の場外馬券売り場ガイドのデータの形。
// 施設を増やすときは src/content/jyogai/<nar|jra>.ts に1件足すだけでページができる。
// 周辺グルメ・見どころ・写真の形はアジア競馬ガイドと共通。

import type { Photo } from "@/content/asia/types";

export type { Photo };

/** 周辺のおいしいお店（場外ガイド用） */
export type Food = { name: string; body: string; must?: string };

/** 出典（場外ガイド用） */
export type Source = { label: string; url: string };

export type JyogaiRegion = "北海道" | "東北" | "関東" | "北陸・東海" | "関西" | "中国" | "四国・九州";

export type Facility = {
  slug: string;
  name: string;
  org: "JRA" | "NAR";
  /** ウインズ／エクセル／Aiba／BAOO などの種別・ブランド名 */
  kind: string;
  pref: string;
  region: JyogaiRegion;
  address: string;
  /** 管理主催者（地方）・運営（中央） */
  operator: string;
  /** 最寄り駅・アクセス（確認できたものだけ） */
  access?: string;
  /** 有料席の有無（地方公式一覧の記載。中央は null） */
  paidSeat?: boolean | null;
  /** 施設の公式サイト */
  url?: string;
  note?: string;
  /** 周辺のおいしいお店（第2弾で順次追加） */
  foods?: Food[];
  /** 周辺の文化・見どころ（第2弾で順次追加） */
  spots?: { title: string; body: string }[];
  photos?: Photo[];
};

/** 閉鎖した場外発売所の記録 */
export type ClosedFacility = {
  name: string;
  pref: string;
  city: string;
  org: "JRA" | "NAR";
  brand: string;
  /** 営業期間・閉鎖時期 */
  years: string;
  body: string[];
  source: Source;
};

/** 系列（ブランド）の解説 */
export type Brand = {
  name: string;
  org: "JRA" | "NAR" | "共同";
  body: string;
};

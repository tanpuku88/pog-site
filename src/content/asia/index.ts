import type { CountryGuide, CountryStub } from "./types";
import { korea } from "./korea";
import { hongkong } from "./hongkong";
import { uae } from "./uae";
import { saudi } from "./saudi";

/** 公開中の国。新しい国はここに足す */
export const COUNTRIES: CountryGuide[] = [korea, hongkong, uae, saudi];

/** 準備中の国（一覧に「準備中」として出す） */
export const COMING_SOON: CountryStub[] = [
  { slug: "qatar", name: "カタール", flag: "qa", note: "アルライヤン競馬場。アミール杯" },
  { slug: "bahrain", name: "バーレーン", flag: "bh", note: "サヒール競馬場。バーレーン国際トロフィー" },
  { slug: "india", name: "インド", flag: "in", note: "ムンバイ・バンガロールの歴史ある競馬場" },
  { slug: "malaysia", name: "マレーシア", flag: "my", note: "ペナン・イポーなど" },
  { slug: "philippines", name: "フィリピン", flag: "ph", note: "マニラ近郊の競馬場" },
  { slug: "turkey", name: "トルコ", flag: "tr", note: "イスタンブールのヴェリエフェンディ競馬場" },
];

export function findCountry(slug: string) {
  return COUNTRIES.find((c) => c.slug === slug);
}

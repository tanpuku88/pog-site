import type { CountryGuide, CountryStub } from "./types";
import { korea } from "./korea";

/** 公開中の国。新しい国はここに足す */
export const COUNTRIES: CountryGuide[] = [korea];

/** 準備中の国（一覧に「準備中」として出す） */
export const COMING_SOON: CountryStub[] = [
  { slug: "hongkong", name: "香港", flag: "🇭🇰", note: "シャティン・ハッピーバレー。12月の香港国際競走" },
  { slug: "middle-east", name: "中東（ドバイ・サウジ）", flag: "🇦🇪", note: "ドバイワールドカップ、サウジカップ" },
  { slug: "india", name: "インド", flag: "🇮🇳", note: "ムンバイ・バンガロールの歴史ある競馬場" },
];

export function findCountry(slug: string) {
  return COUNTRIES.find((c) => c.slug === slug);
}

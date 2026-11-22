// 種牡馬の名鑑データ（netkeiba の産駒成績・現役成績を scripts/build-sire-profiles.ts で集めたもの）
import data from "@/data/sire-profiles.json";
import type { SireOffspring } from "./netkeiba/parse";

export type BigWin = { year: number; race: string; grade: number | null; surface: string | null; distance: number | null };
export type SireCareer = {
  runs: number; wins: number; places: number; turfRuns: number; dirtRuns: number;
  avgWinDist: number | null; firstYear: number | null; lastYear: number | null; bigWins: BigWin[];
};
export type SireData = { id: string; offspring: SireOffspring | null; career: SireCareer | null; fetchedAt: string };

const ALL = data as unknown as Record<string, SireData>;
export const sireData = (name: string): SireData | null => ALL[name] ?? null;
export const allSireData = () => ALL;

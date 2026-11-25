// 騎手の「デビュー戦（新馬戦）での成績」データ。
// scripts/build-jockey-profiles.ts が今の世代のデビュー馬を集計して
// src/data/jockey-profiles.json に保存したもの。集計前は空で、その間はスコアに入らない。
import data from "@/data/jockey-profiles.json";

export type JockeyData = {
  /** デビュー戦で騎乗した頭数 */
  debutRides: number;
  debutWins: number;
  /** 3着以内の回数 */
  debutPlaces: number;
};

type File = { generated_at: string | null; season_crop: number | null; jockeys: Record<string, JockeyData> };

const FILE = data as unknown as File;

export const jockeyData = (name: string | null | undefined): JockeyData | null =>
  name ? FILE.jockeys[name] ?? null : null;

export const jockeyProfilesGeneratedAt = () => FILE.generated_at;

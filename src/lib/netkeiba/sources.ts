// 出馬表を読む先（中央＝race.netkeiba.com、地方＝nar.netkeiba.com）。
// RACE_SOURCES=jra,nar のように環境変数で絞れる（既定は両方）。
import { raceListUrl, shutubaUrl, narRaceListUrl, narShutubaUrl } from "./fetch";
import { parseRaceList, parseNarRaceList } from "./parse";

export type RaceSource = {
  key: "jra" | "nar";
  label: string;
  listUrl: (yyyymmdd: string) => string;
  parseList: (html: string) => string[];
  shutubaUrl: (raceId: string) => string;
};

export const RACE_SOURCES: RaceSource[] = [
  { key: "jra", label: "中央", listUrl: raceListUrl, parseList: parseRaceList, shutubaUrl },
  { key: "nar", label: "地方", listUrl: narRaceListUrl, parseList: parseNarRaceList, shutubaUrl: narShutubaUrl },
];

export function enabledSources(env = process.env.RACE_SOURCES): RaceSource[] {
  const want = (env || "jra,nar").split(",").map((s) => s.trim());
  return RACE_SOURCES.filter((s) => want.includes(s.key));
}

/** 新馬戦か（地方の門別は「フレッシュチャレンジ」が新馬戦にあたる） */
export const isShinba = (name: string | null) => !!name && /新馬|フレッシュチャレンジ/.test(name);

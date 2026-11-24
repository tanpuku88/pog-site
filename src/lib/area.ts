// 中央（JRA）所属の馬と、地方所属の馬を分ける。賞金の規模も走るレースも違うので、同じ物差しで比べない。
import { splitTrainer } from "./horse-summary";

export type Area = "jra" | "nar";
export const AREA_LABEL: Record<Area, string> = { jra: "中央", nar: "地方" };
export const AREAS: Area[] = ["jra", "nar"];

export const parseArea = (s?: string | null): Area => (s === "nar" ? "nar" : "jra");

/** 調教師の所属から中央・地方を決める。「(美浦)」「(栗東)」なら中央、それ以外の所属が付いていれば地方 */
export function trainerArea(trainer: string | null | undefined): Area {
  if (!trainer) return "jra";
  const { area } = splitTrainer(trainer);
  if (area === "美浦" || area === "栗東") return "jra";
  return /[(（][^)）]+[)）]|[[［【]/.test(trainer) || area ? "nar" : "jra";
}

/** 馬の一覧を中央・地方の片方だけに絞る */
export function filterArea<T extends { trainer: string | null }>(horses: T[], area: Area): T[] {
  return horses.filter((h) => trainerArea(h.trainer) === area);
}

/** 中央・地方の切り替えリンク用の URL */
export function areaHref(path: string, area: Area, extra: Record<string, string | undefined> = {}) {
  const q = new URLSearchParams();
  if (area === "nar") q.set("area", "nar");
  for (const [k, v] of Object.entries(extra)) if (v) q.set(k, v);
  const s = q.toString();
  return s ? `${path}?${s}` : path;
}

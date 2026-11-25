import type { Facility, JyogaiRegion } from "./types";
import { NAR_FACILITIES } from "./nar";
import { JRA_FACILITIES } from "./jra";

export * from "./types";
export { NAR_FACILITIES } from "./nar";
export { JRA_FACILITIES } from "./jra";
export { BRANDS } from "./brands";
export { CLOSED_FACILITIES } from "./closed";

export const FACILITIES: Facility[] = [...NAR_FACILITIES, ...JRA_FACILITIES];

export const REGIONS: JyogaiRegion[] = ["北海道", "東北", "関東", "北陸・東海", "関西", "中国", "四国・九州"];

export const facilityBySlug = (slug: string) => FACILITIES.find((f) => f.slug === slug);

/** 同じ都道府県の場外（詳細ページの関連リンク用） */
export const samePrefFacilities = (f: Facility, limit = 6) =>
  FACILITIES.filter((x) => x.pref === f.pref && x.slug !== f.slug).slice(0, limit);

// 世代全体の勝ち上がり率（「ひとこと」で平均と比べるため）。全馬を読むので1時間キャッシュする。
import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";
import { loadCropData, type GroupField } from "./sires";
import { computeMetrics, scoreProfiles, type Profile } from "./profile";
import { defaultSeason } from "./standings";

export const loadOverallRate = unstable_cache(
  async (cropYear: number): Promise<number | null> => {
    const season = defaultSeason();
    if (season.crop_year !== cropYear) return null;
    const { tally } = await loadCropData(createAdminClient(), cropYear, { ...season, include_non_jra: true });
    let starters = 0, winners = 0;
    for (const t of tally.values()) {
      if (t.starts > 0) starters++;
      if (t.wins > 0) winners++;
    }
    return starters > 0 ? (winners / starters) * 100 : null;
  },
  ["overall-winner-rate"],
  { revalidate: 3600 },
);

export type ProfileSet = { profiles: Record<string, Profile>; avgWinRate: number | null; count: number };

/** 種類ごと（種牡馬・厩舎…）の名鑑の能力値。順位を付けるため全馬を読むので1時間キャッシュする */
export const loadProfiles = unstable_cache(
  async (cropYear: number, field: GroupField): Promise<ProfileSet> => {
    const season = defaultSeason();
    if (season.crop_year !== cropYear) return { profiles: {}, avgWinRate: null, count: 0 };
    const { horses, tally, races } = await loadCropData(createAdminClient(), cropYear, { ...season, include_non_jra: true });
    const scored = scoreProfiles(computeMetrics(horses, tally, races, field));
    const wins = races.filter((r) => r.finish === "1").length;
    return {
      profiles: Object.fromEntries(scored),
      avgWinRate: races.length > 0 ? (wins / races.length) * 100 : null,
      count: scored.size,
    };
  },
  ["group-profiles-v1"],
  { revalidate: 3600 },
);

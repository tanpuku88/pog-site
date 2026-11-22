// 世代全体の勝ち上がり率（「ひとこと」で平均と比べるため）。全馬を読むので1時間キャッシュする。
import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";
import { loadCropData } from "./sires";
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

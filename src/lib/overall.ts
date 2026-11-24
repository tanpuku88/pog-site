// 世代全体の勝ち上がり率（「ひとこと」で平均と比べるため）。全馬を読むので1時間キャッシュする。
import { unstable_cache } from "next/cache";
import { createAdminClient } from "./supabase/admin";
import { loadCropData, type GroupField } from "./sires";
import { addSurfaceHistory, computeMetrics, scoreProfiles, type Profile } from "./profile";
import { cropOfArea, previousSeason } from "./connections";
import { sireAptitudes, uniqueNicknames } from "./meikan";
import { allSireData } from "./sire-data";
import { defaultSeason } from "./standings";
import type { Area } from "./area";


export const loadOverallRate = unstable_cache(
  async (cropYear: number, area: Area = "jra"): Promise<number | null> => {
    const season = defaultSeason();
    if (season.crop_year !== cropYear) return null;
    const { tally, horses } = cropOfArea(await loadCropData(createAdminClient(), cropYear, { ...season, include_non_jra: true }), area);
    let starters = 0, winners = 0;
    for (const h of horses) {
      const t = tally.get(h.id);
      if (!t) continue;
      if (t.starts > 0) starters++;
      if (t.wins > 0) winners++;
    }
    return starters > 0 ? (winners / starters) * 100 : null;
  },
  ["overall-winner-rate-v2"],
  { revalidate: 3600 },
);

export type ProfileSet = { profiles: Record<string, Profile>; avgWinRate: number | null; count: number };

/** 種類ごと（種牡馬・厩舎…）の名鑑の能力値。順位を付けるため全馬を読むので1時間キャッシュする */
export const loadProfiles = unstable_cache(
  async (cropYear: number, field: GroupField, area: Area = "jra"): Promise<ProfileSet> => {
    const season = defaultSeason();
    if (season.crop_year !== cropYear) return { profiles: {}, avgWinRate: null, count: 0 };
    // 能力値は、中央なら中央所属の馬どうし、地方なら地方所属の馬どうしで順位を付ける
    const { horses, tally, races } = cropOfArea(await loadCropData(createAdminClient(), cropYear, { ...season, include_non_jra: true }), area);
    const metrics = computeMetrics(horses, tally, races, field);
    if (field !== "sire") {
      // 厩舎・馬主・牧場の芝・ダート・距離は、前の世代の成績も合わせて見る
      const prev = previousSeason();
      const old = cropOfArea(await loadCropData(createAdminClient(), prev.crop_year, { ...prev, include_non_jra: true }), area);
      addSurfaceHistory(metrics, computeMetrics(old.horses, old.tally, old.races, field));
    }
    const scored = scoreProfiles(metrics);
    // 地方はほとんどがダートなので、芝・ダートの順位は付けない（二つ名にも使わない）
    if (area === "nar") for (const p of scored.values()) { p.scores.turf = null; p.scores.dirt = null; }
    const sires = field === "sire" ? allSireData() : undefined;
    // 過去の全産駒の芝・ダートは中央の成績なので、中央のときだけ使う
    const apts = sires && area === "jra" ? sireAptitudes(sires) : undefined;
    if (apts) {
      // 種牡馬の芝・ダート・距離は、過去の全産駒（いなければ現役時代）の成績で出す
      for (const [name, p] of scored) {
        const a = apts.get(name);
        if (!a) continue;
        p.scores.turf = a.turf ?? p.scores.turf;
        p.scores.dirt = a.dirt ?? p.scores.dirt;
        p.distance = a.distance ?? p.distance;
        p.aptSource = a.source;
      }
    }
    for (const [name, nick] of uniqueNicknames(field, scored, sires, apts)) scored.get(name)!.nick = nick;
    const wins = races.filter((r) => r.finish === "1").length;
    return {
      profiles: Object.fromEntries(scored),
      avgWinRate: races.length > 0 ? (wins / races.length) * 100 : null,
      count: scored.size,
    };
  },
  ["group-profiles-v3"],
  { revalidate: 3600 },
);

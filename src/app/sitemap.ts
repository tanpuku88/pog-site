import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { SITE_URL } from "@/config/site";
import { defaultSeason } from "@/lib/standings";

// 1日1回作り直す（馬は毎週増えるので十分）
export const revalidate = 86400;

const PAGE = 1000;

/** 馬ページ（約1万頭）・種牡馬ページ・主なページを検索エンジンに知らせる */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const out: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/popular`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/shinba`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/data`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/sires`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/trainers`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/owners`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/breeders`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/horses`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/guide`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/supervisor`, changeFrequency: "monthly", priority: 0.4 },
  ];
  let db;
  try {
    db = createAdminClient();
  } catch {
    return out; // 鍵がない環境（ビルド時など）では主なページだけ
  }
  const crop = defaultSeason().crop_year;
  // 今の2歳世代の種牡馬・厩舎・馬主・生産牧場のページ
  const groups = { sires: new Set<string>(), trainers: new Set<string>(), owners: new Set<string>(), breeders: new Set<string>() };
  for (let from = 0; from < 100000; from += PAGE) {
    const { data, error } = await db
      .from("horses")
      .select("id, sire, trainer, owner, breeder, birth_year, updated_at")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error || !data) break;
    for (const h of data) {
      out.push({ url: `${SITE_URL}/horse/${h.id}`, lastModified: h.updated_at ? new Date(h.updated_at) : undefined, changeFrequency: "weekly", priority: 0.6 });
      if (h.birth_year === crop) {
        if (h.sire) groups.sires.add(h.sire);
        if (h.trainer) groups.trainers.add(h.trainer);
        if (h.owner) groups.owners.add(h.owner);
        if (h.breeder) groups.breeders.add(h.breeder);
      }
    }
    if (data.length < PAGE) break;
  }
  for (const [path, names] of Object.entries(groups)) {
    for (const s of names) out.push({ url: `${SITE_URL}/${path}/${encodeURIComponent(s)}`, changeFrequency: "weekly", priority: path === "sires" ? 0.7 : 0.6 });
  }
  return out;
}

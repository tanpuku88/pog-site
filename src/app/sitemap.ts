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
    { url: `${SITE_URL}/shinba`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/sires`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/horses`, changeFrequency: "weekly", priority: 0.5 },
    { url: `${SITE_URL}/guide`, changeFrequency: "monthly", priority: 0.5 },
  ];
  let db;
  try {
    db = createAdminClient();
  } catch {
    return out; // 鍵がない環境（ビルド時など）では主なページだけ
  }
  const crop = defaultSeason().crop_year;
  const sires = new Set<string>();
  for (let from = 0; from < 100000; from += PAGE) {
    const { data, error } = await db
      .from("horses")
      .select("id, sire, birth_year, updated_at")
      .order("id")
      .range(from, from + PAGE - 1);
    if (error || !data) break;
    for (const h of data) {
      out.push({ url: `${SITE_URL}/horse/${h.id}`, lastModified: h.updated_at ? new Date(h.updated_at) : undefined, changeFrequency: "weekly", priority: 0.6 });
      if (h.sire && h.birth_year === crop) sires.add(h.sire);
    }
    if (data.length < PAGE) break;
  }
  for (const s of sires) {
    out.push({ url: `${SITE_URL}/sires/${encodeURIComponent(s)}`, changeFrequency: "weekly", priority: 0.7 });
  }
  return out;
}

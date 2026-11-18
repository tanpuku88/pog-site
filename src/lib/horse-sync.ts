// netkeiba から取った馬・成績をデータベースに保存する処理。
// Webアプリ（馬の登録時）と定期実行スクリプトの両方から使う。
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  politeFetch, horsePageUrl, horseResultUrl, horseSearchUrl, extractHorseId,
} from "./netkeiba/fetch";
import { parseHorseProfile, parseRaceResults, parseHorseSearch, type SearchHit } from "./netkeiba/parse";

/** 馬ページを取得して、プロフィールと成績を保存する */
export async function syncHorse(db: SupabaseClient, id: string) {
  const page = await politeFetch(horsePageUrl(id));
  const profile = parseHorseProfile(id, page.html);
  if (!profile) throw new Error(`馬ページを読めませんでした: ${id}`);

  let results = parseRaceResults(page.html);
  if (results === null) {
    // 成績が別ページに分かれている場合
    const r = await politeFetch(horseResultUrl(id));
    results = parseRaceResults(r.html) ?? [];
  }

  const { error: e1 } = await db.from("horses").upsert({
    ...profile,
    results_fetched_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  if (e1) throw e1;

  if (results.length > 0) {
    // 同じ日・同じレース名の重複を除く
    const uniq = new Map(results.map((r) => [`${r.race_date}|${r.race_name}`, r]));
    const { error: e2 } = await db
      .from("race_results")
      .upsert([...uniq.values()].map((r) => ({ ...r, horse_id: id })));
    if (e2) throw e2;
  }
  return { profile, results };
}

/** netkeiba で馬名検索し、見つかった馬を保存して返す */
export async function searchNetkeiba(db: SupabaseClient, word: string): Promise<SearchHit[]> {
  const page = await politeFetch(horseSearchUrl(word));
  // 1頭だけヒットすると馬ページに直接飛ぶ
  const directId = extractHorseId(page.url);
  let hits: SearchHit[];
  if (directId) {
    const p = parseHorseProfile(directId, page.html);
    hits = p ? [{ ...p }] : [];
  } else {
    hits = parseHorseSearch(page.html);
  }
  if (hits.length > 0) {
    const now = new Date().toISOString();
    const { error } = await db.from("horses").upsert(
      hits.map((h) => ({ ...h, updated_at: now })),
      { onConflict: "id", ignoreDuplicates: false },
    );
    if (error) throw error;
  }
  return hits;
}

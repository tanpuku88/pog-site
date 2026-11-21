// 世代（生まれ年）の馬を netkeiba の馬一覧からまとめて取り込む。中央・地方の両方が対象。
// GitHub Actions から手動で実行する（1ページ100頭、3秒以上の間隔をあけて読む）。
//   CROP_YEAR=2024 npm run import:crop
import { adminDb } from "./db";
import { politeFetch, horseListByAgeUrl } from "../src/lib/netkeiba/fetch";
import { parseHorseSearch } from "../src/lib/netkeiba/parse";
import { defaultSeason } from "../src/lib/standings";

const MAX_PAGES = Number(process.env.MAX_PAGES ?? 300);

async function main() {
  const db = adminDb();
  const cropYear = Number(process.env.CROP_YEAR || defaultSeason().crop_year);
  const age = new Date().getFullYear() - cropYear; // 競走馬の年齢は1月1日に1つ上がる
  console.log(`${cropYear}年生まれ（${age}歳）の馬を取り込みます`);

  const seen = new Set<string>();
  let saved = 0;
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await politeFetch(horseListByAgeUrl(age, page));
    const hits = parseHorseSearch(res.html);
    const fresh = hits.filter((h) => !seen.has(h.id));
    fresh.forEach((h) => seen.add(h.id));
    const target = fresh.filter((h) => h.birth_year === null || h.birth_year === cropYear);
    console.log(`  ${page}ページ目: ${hits.length}頭（新しく${fresh.length}頭、対象${target.length}頭）`);
    if (fresh.length === 0) break; // 最後のページを過ぎた
    // 最初の5ページで対象が1頭もいなければ、絞り込みが効いていないので止める
    if (page >= 5 && saved === 0 && target.length === 0) {
      console.error("最初の5ページに対象の世代の馬がいません。netkeibaの一覧の絞り込みが効いていない可能性があります。");
      process.exit(1);
    }

    if (target.length > 0) {
      const now = new Date().toISOString();
      // すでに保存済みの馬（成績取得済みなど）は上書きしない
      const { error } = await db.from("horses").upsert(
        target.map((h) => ({ ...h, birth_year: h.birth_year ?? cropYear, updated_at: now })),
        { onConflict: "id", ignoreDuplicates: true },
      );
      if (error) throw error;
      saved += target.length;
    }
  }
  console.log(`完了: ${seen.size}頭を確認し、${saved}頭を保存（既存の馬はそのまま）`);
  if (seen.size === 0) {
    console.error("馬一覧を1頭も読めませんでした。netkeibaのページの形が変わった可能性があります。");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

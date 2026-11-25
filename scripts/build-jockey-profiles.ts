// 騎手の「デビュー戦での成績」を netkeiba から集めて src/data/jockey-profiles.json に保存する。
// 今の世代（2歳）の全頭について成績表を読み、いちばん古いレース＝デビュー戦の騎手を集計する。
// 新馬戦の狙い目スコア（第2段階）で「新馬戦に強い騎手」を見るための材料。
// 頭数が多いので時間予算の範囲で処理し、終わらなければ途中までの集計を保存する。
//   npm run build:jockeys
import { writeFileSync } from "node:fs";
import { adminDb } from "./db";
import { politeFetch, horseResultUrl } from "../src/lib/netkeiba/fetch";
import { parseRaceResults } from "../src/lib/netkeiba/parse";
import { defaultSeason } from "../src/lib/standings";
import type { JockeyData } from "../src/lib/jockey-data";

const OUT = "src/data/jockey-profiles.json";
const TIME_BUDGET_MIN = Number(process.env.TIME_BUDGET_MIN ?? 240);

async function main() {
  const db = adminDb();
  const crop = defaultSeason().crop_year;

  const ids: string[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("horses").select("id").eq("birth_year", crop).order("id").range(from, from + 999);
    if (error) throw error;
    (data ?? []).forEach((h) => ids.push(h.id as string));
    if (!data || data.length < 1000) break;
  }
  console.log(`${crop}年生まれ ${ids.length}頭のデビュー戦を集計します`);

  const agg = new Map<string, JockeyData>();
  const deadline = Date.now() + TIME_BUDGET_MIN * 60_000;
  let done = 0;
  let debuted = 0;
  for (const id of ids) {
    if (Date.now() > deadline) {
      console.warn(`時間予算に達したため ${done}/${ids.length}頭で打ち切ります`);
      break;
    }
    done += 1;
    if (done % 200 === 0) console.log(`  ${done}/${ids.length}頭…`);
    let results;
    try {
      results = parseRaceResults((await politeFetch(horseResultUrl(id))).html) ?? [];
    } catch {
      continue;
    }
    if (results.length === 0) continue;
    // 成績表は新しい順。いちばん古い日付のレースがデビュー戦
    const debut = [...results].sort((a, b) => a.race_date.localeCompare(b.race_date))[0];
    if (!debut.jockey) continue;
    debuted += 1;
    const cur = agg.get(debut.jockey) ?? { debutRides: 0, debutWins: 0, debutPlaces: 0 };
    cur.debutRides += 1;
    if (debut.finish === "1") cur.debutWins += 1;
    if (debut.finish && ["1", "2", "3"].includes(debut.finish)) cur.debutPlaces += 1;
    agg.set(debut.jockey, cur);
  }

  const jockeys = Object.fromEntries([...agg.entries()].sort((a, b) => b[1].debutRides - a[1].debutRides));
  writeFileSync(OUT, JSON.stringify({ generated_at: new Date().toISOString(), season_crop: crop, jockeys }, null, 1));
  console.log(`デビュー済み${debuted}頭・騎手${agg.size}人を ${OUT} に保存しました`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

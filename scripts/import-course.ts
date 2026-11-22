// 成績に「芝・ダート・距離」が入っていない馬だけ、成績を読み直す（名鑑の芝・ダート適性用）。
// 新しく取り込む成績には最初から入るので、これは最初の1回用。
//   CROP_YEAR=2024 npm run import:course
import { appendFileSync } from "node:fs";
import { adminDb } from "./db";
import { syncHorse } from "../src/lib/horse-sync";
import { defaultSeason } from "../src/lib/standings";

const TIME_BUDGET_MIN = Number(process.env.TIME_BUDGET_MIN ?? 320);

function setOutput(key: string, value: string) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

async function main() {
  const db = adminDb();
  const cropYear = Number(process.env.CROP_YEAR || defaultSeason().crop_year);
  const deadline = Date.now() + TIME_BUDGET_MIN * 60_000;
  const crop = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("horses").select("id").eq("birth_year", cropYear).order("id").range(from, from + 999);
    if (error) throw error;
    data.forEach((r) => crop.add(r.id as string));
    if (data.length < 1000) break;
  }
  const todo = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("race_results").select("horse_id, race_date").is("surface", null)
      .order("horse_id").order("race_date").range(from, from + 999);
    if (error) throw error;
    data.forEach((r) => { if (crop.has(r.horse_id as string)) todo.add(r.horse_id as string); });
    if (data.length < 1000) break;
  }
  console.log(`${cropYear}年生まれで距離が入っていない成績のある馬: ${todo.size}頭`);

  let done = 0, failed = 0, noCourse = 0;
  for (const id of todo) {
    if (Date.now() > deadline) break;
    try {
      const { results } = await syncHorse(db, id);
      done++;
      if (results.length > 0 && results.every((r) => r.surface === null)) noCourse++;
      if (done % 200 === 0) console.log(`  ${done}頭`);
    } catch (e) {
      failed++;
      console.warn(`  ${id}: ${(e as Error).message}`);
    }
    if (done >= 30 && noCourse > done * 0.8) {
      console.error("ほとんどの成績で距離が読めません。netkeibaのページの形を確かめてください。");
      process.exit(1);
    }
  }
  const more = done + failed < todo.size;
  console.log(`${more ? "時間切れで中断" : "完了"}: ${done}頭を読み直し、失敗${failed}頭`);
  setOutput("more", more ? "true" : "false");
  if (done + failed > 20 && failed > (done + failed) / 2) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

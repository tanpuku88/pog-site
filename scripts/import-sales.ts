// セリの落札価格・一口クラブの募集総額を、まだ確かめていない馬だけ馬ページから読み直す。
// 新しく取り込む馬は取り込みのときに一緒に読むので、これは最初の1回（と取りこぼし）用。
//   CROP_YEAR=2024 npm run import:sales
import { appendFileSync } from "node:fs";
import { adminDb } from "./db";
import { politeFetch, horsePageUrl } from "../src/lib/netkeiba/fetch";
import { parseHorseProfile } from "../src/lib/netkeiba/parse";
import { defaultSeason } from "../src/lib/standings";

const TIME_BUDGET_MIN = Number(process.env.TIME_BUDGET_MIN ?? 320);

function setOutput(key: string, value: string) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

async function main() {
  const db = adminDb();
  const cropYear = Number(process.env.CROP_YEAR || defaultSeason().crop_year);
  const deadline = Date.now() + TIME_BUDGET_MIN * 60_000;
  // 出走した馬（成績を読んだ馬）から先に。POGで気になるのはまず走った馬なので
  const todo: string[] = [];
  for (const ran of [true, false]) {
    for (let from = 0; ; from += 1000) {
      let q = db.from("horses").select("id").eq("birth_year", cropYear).is("sale_checked_at", null);
      q = ran ? q.not("results_fetched_at", "is", null) : q.is("results_fetched_at", null);
      const { data, error } = await q.order("id").range(from, from + 999);
      if (error) throw error;
      data.forEach((r) => todo.push(r.id as string));
      if (data.length < 1000) break;
    }
  }
  console.log(`${cropYear}年生まれで価格を確かめていない馬: ${todo.length}頭`);

  let done = 0, sold = 0, club = 0, failed = 0;
  for (const id of todo) {
    if (Date.now() > deadline) break;
    try {
      const p = parseHorseProfile(id, (await politeFetch(horsePageUrl(id))).html);
      if (!p) { failed++; continue; }
      const { error } = await db.from("horses").update({
        sale_price_man: p.sale_price_man, sale_name: p.sale_name, sale_year: p.sale_year, club_price_man: p.club_price_man,
        trainer: p.trainer, owner: p.owner, breeder: p.breeder, sale_checked_at: new Date().toISOString(),
      }).eq("id", id);
      if (error) throw error;
      done++;
      if (p.sale_price_man) sold++;
      if (p.club_price_man) club++;
      if (done % 200 === 0) console.log(`  ${done}頭（セリ${sold}・クラブ${club}）`);
    } catch (e) {
      failed++;
      console.warn(`  ${id}: ${(e as Error).message}`);
    }
  }
  const more = done + failed < todo.length;
  console.log(`${more ? "時間切れで中断" : "完了"}: ${done}頭を確認（セリ${sold}頭・クラブ募集${club}頭）、失敗${failed}頭`);
  setOutput("more", more ? "true" : "false");
  if (done + failed > 20 && failed > (done + failed) / 2) {
    console.error("半分以上失敗しました。netkeibaのページの形が変わった可能性があります。");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

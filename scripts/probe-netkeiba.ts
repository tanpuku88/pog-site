// netkeiba のページの形を調べるための診断スクリプト（データベースには書き込まない）。
//   npm run probe:netkeiba
import * as cheerio from "cheerio";
import { politeFetch, horsePageUrl, horseResultUrl } from "../src/lib/netkeiba/fetch";
import { parseRaceResults } from "../src/lib/netkeiba/parse";

async function main() {
  // 成績表の「距離」列（芝1600 など）が読めるか確かめる
  for (const id of ["2019105219", "2021105898", "2022105081"]) {
    for (const [label, url] of [["馬ページ", horsePageUrl(id)], ["成績ページ", horseResultUrl(id)]] as const) {
      try {
        const html = (await politeFetch(url)).html;
        const $ = cheerio.load(html);
        const heads = $("table.db_h_race_results thead th, table.db_h_race_results tr:first-child th").map((_, th) => $(th).text().trim()).get();
        const rs = parseRaceResults(html);
        console.log(`== ${id} ${label}: 見出し[${heads.join("|")}] 成績${rs?.length ?? "なし"}件`);
        rs?.slice(0, 3).forEach((r) => console.log(`   ${r.race_date} ${r.race_name} ${r.finish}着 ${r.surface}${r.distance}`));
      } catch (e) {
        console.log(`== ${id} ${label}: 失敗 ${(e as Error).message}`);
      }
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

// netkeiba のページの形を調べるための診断スクリプト（データベースには書き込まない）。
//   npm run probe:netkeiba
import * as cheerio from "cheerio";
import { politeFetch, horsePageUrl, horseResultUrl } from "../src/lib/netkeiba/fetch";
import { parseRaceResults } from "../src/lib/netkeiba/parse";

const rowsOf = ($: cheerio.CheerioAPI, t: cheerio.Cheerio<never>) =>
  t.find("tr").toArray().slice(0, 6).map((tr) => $(tr).find("th,td").map((_, c) => $(c).text().replace(/\s+/g, " ").trim()).get().join("|"));

async function main() {
  // 子の馬ページから父のIDを取る
  const child = "2022105081";
  const $c = cheerio.load((await politeFetch(horsePageUrl(child))).html);
  const links = $c("table.blood_table a").map((_, a) => `${$c(a).text().trim()}=${$c(a).attr("href")}`).get();
  console.log("血統表のリンク:", links.slice(0, 6).join(" , "));
  for (const sireId of ["2012102013", "2015104961"]) {
    for (const url of [`https://db.netkeiba.com/horse/sire/${sireId}/`, `https://db.netkeiba.com/horse/sire/${sireId}/?type=1`]) {
      try {
        const html = (await politeFetch(url)).html;
        const $ = cheerio.load(html);
        console.log(`== ${url} タイトル: ${$("title").text().trim()} 表${$("table").length}個`);
        $("table").each((i, t) => { if (i < 3) rowsOf($, $(t) as never).forEach((r) => console.log(`  [${i}] ${r.slice(0, 400)}`)); });
      } catch (e) { console.log(`== ${url} 失敗 ${(e as Error).message}`); }
    }
    const rs = parseRaceResults((await politeFetch(horseResultUrl(sireId))).html);
    console.log(`== ${sireId} 現役成績 ${rs?.length}件`, rs?.filter((r) => r.finish === "1").map((r) => `${r.race_name}(${r.surface}${r.distance})`).join(" "));
    const $h = cheerio.load((await politeFetch(horsePageUrl(sireId))).html);
    console.log(`   プロフィール: ${$h("table.db_prof_table").text().replace(/\s+/g, " ").slice(0, 400)}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

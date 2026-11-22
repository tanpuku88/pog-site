// netkeiba のページの形を調べるための診断スクリプト（データベースには書き込まない）。
//   npm run probe:netkeiba
import * as cheerio from "cheerio";
import { politeFetch, horsePageUrl, narRaceListUrl, narShutubaUrl } from "../src/lib/netkeiba/fetch";
import { parseHorseProfile, parseNarRaceList, parseShutuba } from "../src/lib/netkeiba/parse";


async function profileLine(id: string) {
  try {
    const p = await politeFetch(horsePageUrl(id));
    const prof = parseHorseProfile(id, p.html);
    const $ = cheerio.load(p.html);
    let origin = "";
    $("table.db_prof_table tr").each((_, tr) => {
      if ($(tr).find("th").text().includes("産地")) origin = $(tr).find("td").text().trim();
    });
    return prof ? `${prof.name}（${prof.birth_year} 父${prof.sire} 産地${origin || "?"}）` : "なし";
  } catch (e) {
    return `失敗 ${(e as Error).message}`;
  }
}

function jst(offset: number) {
  return new Date(Date.now() + 9 * 3600_000 + offset * 86400_000).toISOString().slice(0, 10).replaceAll("-", "");
}

async function probeSale() {
  // 馬ページのプロフィール表に「セリ取引価格」があるか
  for (const id of ["2024106790", "2024109020", "2024100287", "2024104479", "2024101683", "2024100075", "2023104523", "2022105485"]) {
    try {
      const $ = cheerio.load((await politeFetch(horsePageUrl(id))).html);
      const rows: string[] = [];
      $("table.db_prof_table tr").each((_, tr) => { rows.push(`${$(tr).find("th").text().trim()}=${$(tr).find("td").text().replace(/\s+/g, " ").trim()}`); });
      console.log(`== ${id} ${$(".horse_title h1").first().text().trim()}\n  ${rows.join("\n  ")}`);
    } catch (e) { console.log(`${id} 失敗 ${(e as Error).message}`); }
  }
}

async function main() {
  await probeSale();
  if (process.env.PROBE_ALL !== "1") return;
  // 外国産馬（マル外）の馬IDの範囲を確かめる
  console.log("== 外国産馬のID");
  for (const n of [110001, 110002, 110005, 110010, 110015, 110016, 110020, 110030, 110050, 110080, 110100, 110150, 110200, 190001, 109990]) {
    const id = `2024${n}`;
    console.log(`ID ${id}: ${await profileLine(id)}`);
  }
  for (const id of ["2023110001", "2023110050", "2023110100", "2023110150"]) console.log(`ID ${id}: ${await profileLine(id)}`);

  // 地方競馬のレース一覧・出馬表（今日・明日・過去）
  for (const off of [0, 1, -1, -30, -150]) {
    const d = jst(off);
    try {
      const list = await politeFetch(narRaceListUrl(d));
      const ids = parseNarRaceList(list.html);
      const all = [...new Set([...list.html.matchAll(/race_id=(\d{12})/g)].map((m) => m[1].slice(4, 6)))];
      console.log(`\n== 地方 ${d}: ${ids.length}レース（場コード ${all.join(",")}） 例 ${ids.slice(0, 3).join(",")}`);
      if (ids[0]) {
        const sh = await politeFetch(narShutubaUrl(ids[0]));
        const s = parseShutuba(ids[0], sh.html);
        console.log(`  出馬表 ${ids[0]}: ${s.venue}${s.race_no}R「${s.race_name}」${s.post_time} 出走${s.horse_ids.length}頭 例${s.horse_ids.slice(0, 3).join(",")}`);
      }
    } catch (e) {
      console.log(`\n== 地方 ${d}: 失敗 ${(e as Error).message}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

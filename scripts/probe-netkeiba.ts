// netkeiba の馬一覧・検索フォームの形を調べるための診断スクリプト（データベースには書き込まない）。
//   npm run probe:netkeiba
import * as cheerio from "cheerio";
import { politeFetch, horsePageUrl } from "../src/lib/netkeiba/fetch";
import { parseHorseSearch, parseHorseProfile } from "../src/lib/netkeiba/parse";

const BASE = "https://db.netkeiba.com/";

async function showForm(url: string) {
  const page = await politeFetch(url);
  const $ = cheerio.load(page.html);
  console.log(`\n== フォーム ${url} -> ${page.url}`);
  console.log(`title: ${$("title").text().trim()}`);
  $("form").each((i, f) => {
    const form = $(f);
    const fields: string[] = [];
    form.find("input, select").each((_, el) => {
      const e = $(el);
      const name = e.attr("name");
      if (!name) return;
      const type = e.is("select") ? `select(${e.find("option").slice(0, 6).map((_, o) => $(o).attr("value")).get().join("|")})` : e.attr("type") ?? "text";
      fields.push(`${name}=${type}${e.attr("value") ? `:${e.attr("value")}` : ""}`);
    });
    console.log(`form#${i} action=${form.attr("action")} method=${form.attr("method")}\n  ${fields.join("\n  ")}`);
  });
}

async function tryList(label: string, url: string) {
  const page = await politeFetch(url);
  const $ = cheerio.load(page.html);
  const hits = parseHorseSearch(page.html);
  const years = new Map<string, number>();
  for (const h of hits) years.set(String(h.birth_year), (years.get(String(h.birth_year)) ?? 0) + 1);
  const count = page.html.match(/([\d,]+)\s*件/)?.[0] ?? "-";
  console.log(`\n== ${label}\n${url}\n-> ${page.url}\ntitle: ${$("title").text().trim()} / 件数表示: ${count} / ${hits.length}頭`);
  console.log(`生年: ${[...years].map(([y, n]) => `${y}:${n}`).join(" ")}`);
  console.log(`例: ${hits.slice(0, 3).map((h) => `${h.name}(${h.birth_year},父${h.sire})`).join(" / ")}`);
  const pager = $("a").filter((_, a) => /page=|次/.test(($(a).attr("href") ?? "") + $(a).text())).slice(0, 3).map((_, a) => $(a).attr("href")).get();
  console.log(`ページ送りリンク例: ${pager.join(" , ")}`);
}

async function main() {
  await showForm(`${BASE}?pid=horse_search_detail`);
  const variants: [string, string][] = [
    ["年齢2歳（現在）", `${BASE}?pid=horse_list&match=partial_match&under_age=2&over_age=2&sort=name&list=100&page=1`],
    ["年齢2歳＋空の条件", `${BASE}?pid=horse_list&word=&match=partial_match&sire=&mare=&bms=&trainer=&owner=&breeder=&under_age=2&over_age=2&prize_min=&prize_max=&sort=prize&list=100`],
    ["生年2024(birthyear)", `${BASE}?pid=horse_list&birthyear=2024&list=100`],
    ["生年2024(birth_year)", `${BASE}?pid=horse_list&birth_year=2024&list=100`],
  ];
  for (const [label, url] of variants) {
    try { await tryList(label, url); } catch (e) { console.log(`\n== ${label} 失敗: ${(e as Error).message}`); }
  }
  // 馬IDの番号の範囲を確かめる（2024年生まれのIDは 2024 + 6桁）
  for (const id of ["2024100001", "2024101000", "2024105000", "2024108000", "2024110000", "2024190001"]) {
    try {
      const p = await politeFetch(horsePageUrl(id));
      const prof = parseHorseProfile(id, p.html);
      console.log(`ID ${id}: ${prof ? `${prof.name}（${prof.birth_year} 父${prof.sire}）` : "なし"}`);
    } catch (e) {
      console.log(`ID ${id}: 失敗 ${(e as Error).message}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

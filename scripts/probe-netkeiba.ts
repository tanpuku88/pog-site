// netkeiba などのページの形を調べるための診断スクリプト（データベースには書き込まない）。
//   npm run probe:netkeiba
import * as cheerio from "cheerio";
import { politeFetch, fetchPage } from "../src/lib/netkeiba/fetch";

function around(html: string, word: string, n = 3) {
  const text = cheerio.load(html).root().text().replace(/\s+/g, " ");
  const out: string[] = [];
  let i = text.indexOf(word);
  while (i >= 0 && out.length < n) { out.push(text.slice(Math.max(0, i - 80), i + 160)); i = text.indexOf(word, i + 1); }
  return out;
}

async function main() {
  // 種付け料がどこに載っているか
  const pages = [
    "https://db.netkeiba.com/horse/2012102013/",
    "https://db.netkeiba.com/horse/sire/2012102013/",
    "https://www.jbis.or.jp/horse/result/?sid=horse&keyword=%E3%82%AD%E3%82%BF%E3%82%B5%E3%83%B3%E3%83%96%E3%83%A9%E3%83%83%E3%82%AF",
    "https://www.jbis.or.jp/seri/stallion/",
    "https://www.shadai-ss.com/stallion/",
  ];
  for (const url of pages) {
    try {
      const p = url.includes("netkeiba") ? await politeFetch(url) : await fetchPage(url);
      const $ = cheerio.load(p.html);
      console.log(`== ${url} 「${$("title").text().trim()}」 ${p.html.length}文字`);
      for (const w of ["種付", "Fee", "受胎条件"]) around(p.html, w).forEach((t) => console.log(`  [${w}] ${t}`));
      const links = $("a").map((_, a) => $(a).attr("href") ?? "").get().filter((h) => /stallion|horse\/\d|fee/i.test(h)).slice(0, 8);
      console.log(`  links: ${links.join(" ")}`);
    } catch (e) {
      console.log(`== ${url} 失敗 ${(e as Error).message}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
}

main().catch((e) => { console.error(e); process.exit(1); });

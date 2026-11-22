// 種牡馬の「名鑑」用データを netkeiba から集めて src/data/sire-profiles.json に保存する。
// - 産駒成績（全世代の累計）: 芝・ダートの出走と勝利、平均距離、勝馬率、EI
// - 現役時代の成績: 戦績、勝ったレース（重賞）、芝・ダート、距離
// 種牡馬の成績は年に数回しか大きく変わらないので、たまに動かせば十分。
//   npm run build:sires
import { readFileSync, writeFileSync } from "node:fs";
import { adminDb } from "./db";
import { politeFetch, horsePageUrl, horsePedUrl, horseResultUrl } from "../src/lib/netkeiba/fetch";
import { parseRaceResults, parseSireId, parseSireOffspring } from "../src/lib/netkeiba/parse";
import { defaultSeason } from "../src/lib/standings";
import type { SireCareer, SireData, SireFee } from "../src/lib/sire-data";
import { parseJbisFee, parseJbisSearch } from "../src/lib/netkeiba/parse";

const OUT = "src/data/sire-profiles.json";
const TIME_BUDGET_MIN = Number(process.env.TIME_BUDGET_MIN ?? 300);
const MAX_AGE_DAYS = Number(process.env.MAX_AGE_DAYS ?? 30);

function gradeOf(name: string): number | null {
  const m = name.match(/\((?:J・)?G(I{1,3}|[123])\)/);
  if (!m) return null;
  return ({ I: 1, II: 2, III: 3, "1": 1, "2": 2, "3": 3 } as Record<string, number>)[m[1]] ?? null;
}

async function career(id: string): Promise<SireCareer | null> {
  let html = (await politeFetch(horseResultUrl(id))).html;
  let rs = parseRaceResults(html);
  if (!rs || rs.length === 0) {
    html = (await politeFetch(horsePageUrl(id))).html;
    rs = parseRaceResults(html);
  }
  if (!rs || rs.length === 0) return null;
  const wins = rs.filter((r) => r.finish === "1");
  const big = wins
    .map((r) => ({ year: Number(r.race_date.slice(0, 4)), race: r.race_name.replace(/\((?:J・)?G(?:I{1,3}|[123])\)/, "").replace(/競走$/, "").trim(), grade: gradeOf(r.race_name), surface: r.surface, distance: r.distance }))
    .filter((w) => w.grade !== null)
    .sort((a, b) => a.grade! - b.grade! || b.year - a.year);
  const winDist = wins.map((r) => r.distance).filter((d): d is number => !!d);
  return {
    runs: rs.length,
    wins: wins.length,
    places: rs.filter((r) => ["1", "2", "3"].includes(r.finish ?? "")).length,
    turfRuns: rs.filter((r) => r.surface === "芝").length,
    dirtRuns: rs.filter((r) => r.surface === "ダ").length,
    avgWinDist: winDist.length ? Math.round(winDist.reduce((a, b) => a + b, 0) / winDist.length) : null,
    firstYear: Number(rs[rs.length - 1].race_date.slice(0, 4)) || null,
    lastYear: Number(rs[0].race_date.slice(0, 4)) || null,
    bigWins: big.slice(0, 8),
  };
}

/** JBIS で種付け料と繋養先を調べる（日本で供用されている種牡馬だけ） */
async function stud(name: string): Promise<SireFee | null> {
  if (/[(（][^)）]+[)）]$/.test(name)) return null; // 「Frankel (英)」など海外の種牡馬
  const search = (await politeFetch(`https://www.jbis.or.jp/horse/result/?sid=horse&keyword=${encodeURIComponent(name)}`)).html;
  for (const id of parseJbisSearch(search, name).slice(0, 3)) {
    const html = (await politeFetch(`https://www.jbis.or.jp/horse/${id}/`)).html;
    const fee = parseJbisFee(html, name);
    if (fee) return { ...fee, jbisId: id };
  }
  return null;
}

async function main() {
  const db = adminDb();
  const cur = defaultSeason().crop_year;
  // 種牡馬ごとに、子の数と子の馬ID（父のIDを血統表から取るため）
  const sires = new Map<string, { count: number; child: string }>();
  for (const crop of [cur, cur - 1]) {
    for (let from = 0; ; from += 1000) {
      const { data, error } = await db.from("horses").select("id, sire").eq("birth_year", crop).not("sire", "is", null).order("id").range(from, from + 999);
      if (error) throw error;
      for (const h of data) {
        const s = sires.get(h.sire) ?? { count: 0, child: h.id };
        s.count++;
        sires.set(h.sire, s);
      }
      if (data.length < 1000) break;
    }
  }
  const store: Record<string, SireData> = JSON.parse(readFileSync(OUT, "utf8"));
  const fresh = (d?: SireData) => d && Date.now() - Date.parse(d.fetchedAt) < MAX_AGE_DAYS * 86400_000;
  const todo = [...sires].filter(([name]) => !fresh(store[name]) || store[name].stud === undefined).sort((a, b) => b[1].count - a[1].count);
  console.log(`種牡馬 ${sires.size}頭（今回読むのは ${todo.length}頭）`);
  const deadline = Date.now() + TIME_BUDGET_MIN * 60_000;
  let done = 0, failed = 0;
  for (const [name, { child }] of todo) {
    if (Date.now() > deadline) break;
    try {
      if (fresh(store[name])) {
        // 成績は新しいので、種付け料だけ調べる
        store[name] = { ...store[name], stud: await stud(name) };
      } else {
        const id = store[name]?.id ?? parseSireId((await politeFetch(horsePedUrl(child))).html);
        if (!id) throw new Error("父のIDが見つかりません");
        const offspring = parseSireOffspring((await politeFetch(`https://db.netkeiba.com/horse/sire/${id}/`)).html);
        const c = await career(id);
        store[name] = { id, offspring, career: c, stud: await stud(name), fetchedAt: new Date().toISOString() };
      }
      done++;
      if (done % 20 === 0) {
        writeFileSync(OUT, JSON.stringify(store, null, 1) + "\n");
        console.log(`  ${done}頭`);
      }
    } catch (e) {
      failed++;
      console.warn(`  ${name}: ${(e as Error).message}`);
    }
  }
  // 名前順に並べて保存（差分を読みやすく）
  const sorted = Object.fromEntries(Object.entries(store).sort(([a], [b]) => a.localeCompare(b, "ja")));
  writeFileSync(OUT, JSON.stringify(sorted, null, 1) + "\n");
  console.log(`完了: ${done}頭を保存、失敗${failed}頭`);
  if (done + failed > 20 && failed > (done + failed) / 2) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

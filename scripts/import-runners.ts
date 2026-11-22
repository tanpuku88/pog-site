// 2歳馬（または指定した世代）の「レースに出た馬」を開催日ごとに集め、その馬の成績を取り込む。
// 指名されていない馬の成績も入るので、種牡馬・厩舎・馬主・生産牧場の勝ち上がり率が正しく出せる。
//   毎晩: 直近の数日分だけ（DAYS_BACK）
//   最初の1回・前の世代: FROM_DATE〜TO_DATE をまとめて（時間切れなら続きの日付で自動再実行）
//   CROP_YEAR=2023 FROM_DATE=2025-06-01 TO_DATE=2026-05-31 npm run import:runners
import { appendFileSync } from "node:fs";
import { adminDb } from "./db";
import { politeFetch } from "../src/lib/netkeiba/fetch";
import { parseShutuba } from "../src/lib/netkeiba/parse";
import { enabledSources } from "../src/lib/netkeiba/sources";
import { syncHorse } from "../src/lib/horse-sync";
import { defaultSeason } from "../src/lib/standings";
import { todayJst } from "../src/lib/util";
import { datesNewestFirst, fetchedAfterRace, isCropId } from "../src/lib/runner-scan";

const TIME_BUDGET_MIN = Number(process.env.TIME_BUDGET_MIN ?? 320);

function setOutput(key: string, value: string) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

function addDays(date: string, n: number) {
  return new Date(Date.parse(`${date}T00:00:00Z`) + n * 86400_000).toISOString().slice(0, 10);
}

async function main() {
  const db = adminDb();
  const season = defaultSeason();
  const cropYear = Number(process.env.CROP_YEAR || season.crop_year);
  const today = todayJst();
  const daysBack = Number(process.env.DAYS_BACK || 0);
  const to = process.env.TO_DATE || today;
  const from = process.env.FROM_DATE || (daysBack > 0 ? addDays(to, -daysBack) : season.season_start);
  const deadline = Date.now() + TIME_BUDGET_MIN * 60_000;
  const dates = datesNewestFirst(from, to > today ? today : to);
  console.log(`${cropYear}年生まれの出走馬を ${dates.at(-1)}〜${dates[0]} の${dates.length}日分調べます`);

  let synced = 0;
  let skipped = 0;
  let failed = 0;
  let next: string | null = null;
  for (const date of dates) {
    if (Date.now() > deadline) { next = date; break; }
    let raceCount = 0;
    const runners = new Set<string>();
    for (const src of enabledSources()) {
      let raceIds: string[] = [];
      try {
        raceIds = src.parseList((await politeFetch(src.listUrl(date.replaceAll("-", "")))).html);
      } catch (e) {
        console.warn(`${date} ${src.label}: レース一覧を読めませんでした ${(e as Error).message}`);
        continue;
      }
      raceCount += raceIds.length;
      for (const raceId of raceIds) {
        try {
          const s = parseShutuba(raceId, (await politeFetch(src.shutubaUrl(raceId))).html);
          s.horse_ids.filter((id) => isCropId(id, cropYear)).forEach((id) => runners.add(id));
        } catch (e) {
          console.warn(`  ${raceId}: 出馬表を読めませんでした ${(e as Error).message}`);
        }
      }
    }
    if (raceCount === 0) continue;
    const ids = [...runners];
    // レースの後にもう成績を読んだ馬は飛ばす
    const fetched = new Map<string, string | null>();
    for (let i = 0; i < ids.length; i += 200) {
      const { data, error } = await db.from("horses").select("id, results_fetched_at").in("id", ids.slice(i, i + 200));
      if (error) throw error;
      (data ?? []).forEach((h) => fetched.set(h.id as string, h.results_fetched_at as string | null));
    }
    const todo = ids.filter((id) => !fetchedAfterRace(fetched.get(id) ?? null, date));
    skipped += ids.length - todo.length;
    console.log(`${date}: ${raceCount}レース・${cropYear}年生まれ${ids.length}頭（成績を読む${todo.length}頭）`);
    for (const id of todo) {
      if (Date.now() > deadline) break;
      try {
        await syncHorse(db, id);
        synced++;
      } catch (e) {
        failed++;
        console.warn(`  ${id}: ${(e as Error).message}`);
      }
    }
    if (Date.now() > deadline) { next = date; break; }
  }

  console.log(`${next ? `時間切れで中断（次回は ${next} から古い日へ）` : "完了"}: 成績を読んだ${synced}頭・読み済みで飛ばした${skipped}頭・失敗${failed}頭`);
  setOutput("more", next ? "true" : "false");
  setOutput("next_to", next ?? "");
  if (synced + failed > 20 && failed > (synced + failed) / 2) {
    console.error("半分以上失敗しました。netkeibaのページの形が変わった可能性があります。");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

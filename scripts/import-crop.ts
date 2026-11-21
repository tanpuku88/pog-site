// 世代（生まれ年）の馬を netkeiba からまとめて取り込む。中央・地方の両方が対象。
// netkeiba の一覧ページは年齢の絞り込みが効かないため、馬IDを番号順に1頭ずつ確かめる
// （1頭あたり馬ページと血統ページの2回、3秒以上の間隔をあけて読む）。
// 時間の上限に来たら途中で止め、次回は続きから再開する。
//   CROP_YEAR=2024 npm run import:crop
import { appendFileSync } from "node:fs";
import { adminDb } from "./db";
import { politeFetch, horsePageUrl, horsePedUrl } from "../src/lib/netkeiba/fetch";
import { parseHorseProfile, parsePedigreePage } from "../src/lib/netkeiba/parse";
import { defaultSeason } from "../src/lib/standings";
import { cropIdFirst, cropIdUpper, nextScanNumber, reachedEnd } from "../src/lib/crop-scan";

const TIME_BUDGET_MIN = Number(process.env.TIME_BUDGET_MIN ?? 320);
const MISS_LIMIT = Number(process.env.MISS_LIMIT ?? 200);
const BATCH = 50;

function setOutput(key: string, value: string) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

async function main() {
  const db = adminDb();
  const cropYear = Number(process.env.CROP_YEAR || defaultSeason().crop_year);
  const deadline = Date.now() + TIME_BUDGET_MIN * 60_000;

  // 前回どこまで保存したか（世代のIDの中で一番大きいもの）
  const { data: last, error: e0 } = await db
    .from("horses").select("id")
    .gte("id", cropIdFirst(cropYear)).lt("id", cropIdUpper(cropYear))
    .order("id", { ascending: false }).limit(1);
  if (e0) throw e0;
  let n = Number(process.env.START_ID || nextScanNumber(cropYear, last?.[0]?.id ?? null));
  console.log(`${cropYear}年生まれの馬を ID ${n} から調べます（上限${TIME_BUDGET_MIN}分）`);

  let misses = 0;
  let saved = 0;
  let checked = 0;
  let buffer: Record<string, unknown>[] = [];
  const flush = async () => {
    if (buffer.length === 0) return;
    // 名前・血統などのプロフィールだけ更新する（成績はそのまま）
    const { error } = await db.from("horses").upsert(buffer, { onConflict: "id" });
    if (error) throw error;
    saved += buffer.length;
    buffer = [];
  };

  let finished = false;
  while (n < Number(cropIdUpper(cropYear))) {
    if (Date.now() > deadline) break;
    const id = String(n);
    checked++;
    let profile = null;
    try {
      profile = parseHorseProfile(id, (await politeFetch(horsePageUrl(id))).html);
    } catch (e) {
      const msg = (e as Error).message;
      if (!msg.includes(" 404")) console.warn(`  ${id}: 読み込み失敗 ${msg}`);
    }

    if (!profile) {
      misses++;
      if (reachedEnd(misses, MISS_LIMIT)) { finished = true; break; }
    } else {
      misses = 0;
      if (!profile.sire || !profile.dam) {
        try {
          const ped = parsePedigreePage((await politeFetch(horsePedUrl(id))).html);
          profile.sire ??= ped.sire;
          profile.dam ??= ped.dam;
          profile.damsire ??= ped.damsire;
        } catch (e) {
          console.warn(`  ${id}: 血統ページを読めませんでした ${(e as Error).message}`);
        }
      }
      buffer.push({ ...profile, birth_year: profile.birth_year ?? cropYear, updated_at: new Date().toISOString() });
      if (buffer.length >= BATCH) {
        await flush();
        console.log(`  ID ${id} まで: ${saved}頭を保存`);
      }
    }
    n++;
  }
  await flush();
  if (n >= Number(cropIdUpper(cropYear))) finished = true;

  console.log(`${finished ? "完了" : "時間切れで中断（次回は続きから）"}: ${checked}件のIDを調べ、${saved}頭を保存`);
  setOutput("more", finished ? "false" : "true");
  if (checked > 20 && saved === 0 && !finished) {
    console.error("1頭も保存できませんでした。netkeibaのページの形が変わった可能性があります。");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

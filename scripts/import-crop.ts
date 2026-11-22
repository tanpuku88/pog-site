// 世代（生まれ年）の馬を netkeiba からまとめて取り込む。中央・地方・外国産（マル外）が対象。
// netkeiba の一覧ページは年齢の絞り込みが効かないため、馬IDを番号順に1頭ずつ確かめる
// （1頭あたり馬ページと血統ページの2回、3秒以上の間隔をあけて読む）。
// すでに保存済みの馬は読まずに飛ばす。時間の上限に来たら途中で止め、
// 続きの番号（START_ID）を渡して自動で再実行する。
//   CROP_YEAR=2024 START_ID=2024100001 npm run import:crop
import { appendFileSync } from "node:fs";
import { adminDb } from "./db";
import { politeFetch, horsePageUrl, horsePedUrl } from "../src/lib/netkeiba/fetch";
import { parseHorseProfile, parsePedigreePage } from "../src/lib/netkeiba/parse";
import { defaultSeason } from "../src/lib/standings";
import { cropIdFirst, cropIdUpper, foreignIdFirst, nextScanNumber, reachedEnd } from "../src/lib/crop-scan";

const TIME_BUDGET_MIN = Number(process.env.TIME_BUDGET_MIN ?? 320);
// 番号には数百の空きがあることがあるので、かなり続いてから終わりとみなす
const MISS_LIMIT = Number(process.env.MISS_LIMIT ?? 2000);
// 毎週の定期実行では、新しく登録された馬が並ぶ番号の続きだけを見る
const WEEKLY_MISS_LIMIT = Number(process.env.WEEKLY_MISS_LIMIT ?? 300);
const BATCH = 50;

function setOutput(key: string, value: string) {
  if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
}

async function main() {
  const db = adminDb();
  const cropYear = Number(process.env.CROP_YEAR || defaultSeason().crop_year);
  const deadline = Date.now() + TIME_BUDGET_MIN * 60_000;
  const upper = Number(process.env.END_ID || cropIdUpper(cropYear));

  // 世代のIDで保存済みのもの（読まずに飛ばす）
  const existing = new Set<string>();
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("horses").select("id")
      .gte("id", cropIdFirst(cropYear)).lt("id", cropIdUpper(cropYear))
      .order("id").range(from, from + 999);
    if (error) throw error;
    data.forEach((r) => existing.add(r.id as string));
    if (data.length < 1000) break;
  }
  // START_ID の指定があればそこから上限まで（最初の一括取り込み・続きの自動実行）。
  // 指定がなければ（毎週の定期実行）、国内産（Y100001〜）と外国産（Y110001〜）それぞれの
  // 保存済みの一番大きい番号の続きから、新しく登録された馬を探す。
  const ranges: { label: string; from: number; to: number; missLimit: number }[] = [];
  if (process.env.START_ID) {
    ranges.push({ label: "指定", from: Number(process.env.START_ID), to: upper, missLimit: MISS_LIMIT });
  } else {
    const ids = [...existing].sort();
    const foreignFirst = foreignIdFirst(cropYear);
    const lastDomestic = ids.filter((id) => id < foreignFirst).at(-1) ?? null;
    const lastForeign = ids.filter((id) => id >= foreignFirst).at(-1) ?? null;
    ranges.push({ label: "国内産", from: nextScanNumber(cropYear, lastDomestic), to: Number(foreignFirst), missLimit: WEEKLY_MISS_LIMIT });
    ranges.push({ label: "外国産", from: lastForeign ? Number(lastForeign) + 1 : Number(foreignFirst), to: upper, missLimit: WEEKLY_MISS_LIMIT });
  }

  let saved = 0;
  let checked = 0;
  let buffer: Record<string, unknown>[] = [];
  const flush = async () => {
    if (buffer.length === 0) return;
    const { error } = await db.from("horses").upsert(buffer, { onConflict: "id" });
    if (error) throw error;
    saved += buffer.length;
    buffer = [];
  };

  let timedOut = false;
  let n = 0;
  for (const range of ranges) {
    console.log(`${cropYear}年生まれ（${range.label}）を ID ${range.from} から調べます（保存済み${existing.size}頭、上限${TIME_BUDGET_MIN}分）`);
    let misses = 0;
    for (n = range.from; n < range.to; n++) {
      if (Date.now() > deadline) { timedOut = true; break; }
      const id = String(n);
      if (existing.has(id)) { misses = 0; continue; }
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
        if (reachedEnd(misses, range.missLimit)) break;
        continue;
      }
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
      buffer.push({ ...profile, birth_year: profile.birth_year ?? cropYear, sale_checked_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      if (buffer.length >= BATCH) {
        await flush();
        console.log(`  ID ${id} まで: ${saved}頭を保存`);
      }
    }
    if (timedOut) break;
  }
  await flush();

  console.log(`${timedOut ? `時間切れで中断（次回は ID ${n} から）` : "完了"}: ${checked}件のIDを調べ、${saved}頭を保存（世代の合計 ${existing.size + saved}頭）`);
  setOutput("more", timedOut ? "true" : "false");
  setOutput("next_id", String(n));
  if (checked > 20 && saved === 0 && timedOut) {
    console.error("1頭も保存できませんでした。netkeibaのページの形が変わった可能性があります。");
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

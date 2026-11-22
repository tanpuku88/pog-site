// 今日から3日先までの出馬表（中央・地方）を見て、指名馬の出走予定と新馬戦の出走馬を保存する。
// GitHub Actions から毎日夕方に実行する（地方は平日も開催があるため）。
import { adminDb, pickedHorseIds } from "./db";
import { politeFetch } from "../src/lib/netkeiba/fetch";
import { parseShutuba } from "../src/lib/netkeiba/parse";
import { enabledSources, isShinba } from "../src/lib/netkeiba/sources";
import { syncHorse } from "../src/lib/horse-sync";

const MAX_NEW_HORSES = Number(process.env.MAX_NEW_HORSES ?? 300);

const DAYS_AHEAD = Number(process.env.ENTRY_DAYS_AHEAD ?? 3);

function jstDate(offsetDays: number) {
  const d = new Date(Date.now() + 9 * 3600 * 1000 + offsetDays * 86400 * 1000);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const db = adminDb();
  const picked = new Set(await pickedHorseIds(db));
  console.log(`指名馬 ${picked.size}頭`);

  // 過去の出走予定を消す
  await db.from("entries").delete().lt("race_date", jstDate(0));

  const rows: Record<string, unknown>[] = [];
  // 新馬戦は指名馬に限らず全出走馬を保存する（新馬戦ページ用）
  const shinbaRunners: { id: string; row: Record<string, unknown> }[] = [];
  for (let i = 0; i <= DAYS_AHEAD; i++) for (const src of enabledSources()) {
    const date = jstDate(i);
    let raceIds: string[] = [];
    try {
      raceIds = src.parseList((await politeFetch(src.listUrl(date.replaceAll("-", "")))).html);
    } catch (e) {
      console.warn(`${date} ${src.label}: レース一覧を読めませんでした ${(e as Error).message}`);
      continue;
    }
    if (raceIds.length === 0) continue;
    console.log(`${date} ${src.label}: ${raceIds.length}レース`);
    for (const raceId of raceIds) {
      let s;
      try {
        s = parseShutuba(raceId, (await politeFetch(src.shutubaUrl(raceId))).html);
      } catch (e) {
        console.warn(`  ${raceId}: 出馬表を読めませんでした ${(e as Error).message}`);
        continue;
      }
      const shinba = isShinba(s.race_name);
      if (shinba) shinbaRunners.push(...s.horse_ids.map((id) => ({ id, row: { race_id: raceId, race_date: date, venue: s.venue, race_no: s.race_no, race_name: s.race_name, post_time: s.post_time } })));
      for (const horseId of s.horse_ids) {
        if (!picked.has(horseId) || shinba) continue;
        rows.push({
          horse_id: horseId, race_id: raceId, race_date: date, venue: s.venue,
          race_no: s.race_no, race_name: s.race_name, post_time: s.post_time,
        });
        console.log(`  ${s.venue}${s.race_no}R ${s.race_name}: ${horseId}`);
      }
    }
  }
  if (shinbaRunners.length > 0) {
    // まだ保存していない馬はプロフィールを取り込む
    const ids = [...new Set(shinbaRunners.map((r) => r.id))];
    const known = new Set<string>();
    for (let i = 0; i < ids.length; i += 200) {
      const { data, error } = await db.from("horses").select("id").in("id", ids.slice(i, i + 200));
      if (error) throw error;
      (data ?? []).forEach((h) => known.add(h.id));
    }
    let added = 0;
    for (const id of ids) {
      if (known.has(id) || added >= MAX_NEW_HORSES) continue;
      try {
        await syncHorse(db, id);
        known.add(id);
        added += 1;
      } catch (e) {
        console.error(`  新馬の取り込み失敗 ${id}: ${(e as Error).message}`);
      }
    }
    for (const r of shinbaRunners) if (known.has(r.id)) rows.push({ horse_id: r.id, ...r.row });
    console.log(`新馬戦の出走馬 ${ids.length}頭（新しく${added}頭を取り込み）`);
  }

  if (rows.length > 0) {
    const { error } = await db.from("entries").upsert(rows);
    if (error) throw error;
  }
  console.log(`出走予定 ${rows.length}件を保存しました`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

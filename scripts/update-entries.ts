// 今日から3日先までのJRAの出馬表を見て、指名馬の出走予定を保存する。
// GitHub Actions から木・金・土の夕方に実行する。
import { adminDb, pickedHorseIds } from "./db";
import { politeFetch, raceListUrl, shutubaUrl } from "../src/lib/netkeiba/fetch";
import { parseRaceList, parseShutuba } from "../src/lib/netkeiba/parse";

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
  for (let i = 0; i <= DAYS_AHEAD; i++) {
    const date = jstDate(i);
    const list = await politeFetch(raceListUrl(date.replaceAll("-", "")));
    const raceIds = parseRaceList(list.html);
    if (raceIds.length === 0) continue;
    console.log(`${date}: ${raceIds.length}レース`);
    for (const raceId of raceIds) {
      const page = await politeFetch(shutubaUrl(raceId));
      const s = parseShutuba(raceId, page.html);
      for (const horseId of s.horse_ids) {
        if (!picked.has(horseId)) continue;
        rows.push({
          horse_id: horseId, race_id: raceId, race_date: date, venue: s.venue,
          race_no: s.race_no, race_name: s.race_name, post_time: s.post_time,
        });
        console.log(`  ${s.venue}${s.race_no}R ${s.race_name}: ${horseId}`);
      }
    }
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

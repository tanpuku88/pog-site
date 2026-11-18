// 指名されている全馬の成績を netkeiba から取り直す。
// GitHub Actions から1日1回実行する。アクセスは1頭ずつ間隔をあけて行う。
import { adminDb, pickedHorseIds } from "./db";
import { syncHorse } from "../src/lib/horse-sync";

async function main() {
  const db = adminDb();
  const ids = await pickedHorseIds(db);
  console.log(`指名馬 ${ids.length}頭の成績を更新します`);
  let ok = 0;
  const failed: string[] = [];
  for (const id of ids) {
    try {
      const { profile, results } = await syncHorse(db, id);
      ok += 1;
      console.log(`  ${profile.name} (${id}): ${results.length}戦`);
    } catch (e) {
      failed.push(id);
      console.error(`  失敗 ${id}: ${(e as Error).message}`);
    }
  }
  console.log(`完了: 成功 ${ok} / 失敗 ${failed.length}`);
  // 半分以上失敗したら、ページの形が変わった可能性が高いので異常終了にする
  if (ids.length > 0 && failed.length > ids.length / 2) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

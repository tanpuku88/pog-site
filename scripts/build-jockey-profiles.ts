// 騎手の「デビュー戦での成績」を netkeiba から集めて src/data/jockey-profiles.json に保存する。
// 今の世代（2歳）の全頭について成績表を読み、いちばん古いレース＝デビュー戦の騎手を集計する。
// 新馬戦の狙い目スコア（第2段階）で「新馬戦に強い騎手」を見るための材料。
//
// 頭数が多く（約8,000頭）1回の実行（4時間）では読み切れないので、1頭ずつの結果を
// data/jockey-debuts.json に記録し、次の実行では続きから読む（全頭そろうまで2晩ほど）。
//   - まだ一度も見ていない馬を最優先で読む
//   - デビュー戦がわかった馬は以後読み直さない（デビュー戦は変わらないため）
//   - 未デビューだった馬は、確認した日が古い順に読み直す（その後デビューしたかを見る）
// 集計（jockey-profiles.json）は毎回、記録済みの全頭分から作り直す。
//   npm run build:jockeys
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { adminDb } from "./db";
import { politeFetch, horseResultUrl } from "../src/lib/netkeiba/fetch";
import { parseRaceResults } from "../src/lib/netkeiba/parse";
import { defaultSeason } from "../src/lib/standings";
import { aggregate, loadProgress, planOrder, type Progress } from "./jockey-debuts";

const OUT = "src/data/jockey-profiles.json";
/** 1頭ずつの途中経過（サイトの表示には使わない。続きから再開するための記録） */
const PROGRESS = "data/jockey-debuts.json";
const TIME_BUDGET_MIN = Number(process.env.TIME_BUDGET_MIN ?? 240);
/** 途中で止まっても失わないよう、この頭数ごとに記録を書き出す */
const SAVE_EVERY = 200;

function saveProgress(p: Progress) {
  mkdirSync(dirname(PROGRESS), { recursive: true });
  p.updated_at = new Date().toISOString();
  // 1頭1行にして、差分（コミット）を小さく・読みやすくする
  const lines = Object.entries(p.horses)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([id, e]) => `  ${JSON.stringify(id)}: ${JSON.stringify(e)}`);
  writeFileSync(
    PROGRESS,
    `{\n "season_crop": ${p.season_crop},\n "updated_at": ${JSON.stringify(p.updated_at)},\n "horses": {\n${lines.join(",\n")}\n }\n}\n`,
  );
}

async function main() {
  const db = adminDb();
  const crop = defaultSeason().crop_year;

  const ids: string[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await db.from("horses").select("id").eq("birth_year", crop).order("id").range(from, from + 999);
    if (error) throw error;
    (data ?? []).forEach((h) => ids.push(h.id as string));
    if (!data || data.length < 1000) break;
  }

  const progress = loadProgress(PROGRESS, crop);
  const order = planOrder(ids, progress.horses);
  const unseen = ids.filter((id) => progress.horses[id] === undefined).length;
  console.log(
    `${crop}年生まれ ${ids.length}頭（未確認${unseen}頭・未デビューの再確認${order.length - unseen}頭）のデビュー戦を集計します`,
  );

  const deadline = Date.now() + TIME_BUDGET_MIN * 60_000;
  const today = new Date().toISOString().slice(0, 10);
  let done = 0;
  let newlyDebuted = 0;
  for (const id of order) {
    if (Date.now() > deadline) {
      console.warn(`時間予算に達したため ${done}/${order.length}頭で打ち切ります（次回は続きから）`);
      break;
    }
    done += 1;
    if (done % SAVE_EVERY === 0) {
      console.log(`  ${done}/${order.length}頭…`);
      saveProgress(progress);
    }
    let results;
    try {
      results = parseRaceResults((await politeFetch(horseResultUrl(id))).html) ?? [];
    } catch {
      continue; // 読めなかった馬は記録しない（次回また読む）
    }
    // 成績表は新しい順。いちばん古い日付のレースがデビュー戦
    const debut = [...results].sort((a, b) => a.race_date.localeCompare(b.race_date))[0];
    if (!debut) {
      progress.horses[id] = today;
      continue;
    }
    if (!debut.jockey) continue; // 騎手が読めなかったときも次回また読む
    progress.horses[id] = [debut.jockey, debut.finish ?? null];
    newlyDebuted += 1;
  }
  saveProgress(progress);

  const jockeys = aggregate(ids, progress.horses);
  const debuted = ids.filter((id) => Array.isArray(progress.horses[id])).length;
  const covered = ids.filter((id) => progress.horses[id] !== undefined).length;
  writeFileSync(OUT, JSON.stringify({ generated_at: new Date().toISOString(), season_crop: crop, jockeys }, null, 1));
  console.log(
    `今回 ${done}頭を確認（新たにデビュー戦がわかった馬 ${newlyDebuted}頭）。` +
      `確認済み ${covered}/${ids.length}頭・デビュー済み${debuted}頭・騎手${Object.keys(jockeys).length}人を ${OUT} に保存しました`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

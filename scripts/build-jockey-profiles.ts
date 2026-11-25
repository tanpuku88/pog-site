// 騎手の「デビュー戦での成績」を netkeiba から集めて src/data/jockey-profiles.json に保存する。
// 今の世代（2歳）の全頭について成績表を読み、いちばん古いレース＝デビュー戦の騎手を集計する。
// 新馬戦の狙い目スコア（第2段階）で「新馬戦に強い騎手」を見るための材料。
// 頭数が多いので時間予算の範囲で処理し、終わらなければ読みかけの位置（progress）を保存して、
// 次の実行で続きから読む。全頭を読み終えたら表示用の jockeys を入れ替える。
//   npm run build:jockeys
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { adminDb } from "./db";
import { politeFetch, horseResultUrl } from "../src/lib/netkeiba/fetch";
import { parseRaceResults } from "../src/lib/netkeiba/parse";
import { defaultSeason } from "../src/lib/standings";
import type { JockeyData } from "../src/lib/jockey-data";

const OUT = "src/data/jockey-profiles.json";
const TIME_BUDGET_MIN = Number(process.env.TIME_BUDGET_MIN ?? 240);

type Progress = { cursor: string; jockeys: Record<string, JockeyData>; debuted: number; started_at: string };
type OutFile = {
  generated_at: string | null;
  season_crop: number | null;
  /** jockeys が全頭を読み終えた集計なら true（途中までの集計なら false） */
  complete?: boolean;
  jockeys: Record<string, JockeyData>;
  /** 読みかけの集計。次の実行はここ（cursor の次の馬）から続ける */
  progress?: Progress | null;
};

function readPrev(): OutFile | null {
  if (!existsSync(OUT)) return null;
  try {
    return JSON.parse(readFileSync(OUT, "utf8")) as OutFile;
  } catch {
    return null;
  }
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

  // 前回の読みかけがあれば続きから。世代が変わっていたら最初から
  const prev = readPrev();
  const sameSeason = prev?.season_crop === crop;
  const resume = sameSeason && prev?.progress ? prev.progress : null;
  const agg = new Map<string, JockeyData>(Object.entries(resume?.jockeys ?? {}));
  let debuted = resume?.debuted ?? 0;
  const startedAt = resume?.started_at ?? new Date().toISOString();
  // ids は id 順。cursor より後ろの馬から読む
  const todo = resume ? ids.filter((id) => id > resume.cursor) : ids;
  console.log(
    resume
      ? `${crop}年生まれ ${ids.length}頭のうち、前回の続き（${resume.cursor}の次）から残り${todo.length}頭を集計します`
      : `${crop}年生まれ ${ids.length}頭のデビュー戦を最初から集計します`,
  );

  const deadline = Date.now() + TIME_BUDGET_MIN * 60_000;
  let done = 0;
  let cursor: string | null = resume?.cursor ?? null;
  let finished = true;
  for (const id of todo) {
    if (Date.now() > deadline) {
      finished = false;
      console.warn(`時間予算に達したため、残り${todo.length - done}頭は次回に続けます`);
      break;
    }
    done += 1;
    cursor = id;
    if (done % 200 === 0) console.log(`  ${done}/${todo.length}頭…`);
    let results;
    try {
      results = parseRaceResults((await politeFetch(horseResultUrl(id))).html) ?? [];
    } catch {
      continue;
    }
    if (results.length === 0) continue;
    // 成績表は新しい順。いちばん古い日付のレースがデビュー戦
    const debut = [...results].sort((a, b) => a.race_date.localeCompare(b.race_date))[0];
    if (!debut.jockey) continue;
    debuted += 1;
    const cur = agg.get(debut.jockey) ?? { debutRides: 0, debutWins: 0, debutPlaces: 0 };
    cur.debutRides += 1;
    if (debut.finish === "1") cur.debutWins += 1;
    if (debut.finish && ["1", "2", "3"].includes(debut.finish)) cur.debutPlaces += 1;
    agg.set(debut.jockey, cur);
  }

  const sorted = Object.fromEntries([...agg.entries()].sort((a, b) => b[1].debutRides - a[1].debutRides));
  let out: OutFile;
  if (finished) {
    // 全頭を読み終えた → 表示用の集計を入れ替え、次回はまた最初から
    out = { generated_at: new Date().toISOString(), season_crop: crop, complete: true, jockeys: sorted, progress: null };
    console.log(`全頭を読み終えました。デビュー済み${debuted}頭・騎手${agg.size}人を ${OUT} に保存しました`);
  } else {
    // 読みかけ → 前回の全頭集計があればそれを表示し続ける。まだ無ければ途中までの集計を表示する
    const keepPrev = sameSeason && prev?.complete && prev.jockeys && Object.keys(prev.jockeys).length > 0;
    out = {
      generated_at: keepPrev ? prev!.generated_at : new Date().toISOString(),
      season_crop: crop,
      complete: Boolean(keepPrev),
      jockeys: keepPrev ? prev!.jockeys : sorted,
      progress: { cursor: cursor!, jockeys: sorted, debuted, started_at: startedAt },
    };
    console.log(`途中まで（${cursor}まで）の集計を保存しました。デビュー済み${debuted}頭・騎手${agg.size}人`);
  }
  writeFileSync(OUT, JSON.stringify(out, null, 1));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

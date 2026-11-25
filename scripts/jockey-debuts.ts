// 騎手のデビュー戦集計（scripts/build-jockey-profiles.ts）の「続きから再開」用の記録の扱い。
// テストしやすいよう、ネットやDBに触らない部分だけをここに置く。
import { existsSync, readFileSync } from "node:fs";
import type { JockeyData } from "../src/lib/jockey-data";

/** デビュー済み: [騎手, 着順]。未デビュー: 確認した日（YYYY-MM-DD） */
export type DebutEntry = [jockey: string, finish: string | null] | string;
export type Progress = { season_crop: number; updated_at: string | null; horses: Record<string, DebutEntry> };

export function loadProgress(path: string, crop: number): Progress {
  if (existsSync(path)) {
    try {
      const p = JSON.parse(readFileSync(path, "utf8")) as Progress;
      // 世代が替わったら最初から
      if (p.season_crop === crop && p.horses) return p;
    } catch {
      /* 壊れていたら最初から */
    }
  }
  return { season_crop: crop, updated_at: null, horses: {} };
}

/** 読む順番: 未確認の馬 → 未デビューだった馬（確認日が古い順）。デビュー済みは読まない */
export function planOrder(ids: string[], horses: Record<string, DebutEntry>): string[] {
  const unseen: string[] = [];
  const recheck: { id: string; checked: string }[] = [];
  for (const id of ids) {
    const e = horses[id];
    if (e === undefined) unseen.push(id);
    else if (typeof e === "string") recheck.push({ id, checked: e });
  }
  recheck.sort((a, b) => a.checked.localeCompare(b.checked));
  return [...unseen, ...recheck.map((r) => r.id)];
}

/** 記録済みの全頭（今の世代にいる馬だけ）から騎手ごとの成績を作る */
export function aggregate(ids: string[], horses: Record<string, DebutEntry>): Record<string, JockeyData> {
  const agg = new Map<string, JockeyData>();
  for (const id of ids) {
    const e = horses[id];
    if (!Array.isArray(e)) continue;
    const [jockey, finish] = e;
    const cur = agg.get(jockey) ?? { debutRides: 0, debutWins: 0, debutPlaces: 0 };
    cur.debutRides += 1;
    if (finish === "1") cur.debutWins += 1;
    if (finish && ["1", "2", "3"].includes(finish)) cur.debutPlaces += 1;
    agg.set(jockey, cur);
  }
  return Object.fromEntries([...agg.entries()].sort((a, b) => b[1].debutRides - a[1].debutRides));
}

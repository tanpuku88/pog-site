// 指名馬一覧の表に出す数字（データベースに依存しない計算）

type R = { finish: string | null; is_jra: boolean; race_name: string; prize_man: number };

/** [1着, 2着, 3着, 着外] の回数 */
export function finishCounts(races: R[]): [number, number, number, number] {
  const c: [number, number, number, number] = [0, 0, 0, 0];
  for (const r of races) {
    const n = Number(r.finish);
    if (n === 1 || n === 2 || n === 3) c[n - 1]++;
    else c[3]++;
  }
  return c;
}

/**
 * 収得賞金の目安（万円）。中央のレースだけを数える。
 * 新馬・未勝利の勝ちは400万円、それ以外の勝ちと重賞2着は本賞金の半額を足す。
 */
export function earnedPrize(races: R[]): number {
  let total = 0;
  for (const r of races) {
    if (!r.is_jra) continue;
    const n = Number(r.finish);
    if (n === 1) {
      total += /新馬|未勝利/.test(r.race_name) ? 400 : Math.round(r.prize_man / 2);
    } else if (n === 2 && /G[1-3Ⅰ-Ⅲ]|\(G|重賞|J・?G/.test(r.race_name)) {
      total += Math.round(r.prize_man / 2);
    }
  }
  return total;
}

const AREA_MARK: Record<string, string> = { 東: "美浦", 西: "栗東", 地: "地方", 外: "海外" };

/** 「須貝尚介 (栗東)」「[東] 木村哲也」→ 名前と所属に分ける */
export function splitTrainer(trainer: string | null | undefined): { name: string; area: string } {
  if (!trainer) return { name: "", area: "" };
  const mark = trainer.match(/[[［【]\s*([東西地外])\s*[\]］】]/)?.[1];
  const area = trainer.match(/栗東|美浦|地方|海外/)?.[0] ?? (mark ? AREA_MARK[mark] : "");
  const name = trainer
    .replace(/[[［【]\s*[東西地外]\s*[\]］】]/g, "")
    .replace(/栗東|美浦|地方|海外/g, "")
    .replace(/[()（）]/g, "")
    .trim();
  return { name, area };
}

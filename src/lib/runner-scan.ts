// 2歳馬の出走馬を開催日ごとに集めるための計算（ネットにはつながない純粋な関数）。

/** from〜to（YYYY-MM-DD）の日付を新しい順に並べる。新しい日から読むと、同じ馬を何度も読まずに済む */
export function datesNewestFirst(from: string, to: string): string[] {
  const out: string[] = [];
  const end = Date.parse(`${from}T00:00:00Z`);
  for (let t = Date.parse(`${to}T00:00:00Z`); t >= end; t -= 86400_000) out.push(new Date(t).toISOString().slice(0, 10));
  return out;
}

/** その世代（生まれ年）の馬IDか。netkeiba の馬IDは生まれ年で始まる */
export const isCropId = (id: string, cropYear: number) => id.startsWith(String(cropYear)) && /^\d{10}$/.test(id);

/**
 * レースの後に成績を読み直したか。
 * レース当日の夜に読んだ分は、翌日もう一度読む（netkeiba の反映が遅れることがあるため）。
 */
export function fetchedAfterRace(fetchedAt: string | null, raceDate: string): boolean {
  if (!fetchedAt) return false;
  // レース日の翌日0時（日本時間）＝ レース日の15時（UTC）
  return Date.parse(fetchedAt) >= Date.parse(`${raceDate}T15:00:00Z`);
}

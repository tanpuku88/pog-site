// 世代の馬を「馬IDの番号順」に調べるための計算。
// netkeiba の馬IDは「生まれ年4桁 + 1 + 5桁の通し番号」（例: 2024100001）。
// 一覧ページの年齢の絞り込みが効かないため、番号を1つずつ確かめる。

export const cropIdFirst = (cropYear: number) => `${cropYear}100001`;
export const cropIdUpper = (cropYear: number) => `${cropYear}200000`; // これ未満が対象

/** 前回どこまで調べたかから、次に調べるIDの番号を返す */
export function nextScanNumber(cropYear: number, lastId: string | null): number {
  const first = Number(cropIdFirst(cropYear));
  if (!lastId || !lastId.startsWith(String(cropYear))) return first;
  return Math.max(first, Number(lastId) + 1);
}

/** 連続して空き番号が続いたら、その世代の最後まで来たと見なす */
export function reachedEnd(consecutiveMisses: number, limit: number): boolean {
  return consecutiveMisses >= limit;
}

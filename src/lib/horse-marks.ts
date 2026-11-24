// 馬名の横に出す小さなアイコン（地方・指名・済・人気）の判定。
// 画面ではこの結果を HorseLabel / MarkBadges に渡して表示する。

/** 地方競馬の競馬場（調教師の所属に出てくる名前） */
const NAR_TRACKS = ["門別", "札幌", "盛岡", "水沢", "浦和", "船橋", "大井", "川崎", "金沢", "笠松", "名古屋", "園田", "姫路", "高知", "佐賀", "帯広", "北海道", "ホッカイドウ", "岩手", "南関", "兵庫", "愛知", "岐阜", "石川"];
const CENTRAL = /美浦|栗東/;

/** 地方所属の馬か（調教師の所属で判定。「[地] 〇〇」「〇〇 (地方)」「〇〇 (大井)」など） */
export function isLocalHorse(trainer: string | null | undefined): boolean {
  if (!trainer) return false;
  if (/[[［【]\s*地\s*[\]］】]/.test(trainer) || /地方/.test(trainer)) return true;
  if (CENTRAL.test(trainer) || /[[［【]\s*[東西外]\s*[\]］】]/.test(trainer)) return false;
  const area = trainer.match(/[(（]([^)）]+)[)）]\s*$/)?.[1]?.trim();
  return !!area && NAR_TRACKS.some((t) => area.startsWith(t));
}

/** 人気馬：全大会の指名数ランキングでこの順位以内 */
export const POPULAR_TOP = 30;
/** 人気馬：最低これだけの大会で指名されていること */
export const POPULAR_MIN_PICKS = 3;

/** 指名数から人気馬を選ぶ（上位30位以内（同数は同順位）かつ3大会以上で指名） */
export function popularIds(counts: Map<string, number>, top = POPULAR_TOP, min = POPULAR_MIN_PICKS): Set<string> {
  const sorted = [...counts.entries()].filter(([, n]) => n >= min).sort((a, b) => b[1] - a[1]);
  const out = new Set<string>();
  let rank = 0;
  let prev = -1;
  sorted.forEach(([id, n], i) => {
    if (n !== prev) rank = i + 1;
    prev = n;
    if (rank <= top) out.add(id);
  });
  return out;
}

export type HorseMarks = {
  /** ログイン中の人が（どれかの大会で）指名している馬 */
  mine?: Set<string>;
  /** この大会でほかの人が指名済みの馬 */
  taken?: Set<string>;
  /** 人気馬 */
  popular?: Set<string>;
};

export type MarkKind = "local" | "mine" | "taken" | "popular";

/** 1頭に付くアイコンの一覧（表示順） */
export function marksFor(id: string, trainer: string | null | undefined, marks?: HorseMarks): MarkKind[] {
  const out: MarkKind[] = [];
  if (isLocalHorse(trainer)) out.push("local");
  if (marks?.mine?.has(id)) out.push("mine");
  else if (marks?.taken?.has(id)) out.push("taken");
  if (marks?.popular?.has(id)) out.push("popular");
  return out;
}

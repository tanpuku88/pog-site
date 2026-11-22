// セリの落札価格・一口クラブの募集総額と、今シーズンの本賞金を比べた「回収率」。
// 回収率 ＝ 本賞金 ÷ 価格 × 100（%）。本賞金だけで計算した目安で、出走手当や付加賞は入っていない。
import type { GroupField, SireHorse } from "./sires";

type Tally = Map<string, { points: number; starts: number; wins: number }>;
export type PriceKind = "sale" | "club";

export const priceOf = (h: SireHorse, kind: PriceKind) => {
  const v = kind === "sale" ? h.sale_price_man : h.club_price_man;
  return v != null && Number(v) > 0 ? Number(v) : null;
};

export const returnRate = (prize: number, price: number | null) =>
  price && price > 0 ? Math.round((prize / price) * 1000) / 10 : null;

export type SaleHorseRow = { h: SireHorse; price: number; prize: number; starts: number; wins: number; rate: number | null };

/** 価格のある馬の一覧（賞金と回収率つき） */
export function pricedHorses(horses: SireHorse[], tally: Tally, kind: PriceKind): SaleHorseRow[] {
  const out: SaleHorseRow[] = [];
  for (const h of horses) {
    const price = priceOf(h, kind);
    if (!price) continue;
    const t = tally.get(h.id) ?? { points: 0, starts: 0, wins: 0 };
    out.push({ h, price, prize: t.points, starts: t.starts, wins: t.wins, rate: returnRate(t.points, price) });
  }
  return out;
}

export type SaleGroupRow = {
  name: string; count: number; total: number; avg: number; prize: number; rate: number | null;
  winners: number; starters: number; best: SaleHorseRow | null;
};

/** 種牡馬・セリの名前・馬主などごとに、頭数・合計価格・平均価格・本賞金・回収率をまとめる */
export function aggregatePrices(rows: SaleHorseRow[], keyOf: (h: SireHorse) => string | null | undefined): SaleGroupRow[] {
  const m = new Map<string, SaleGroupRow>();
  for (const r of rows) {
    const key = keyOf(r.h);
    if (!key) continue;
    const g = m.get(key) ?? { name: key, count: 0, total: 0, avg: 0, prize: 0, rate: null, winners: 0, starters: 0, best: null };
    g.count += 1;
    g.total += r.price;
    g.prize += r.prize;
    if (r.starts > 0) g.starters += 1;
    if (r.wins > 0) g.winners += 1;
    if (r.prize > 0 && (!g.best || (r.rate ?? 0) > (g.best.rate ?? 0))) g.best = r;
    m.set(key, g);
  }
  return [...m.values()].map((g) => ({
    ...g,
    total: Math.round(g.total * 10) / 10,
    prize: Math.round(g.prize * 10) / 10,
    avg: Math.round((g.total / g.count) * 10) / 10,
    rate: returnRate(g.prize, g.total),
  }));
}

export const fieldKey = (field: GroupField) => (h: SireHorse) => h[field] ?? null;

/** 「1億5,400万」のように表示する（万円単位の数値から） */
export function formatPrice(man: number): string {
  const oku = Math.floor(man / 10000);
  const rest = Math.round(man - oku * 10000);
  if (oku > 0) return rest > 0 ? `${oku}億${rest.toLocaleString("ja-JP")}万` : `${oku}億`;
  return `${Math.round(man * 10) / 10 >= 1 ? Math.round(man).toLocaleString("ja-JP") : man}万`;
}

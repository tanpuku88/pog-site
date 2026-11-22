import { describe, expect, it } from "vitest";
import { aggregatePrices, fieldKey, formatPrice, pricedHorses, returnRate } from "../src/lib/sales";
import { commentKey, dataComment, writtenComment } from "../src/lib/comments";

const h = (id: string, sire: string, sale: number | null, club: number | null = null) =>
  ({ id, name: `馬${id}`, sex: "牡", sire, dam: null, damsire: null, trainer: "T", owner: "O", breeder: "B", sale_price_man: sale, sale_name: "セレクトセール", club_price_man: club });

describe("セリの回収率", () => {
  const horses = [h("1", "A", 5000), h("2", "A", 1000), h("3", "B", null, 2000), h("4", "B", 300)];
  const tally = new Map([["1", { points: 2000, starts: 3, wins: 1 }], ["2", { points: 1500, starts: 2, wins: 1 }], ["4", { points: 0, starts: 1, wins: 0 }]]);

  it("価格のある馬だけ、本賞金÷価格で回収率を出す", () => {
    const rows = pricedHorses(horses, tally, "sale");
    expect(rows.map((r) => r.h.id)).toEqual(["1", "2", "4"]);
    expect(rows[1].rate).toBe(150);
    expect(pricedHorses(horses, tally, "club").map((r) => r.h.id)).toEqual(["3"]);
  });

  it("種牡馬ごとに合計・平均・回収率をまとめる", () => {
    const g = aggregatePrices(pricedHorses(horses, tally, "sale"), fieldKey("sire"));
    expect(g.find((x) => x.name === "A")).toMatchObject({ count: 2, total: 6000, avg: 3000, prize: 3500, rate: 58.3, winners: 2 });
    expect(g.find((x) => x.name === "A")!.best!.h.id).toBe("2");
  });

  it("価格がなければ回収率なし、表示は億・万", () => {
    expect(returnRate(100, null)).toBeNull();
    expect(formatPrice(15400)).toBe("1億5,400万");
    expect(formatPrice(330)).toBe("330万");
    expect(formatPrice(20000)).toBe("2億");
  });
});

describe("ひとこと", () => {
  it("厩舎の所属や(有)を外して手書きコメントを探す", () => {
    expect(commentKey("友道康夫 (栗東)")).toBe("友道康夫");
    expect(commentKey("(有)サンデーレーシング")).toBe("サンデーレーシング");
    expect(commentKey("金子真人ホールディングス(株)")).toBe("金子真人ホールディングス");
    expect(writtenComment("trainer", "中内田充正 (栗東)")?.text).toContain("仕上げ");
    expect(writtenComment("owner", "無名の馬主")).toBeNull();
  });

  it("データから文章を作る（全体より高い勝ち上がり率）", () => {
    const t = dataComment("trainer", "厩舎", { horses: 20, starters: 10, winners: 5, points: 3000, topName: "テスト", avgRate: 30, prevStarters: 0, prevWinners: 0 });
    expect(t).toContain("乗っている");
    expect(t).toContain("稼ぎ頭はテスト");
  });

  it("まだ誰もデビューしていない", () => {
    expect(dataComment("owner", "馬主", { horses: 3, starters: 0, winners: 0, points: 0, topName: null, avgRate: 30, prevStarters: 0, prevWinners: 0 })).toContain("デビューした馬はいません");
  });
});

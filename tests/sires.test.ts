import { describe, it, expect } from "vitest";
import { aggregateSires } from "../src/lib/sires";

describe("種牡馬の集計", () => {
  it("産駒数・指名数・勝ち上がり・賞金・稼ぎ頭をまとめる", () => {
    const h = (id: string, sire: string | null) => ({ id, name: `馬${id}`, sex: null, sire, dam: null, damsire: null, trainer: null });
    const rows = aggregateSires(
      [h("a", "キタサンブラック"), h("b", "キタサンブラック"), h("c", "キタサンブラック"), h("d", "エピファネイア"), h("e", null)],
      new Map([["a", 3], ["b", 1], ["d", 2]]),
      new Map([
        ["a", { points: 700, starts: 2, wins: 1 }],
        ["b", { points: 1200.5, starts: 3, wins: 2 }],
        ["c", { points: 0, starts: 1, wins: 0 }],
      ]),
    );
    const k = rows.find((r) => r.sire === "キタサンブラック")!;
    expect(k).toEqual({ sire: "キタサンブラック", horses: 3, picks: 4, starters: 3, winners: 2, points: 1900.5, top: { id: "b", name: "馬b", points: 1200.5 } });
    expect(rows.find((r) => r.sire === "エピファネイア")).toMatchObject({ horses: 1, picks: 2, starters: 0, winners: 0, points: 0, top: null });
    expect(rows).toHaveLength(2);
  });
});

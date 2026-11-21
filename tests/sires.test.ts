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

import { sireTable } from "../src/lib/sires";

describe("種牡馬の詳しい表", () => {
  it("戦績・勝率・収得賞金・先週・AEI・順位変動", () => {
    const h = (id: string, sire: string, sex = "牡") => ({ id, name: `馬${id}`, sex, sire, dam: null, damsire: null, trainer: null });
    const horses = [h("a", "A"), h("b", "A", "牝"), h("c", "B"), h("d", "B")];
    const races = [
      { horse_id: "a", race_date: "2026-10-01", race_name: "2歳新馬", finish: "1", prize_man: 700, is_jra: true },
      { horse_id: "b", race_date: "2026-10-02", race_name: "2歳未勝利", finish: "5", prize_man: 0, is_jra: true },
      { horse_id: "c", race_date: "2026-11-15", race_name: "2歳未勝利", finish: "1", prize_man: 550, is_jra: true },
      { horse_id: "d", race_date: "2026-11-16", race_name: "2歳新馬", finish: "1", prize_man: 700, is_jra: true },
    ];
    const tally = new Map([
      ["a", { points: 700, starts: 1, wins: 1 }], ["b", { points: 0, starts: 1, wins: 0 }],
      ["c", { points: 550, starts: 1, wins: 1 }], ["d", { points: 700, starts: 1, wins: 1 }],
    ]);
    const rows = sireTable(horses, new Map(), tally, races, "2026-11-21");
    const [b, a] = rows;
    expect(b).toMatchObject({ sire: "B", rank: 1, runs: 2, record: [2, 0, 0, 0], winRate: 100, earned: 800, lastWeek: 1250, change: 1 });
    expect(a).toMatchObject({ sire: "A", rank: 2, runs: 2, record: [1, 0, 0, 1], winRate: 50, earned: 400, lastWeek: 0, change: 0, topSex: "牡" });
    // 全体の1出走頭数あたり賞金 = 1950/4 = 487.5、A=350 → 0.72、B=625 → 1.28
    expect(a.aei).toBe(0.72);
    expect(b.aei).toBe(1.28);
  });
});

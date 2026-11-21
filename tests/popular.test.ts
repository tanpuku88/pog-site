import { describe, it, expect } from "vitest";
import { withRanks, countPicks, tallyResults } from "../src/lib/popular";

describe("人気馬・賞金ランキング", () => {
  it("指名数を数える", () => {
    expect([...countPicks(["a", "b", "a", "c", "a", "b"])]).toEqual([["a", 3], ["b", 2], ["c", 1]]);
  });

  it("同点は同じ順位にする", () => {
    const r = withRanks([{ v: 5 }, { v: 3 }, { v: 3 }, { v: 1 }], (x) => x.v).map((x) => x.rank);
    expect(r).toEqual([1, 2, 2, 4]);
  });

  it("ルールの期間・JRAのみで賞金を数える", () => {
    const rules = { season_start: "2026-06-01", season_end: "2027-05-30", include_non_jra: false };
    const t = tallyResults([
      { horse_id: "a", race_date: "2026-07-01", prize_man: 700, is_jra: true, finish: "1" },
      { horse_id: "a", race_date: "2026-08-01", prize_man: 280.4, is_jra: true, finish: "2" },
      { horse_id: "a", race_date: "2026-09-01", prize_man: 100, is_jra: false, finish: "1" },
      { horse_id: "b", race_date: "2026-05-01", prize_man: 500, is_jra: true, finish: "1" },
    ], rules);
    expect(t.get("a")).toEqual({ points: 980.4, starts: 2, wins: 1 });
    expect(t.has("b")).toBe(false);
  });
});

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

import { countPicksWithWeek, rankBoard, risingHorses, popularSires } from "../src/lib/popular";

describe("人気馬30傑：前週比・牡牝・種牡馬", () => {
  const now = new Date("2026-11-21T12:00:00Z");
  const old = "2026-11-01T00:00:00Z";
  const recent = "2026-11-20T00:00:00Z";
  const h = (id: string, sex: string, sire: string) => ({ id, name: id, sex, sire, birth_year: 2024, dam: null, damsire: null, trainer: null, results_fetched_at: null });
  const counts = countPicksWithWeek([
    { horse_id: "a", created_at: old }, { horse_id: "a", created_at: old },
    { horse_id: "b", created_at: old }, { horse_id: "b", created_at: recent }, { horse_id: "b", created_at: recent },
    { horse_id: "c", created_at: recent },
  ], now);
  const horses = [h("a", "牡", "キタサンブラック"), h("b", "牝", "キタサンブラック"), h("c", "セ", "エピファネイア")];
  const rows = horses.map((horse) => ({ horse, ...counts.get(horse.id)!, points: horse.id === "c" ? 500 : 0, starts: 0, wins: 0 }));

  it("今と7日前の指名数を分けて数える", () => {
    expect(counts.get("b")).toEqual({ picks: 3, prevPicks: 1, weekPicks: 2 });
  });

  it("指名数順に並べ、前週の順位をつける（初登場は null）", () => {
    const r = rankBoard(rows);
    expect(r.map((x) => [x.horse.id, x.rank, x.prevRank])).toEqual([["b", 1, 2], ["a", 2, 1], ["c", 3, null]]);
  });

  it("牡馬にはセン馬も含め、牝馬だけでも順位をつけ直す", () => {
    expect(rankBoard(rows, { sex: "牡" }).map((x) => x.horse.id)).toEqual(["a", "c"]);
    expect(rankBoard(rows, { sex: "牝" }).map((x) => [x.horse.id, x.rank, x.prevRank])).toEqual([["b", 1, 1]]);
  });

  it("賞金順は賞金のある馬だけ", () => {
    expect(rankBoard(rows, { sort: "prize" }).map((x) => x.horse.id)).toEqual(["c"]);
  });

  it("急上昇と人気の種牡馬", () => {
    expect(risingHorses(rows).map((x) => [x.horse.id, x.weekPicks])).toEqual([["b", 2], ["c", 1]]);
    expect(popularSires(rows).map((x) => [x.sire, x.picks, x.horses, x.top.horse.id])).toEqual([["キタサンブラック", 5, 2, "b"], ["エピファネイア", 1, 1, "c"]]);
  });
});

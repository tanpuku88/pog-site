import { describe, expect, it } from "vitest";
import { sireAptitudes, sireStory, uniqueNicknames } from "../src/lib/meikan";
import type { Profile } from "../src/lib/profile";
import type { SireData } from "../src/lib/sire-data";

const prof = (name: string, points = 0, top: string | null = null): Profile => ({
  m: { name, horses: 5, starters: 3, winners: 1, runs: 6, wins: 1, points, turfRuns: 0, turfWins: 0, dirtRuns: 0, dirtWins: 0, placeDist: null, earlyWins: 0, top: top ? { id: "1", name: top, points } : null },
  winRate: 16, scores: { early: 50, consistency: 50, power: 50, turf: null, dirt: null }, distance: null,
});
const sd = (over: Partial<SireData>): SireData => ({ id: "x", offspring: null, career: null, fetchedAt: "2026-11-22T00:00:00Z", ...over });

describe("名鑑の二つ名", () => {
  it("手書きがあればそれ、女性調教師も", () => {
    const m = uniqueNicknames("trainer", new Map([["前川恭子 (栗東)", prof("前川恭子 (栗東)")]]));
    expect(m.get("前川恭子 (栗東)")).toBe("栗東のジャンヌ・ダルク");
  });
  it("同じ二つ名にならない", () => {
    const m = uniqueNicknames("trainer", new Map([["A (美浦)", prof("A (美浦)")], ["B (美浦)", prof("B (美浦)")]]));
    expect(new Set(m.values()).size).toBe(2);
  });
  it("種牡馬はG1の年とレース名から", () => {
    const sires = { テスト: sd({ career: { runs: 5, wins: 3, places: 4, turfRuns: 5, dirtRuns: 0, avgWinDist: 2000, firstYear: 2019, lastYear: 2020, bigWins: [{ year: 2020, race: "天皇賞(秋)", grade: 1, surface: "芝", distance: 2000 }] } }) };
    const m = uniqueNicknames("sire", new Map([["テスト", prof("テスト")]]), sires, sireAptitudes(sires));
    expect(m.get("テスト")).toBe("2020年天皇賞(秋)の覇者");
  });
});

describe("産駒の特徴", () => {
  it("芝・ダートの割合と距離を書く", () => {
    const d = sd({ offspring: { starters: 100, winners: 45, runs: 1000, wins: 120, gradedRuns: 10, gradedWins: 2, turfRuns: 200, turfWins: 10, dirtRuns: 780, dirtWins: 110, winnerRate: 45, ei: 1.1, prize: 1, avgDistTurf: 1400, avgDistDirt: 1500, best: "ダイヒョウ" } });
    const s = sireStory(d, sireAptitudes({ t: d }).get("t"));
    expect(s.traits.join("")).toContain("ダート型");
    expect(s.traits.join("")).toContain("ダート1,500m");
    expect(s.traits.join("")).toContain("ダイヒョウ");
  });
});

import { describe, expect, it } from "vitest";
import { filterArea, trainerArea } from "../src/lib/area";
import { scoreProfiles, statValue, STAT_KEYS, type Metrics } from "../src/lib/profile";

describe("中央・地方の分け方", () => {
  it("美浦・栗東は中央、ほかの所属は地方", () => {
    expect(trainerArea("木村哲也 (美浦)")).toBe("jra");
    expect(trainerArea("[西] 友道康夫")).toBe("jra");
    expect(trainerArea("荒山勝徳 (大井)")).toBe("nar");
    expect(trainerArea("[地] 山田太郎")).toBe("nar");
    expect(trainerArea(null)).toBe("jra");
    expect(filterArea([{ trainer: "a (栗東)" }, { trainer: "b (船橋)" }], "nar")).toEqual([{ trainer: "b (船橋)" }]);
  });
  it("地方は芝・ダートの代わりに堅実さ・タフさ", () => {
    expect(STAT_KEYS.jra).toContain("turf");
    expect(STAT_KEYS.nar).toEqual(["early", "consistency", "power", "place", "tough"]);
  });
  it("稼ぐ力は出走馬1頭あたりの本賞金で、元の数字も出せる", () => {
    const m = (name: string, points: number): Metrics => ({ name, horses: 4, starters: 4, winners: 1, runs: 12, wins: 1, places: 4, points,
      turfRuns: 0, turfWins: 0, dirtRuns: 0, dirtWins: 0, placeDist: null, earlyWins: 0, top: null });
    const p = scoreProfiles(new Map([["A", m("A", 400)], ["B", m("B", 4000)]]));
    expect(p.get("B")!.scores.power).toBeGreaterThan(p.get("A")!.scores.power!);
    expect(statValue("power", m("B", 4000))).toBe("1頭あたり1,000万円");
    expect(statValue("tough", m("B", 4000))).toBe("1頭あたり3.0戦");
    expect(statValue("place", m("B", 4000))).toBe("33.3%（12戦）");
  });
});

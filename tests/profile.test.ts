import { describe, expect, it } from "vitest";
import { computeMetrics, distanceLabel, grade, nickname, profileLines, scoreProfiles } from "../src/lib/profile";
import type { SireHorse, SireRace } from "../src/lib/sires";

const horse = (id: string, sire: string): SireHorse => ({ id, name: `馬${id}`, sex: "牡", sire, dam: null, damsire: null, trainer: null } as SireHorse);
const race = (horse_id: string, finish: string, surface: string, distance: number, race_date = "2026-10-10"): SireRace =>
  ({ horse_id, race_date, race_name: "新馬", finish, prize_man: finish === "1" ? 700 : 0, is_jra: true, surface, distance });

describe("名鑑の能力値", () => {
  const horses: SireHorse[] = [];
  const races: SireRace[] = [];
  const tally = new Map<string, { points: number; starts: number; wins: number }>();
  // A: ダートでよく勝つ / B: 芝で少し / C〜F: 平凡
  ["A", "B", "C", "D", "E", "F"].forEach((s, si) => {
    for (let i = 0; i < 6; i++) {
      const id = `${s}${i}`;
      horses.push(horse(id, s));
      const isWinner = s === "A" ? i < 4 : s === "B" ? i < 2 : i < 1;
      const surface = s === "A" ? "ダ" : "芝";
      for (let k = 0; k < 2; k++) races.push(race(id, isWinner && k === 0 ? "1" : "5", surface, 1200 + si * 200, si === 0 ? "2026-07-10" : "2026-11-01"));
      tally.set(id, { points: isWinner ? 700 : 0, starts: 2, wins: isWinner ? 1 : 0 });
    }
  });
  const m = computeMetrics(horses, tally, races, "sire");
  const p = scoreProfiles(m);

  it("数を数える", () => {
    const a = m.get("A")!;
    expect(a).toMatchObject({ horses: 6, starters: 6, winners: 4, runs: 12, wins: 4, dirtRuns: 12, dirtWins: 4, earlyWins: 4 });
    expect(a.placeDist).toBe(1200);
  });
  it("一番勝っているところが上位", () => {
    expect(p.get("A")!.scores.consistency).toBe(100);
    expect(p.get("A")!.scores.turf).toBeNull(); // 芝は走っていない
    expect(p.get("A")!.winRate).toBeCloseTo(33.3, 1);
    expect(grade(p.get("A")!.scores.consistency)).toBe("S");
  });
  it("二つ名と紹介文", () => {
    expect(nickname("sire", p.get("A")!)).toMatch(/\S/);
    const lines = profileLines("sire", "種牡馬", p.get("A")!, 15);
    expect(lines.join("")).toContain("ダートを主戦場に");
    expect(lines.join("")).toContain("短距離");
    expect(lines.join("")).toContain("全体平均を上回る");
  });
  it("距離の呼び方", () => {
    expect(distanceLabel(1200)).toBe("短距離");
    expect(distanceLabel(1600)).toBe("マイル");
    expect(distanceLabel(2000)).toBe("中距離");
    expect(distanceLabel(2400)).toBe("長距離");
    expect(distanceLabel(null)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";
import { rankShinbaRace, scoreShinbaHorse, shinbaHighlights, winnerRateScore, type ShinbaFactors } from "../src/lib/shinba-picks";

const base: ShinbaFactors = {
  sireWinnerRate: null, sireName: "テスト父",
  damsireWinnerRate: null, damsireName: "テスト母父",
  trainerEarly: null, trainerConsistency: null, trainerName: "テスト厩舎",
};

describe("新馬戦の狙い目スコア", () => {
  it("勝ち上がり率の換算", () => {
    expect(winnerRateScore(null)).toBeNull();
    expect(winnerRateScore(10)).toBe(0);
    expect(winnerRateScore(30)).toBe(50);
    expect(winnerRateScore(50)).toBe(100);
    expect(winnerRateScore(90)).toBe(100); // 上限で止まる
  });

  it("材料が無ければスコアなし", () => {
    expect(scoreShinbaHorse(base)).toEqual({ score: null, reasons: [] });
  });

  it("強い材料が揃えば高スコアと根拠が出る", () => {
    const s = scoreShinbaHorse({ ...base, sireWinnerRate: 46, trainerEarly: 90, trainerConsistency: 85, damsireWinnerRate: 40 });
    expect(s.score).toBeGreaterThanOrEqual(80);
    expect(s.reasons.length).toBeGreaterThanOrEqual(1);
    expect(s.reasons.join("")).toContain("勝ち上がり率46.0%");
  });

  it("欠けた項目は重みを付け直す（父だけでもスコアが出る）", () => {
    const s = scoreShinbaHorse({ ...base, sireWinnerRate: 30 });
    expect(s.score).toBe(50);
  });

  it("弱い材料だけでは低スコア", () => {
    const s = scoreShinbaHorse({ ...base, sireWinnerRate: 12, trainerEarly: 20, trainerConsistency: 25 });
    expect(s.score).toBeLessThan(30);
    expect(s.reasons).toEqual([]);
  });

  it("レース内ランキングと狙い目（上位2頭・65以上だけ）", () => {
    const horses = [
      { name: "A", f: { ...base, sireWinnerRate: 48 } },
      { name: "B", f: { ...base, sireWinnerRate: 44 } },
      { name: "C", f: { ...base, sireWinnerRate: 42 } },
      { name: "D", f: { ...base, sireWinnerRate: 20 } },
      { name: "E", f: base },
    ];
    const ranked = rankShinbaRace(horses, (h) => scoreShinbaHorse(h.f));
    expect(ranked.map((r) => r.item.name)).toEqual(["A", "B", "C", "D", "E"]);
    expect(ranked.filter((r) => r.isPick).map((r) => r.item.name)).toEqual(["A", "B"]);
    expect(ranked[4].score.score).toBeNull();
    expect(ranked[4].isPick).toBe(false);
  });

  it("全レースの狙い目はスコア順に絞る", () => {
    const mk = (rate: number) => scoreShinbaHorse({ ...base, sireWinnerRate: rate });
    const races = [
      rankShinbaRace([{ n: "X" }], () => mk(46)),
      rankShinbaRace([{ n: "Y" }], () => mk(50)),
    ];
    const hi = shinbaHighlights(races, 5);
    expect(hi.map((r) => r.item.n)).toEqual(["Y", "X"]);
  });
});

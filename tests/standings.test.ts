import { describe, it, expect } from "vitest";
import { computeStandings, defaultSeason, lastSundayOfMay, isThisWeek } from "../src/lib/standings";
import { normalizeQuery } from "../src/lib/kana";

const rules = { season_start: "2026-06-01", season_end: "2027-05-30", include_non_jra: false };
const R = (horse_id: string, race_date: string, prize_man: number, is_jra = true, finish = "1") =>
  ({ horse_id, race_date, prize_man, is_jra, finish });

describe("ポイント集計", () => {
  const results = [
    R("h1", "2026-07-01", 750),
    R("h1", "2026-11-15", 3800),
    R("h2", "2026-10-01", 200, false),     // 地方: 対象外
    R("h2", "2026-05-31", 999),            // 期間前: 対象外
    R("h3", "2026-11-10", 300, true, "2"),
  ];
  const picks = [
    { user_id: "a", horse_id: "h1" },
    { user_id: "b", horse_id: "h2" },
    { user_id: "b", horse_id: "h3" },
  ];

  it("期間内のJRA本賞金だけを合計して順位をつける", () => {
    const s = computeStandings(["a", "b", "c"], picks, results, rules, "2026-11-18");
    expect(s.map((x) => [x.user_id, x.points, x.rank])).toEqual([["a", 4550, 1], ["b", 300, 2], ["c", 0, 3]]);
    expect(s[0].wins).toBe(2);
    expect(s[0].weekPoints).toBe(3800);
    expect(s[1].weekPoints).toBe(0); // 11/10 は8日前
  });

  it("地方・海外を含める設定にすると加算される", () => {
    const s = computeStandings(["b"], picks, results, { ...rules, include_non_jra: true }, "2026-11-18");
    expect(s[0].points).toBe(500);
  });

  it("同点は同じ順位", () => {
    const s = computeStandings(["x", "y", "z"], [], [], rules, "2026-11-18");
    expect(s.map((m) => m.rank)).toEqual([1, 1, 1]);
  });

  it("小数の丸め", () => {
    const s = computeStandings(["a"], [{ user_id: "a", horse_id: "h" }], [R("h", "2026-07-01", 0.1), R("h", "2026-07-02", 0.2)], rules, "2026-11-18");
    expect(s[0].points).toBe(0.3);
  });
});

describe("シーズンの初期値", () => {
  it("11月なら今年6月〜来年ダービー、2年前生まれ", () => {
    expect(defaultSeason(new Date("2026-11-18T12:00:00+09:00"))).toEqual({
      crop_year: 2024, season_start: "2026-06-01", season_end: "2027-05-30",
    });
  });
  it("3月なら去年6月〜今年ダービー", () => {
    expect(defaultSeason(new Date("2027-03-01T12:00:00+09:00")).crop_year).toBe(2024);
  });
  it("ダービーは5月最終日曜", () => {
    expect(lastSundayOfMay(2026)).toBe("2026-05-31");
    expect(lastSundayOfMay(2027)).toBe("2027-05-30");
  });
  it("今週の判定", () => {
    expect(isThisWeek("2026-11-12", "2026-11-18")).toBe(true);
    expect(isThisWeek("2026-11-11", "2026-11-18")).toBe(false);
    expect(isThisWeek("2026-11-19", "2026-11-18")).toBe(false);
  });
});

describe("検索語の正規化", () => {
  it("ひらがな→カタカナ、全角→半角", () => {
    expect(normalizeQuery(" きたさん ")).toBe("キタサン");
    expect(normalizeQuery("ＡＢＣ")).toBe("ABC");
  });
});

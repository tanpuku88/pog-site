import { describe, it, expect } from "vitest";
import { computeStandings } from "../src/lib/standings";
import { PRESETS, gradeOf, normalizeRules, rulesOf, describeRules, scoreRace, legacyRules } from "../src/lib/group-rules";
import { parseRulesForm } from "../src/lib/rules-form";

const season = { season_start: "2026-06-01", season_end: "2027-05-30" };
const R = (horse_id: string, race_date: string, prize_man: number, finish = "1", race_name = "2歳未勝利", is_jra = true, surface = "芝") =>
  ({ horse_id, race_date, prize_man, is_jra, finish, race_name, surface });
const preset = (id: string) => PRESETS.find((p) => p.id === id)!.rules;

describe("レースの格", () => {
  it("G1・Jpn1・GIなどを読む", () => {
    expect(gradeOf("朝日杯FS(G1)")).toBe("G1");
    expect(gradeOf("京王杯2歳S(G2)")).toBe("G2");
    expect(gradeOf("全日本2歳優駿(Jpn1)")).toBe("G1");
    expect(gradeOf("札幌2歳S(GIII)")).toBe("G3");
    expect(gradeOf("アイビーS(L)")).toBeNull();
    expect(gradeOf("2歳新馬")).toBeNull();
  });
});

describe("ルールごとのポイント", () => {
  const results = [
    R("h1", "2026-07-01", 750, "1", "2歳新馬"),
    R("h1", "2026-12-20", 7000, "1", "朝日杯FS(G1)"),
    R("h2", "2026-10-01", 200, "1", "門別 2歳", false, "ダ"),
    R("h3", "2026-11-10", 300, "2"),
    R("h3", "2026-11-20", 0, "1", "障害未勝利", true, "障"),
  ];
  const picks = [{ user_id: "a", horse_id: "h1" }, { user_id: "b", horse_id: "h2" }, { user_id: "b", horse_id: "h3" }];
  const run = (rules: unknown, nonJra = false) =>
    computeStandings(["a", "b"], picks, results, { ...season, include_non_jra: nonJra, rules, picks_per_member: 10 }, "2027-01-01");

  it("ルールが空なら今までどおり（JRA本賞金の合計）", () => {
    expect(run(null).map((s) => s.points)).toEqual([7750, 300]);
    expect(run(null, true).map((s) => s.points)).toEqual([7750, 500]);
  });

  it("シンプル（賞金だけ）は今までと同じ結果", () => {
    expect(run(preset("simple")).map((s) => s.points)).toEqual(run(null).map((s) => s.points));
  });

  it("定番：地方も数え、G1勝ちに1000万円のボーナス", () => {
    const s = run(preset("standard"));
    expect(s[0].points).toBe(7750 + 1000);
    expect(s[0].horses[0].bonus).toBe(1000);
    expect(s[1].points).toBe(500);
  });

  it("ポイント制：着順で数える", () => {
    const s = run(preset("points"));
    // h1: 10 + (10 + G1 30) = 50 / b: h2 10 + h3 5 + 障害1着 10 = 25
    expect(s.map((x) => x.points)).toEqual([50, 25]);
  });

  it("障害を数えない・地方を半分", () => {
    const r = { ...preset("points"), excludeJump: true, nonJraRate: 50 };
    expect(run(r)[1].points).toBe(5 + 5);
  });

  it("上位N頭の合計", () => {
    const r = { ...legacyRules(true), bestN: 1 };
    expect(run(r)[1].points).toBe(300);
  });

  it("期間外は数えない", () => {
    expect(scoreRace(R("x", "2026-05-01", 100), preset("standard")).points).toBe(100); // scoreRace自体は期間を見ない
    const s = computeStandings(["a"], [{ user_id: "a", horse_id: "x" }], [R("x", "2026-05-01", 100)], { ...season, include_non_jra: true, rules: preset("standard") }, "2027-01-01");
    expect(s[0].points).toBe(0);
  });
});

describe("ルールの読み込み", () => {
  it("おかしい値は直す", () => {
    const r = normalizeRules({ male: 8, female: 8, base: "x", nonJraRate: 500, finishPoints: [1] }, false, 10);
    expect(r.male).toBeNull();
    expect(r.base).toBe("prize");
    expect(r.nonJraRate).toBe(0);
    expect(r.finishPoints).toEqual([1, 0, 0, 0, 0]);
  });
  it("空なら大会の include_non_jra を使う", () => {
    expect(rulesOf({ rules: null, include_non_jra: true }).nonJraRate).toBe(100);
  });
  it("説明文", () => {
    const lines = describeRules({ picks_per_member: 10, crop_year: 2025, season_start: "2027-06-01", season_end: "2028-05-28" }, preset("standard"));
    expect(lines[0]).toBe("2025年生まれ世代・1人10頭（牡馬5頭・牝馬5頭）");
    expect(lines).toContain("重賞勝ちボーナス：G1 +1,000万円・G2 +500万円・G3 +300万円");
    expect(lines).toContain("地方・海外のレースも数える");
  });
});

describe("フォームの読み取り", () => {
  it("牡馬の数から牝馬の数を決め、地方の設定を列にも入れる", () => {
    const f = new FormData();
    for (const [k, v] of Object.entries({ preset: "standard", picks_per_member: "8", sex_split: "on", male: "3", base: "prize", g1: "1000", g2: "500", g3: "300", non_jra_rate: "100", fp1: "10" })) f.set(k, v);
    const out = parseRulesForm(f);
    expect(out.picks_per_member).toBe(8);
    expect(out.rules.male).toBe(3);
    expect(out.rules.female).toBe(5);
    expect(out.include_non_jra).toBe(true);
    expect(out.rules.preset).toBe("standard");
  });
  it("内訳なし・地方なし", () => {
    const f = new FormData();
    f.set("picks_per_member", "10"); f.set("non_jra_rate", "0");
    const out = parseRulesForm(f);
    expect(out.rules.male).toBeNull();
    expect(out.include_non_jra).toBe(false);
    expect(out.rules.preset).toBe("custom");
  });
});

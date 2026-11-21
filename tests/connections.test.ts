import { describe, expect, it } from "vitest";
import { aggregateSires, sireTable } from "../src/lib/sires";
import { previousSeason, topValues, winnerRate } from "../src/lib/connections";
import { datesNewestFirst, fetchedAfterRace, isCropId } from "../src/lib/runner-scan";

const h = (id: string, trainer: string | null, owner: string | null, breeder: string | null, sire = "父") =>
  ({ id, name: `馬${id}`, sex: "牡", sire, dam: null, damsire: null, trainer, owner, breeder });

describe("厩舎・馬主・生産牧場ごとの集計", () => {
  const horses = [h("1", "A厩舎", "X", "牧場1"), h("2", "A厩舎", "Y", "牧場1"), h("3", "B厩舎", "X", null)];
  const tally = new Map([
    ["1", { points: 500, starts: 2, wins: 1 }],
    ["2", { points: 0, starts: 1, wins: 0 }],
    ["3", { points: 100, starts: 1, wins: 0 }],
  ]);

  it("厩舎ごとに頭数・出走・勝ち上がり・賞金をまとめる", () => {
    const rows = aggregateSires(horses, new Map([["2", 3]]), tally, "trainer");
    const a = rows.find((r) => r.sire === "A厩舎")!;
    expect(a).toMatchObject({ horses: 2, starters: 2, winners: 1, points: 500, picks: 3 });
    expect(winnerRate(a)).toBe(50);
  });

  it("空欄の生産牧場は数えない", () => {
    const rows = aggregateSires(horses, new Map(), tally, "breeder");
    expect(rows.map((r) => r.sire)).toEqual(["牧場1"]);
  });

  it("馬主の表に勝ち上がり率と順位がつく", () => {
    const races = [
      { horse_id: "1", race_date: "2026-11-01", race_name: "新馬", finish: "1", prize_man: 500, is_jra: true },
      { horse_id: "3", race_date: "2026-11-15", race_name: "未勝利", finish: "2", prize_man: 100, is_jra: true },
    ];
    const rows = sireTable(horses, new Map(), tally, races, "2026-11-21", "owner");
    expect(rows[0]).toMatchObject({ sire: "X", rank: 1, horses: 2, winners: 1, starters: 2, winnerRate: 50 });
  });

  it("所属馬の多い順に父などを数える", () => {
    expect(topValues(horses, (x) => x.owner)).toEqual([{ name: "X", count: 2 }, { name: "Y", count: 1 }]);
  });
});

describe("前の世代のシーズン", () => {
  it("2026年11月なら2023年生まれ・2025年6月〜2026年ダービー", () => {
    expect(previousSeason(new Date("2026-11-21T00:00:00Z"))).toEqual({ crop_year: 2023, season_start: "2025-06-01", season_end: "2026-05-31" });
  });
  it("2027年3月（まだ2024年生まれのシーズン中）なら2023年生まれ", () => {
    expect(previousSeason(new Date("2027-03-01T00:00:00Z")).crop_year).toBe(2023);
  });
});

describe("出走馬の取り込み", () => {
  it("新しい日から順に並べる", () => {
    expect(datesNewestFirst("2026-11-14", "2026-11-16")).toEqual(["2026-11-16", "2026-11-15", "2026-11-14"]);
  });
  it("馬IDの頭4桁で世代を見分ける", () => {
    expect(isCropId("2024106790", 2024)).toBe(true);
    expect(isCropId("2023106790", 2024)).toBe(false);
  });
  it("レース翌日の0時（日本時間）以降に読んでいれば読み直さない", () => {
    expect(fetchedAfterRace(null, "2026-11-15")).toBe(false);
    expect(fetchedAfterRace("2026-11-15T13:30:00Z", "2026-11-15")).toBe(false); // 当日22:30
    expect(fetchedAfterRace("2026-11-16T14:00:00Z", "2026-11-15")).toBe(true);
  });
});

import { KINDS, titleOf } from "../src/lib/connections";
describe("個別ページの見出し", () => {
  it("厩舎は所属を括弧に", () => {
    expect(titleOf(KINDS.trainer, "木村哲也 (美浦)")).toBe("木村哲也厩舎（美浦）");
    expect(titleOf(KINDS.breeder, "ノーザンファーム")).toBe("ノーザンファームの生産馬");
  });
});
describe("短い名前", () => {
  it("法人の種類を外す", async () => {
    const { shortName } = await import("../src/lib/connections");
    expect(shortName("(有)サンデーレーシング")).toBe("サンデーレーシング");
    expect(shortName("金子真人ホールディングス(株)")).toBe("金子真人ホールディングス");
    expect(shortName("ノーザンファーム")).toBe("ノーザンファーム");
  });
});

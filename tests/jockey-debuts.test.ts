import { describe, expect, it } from "vitest";
import { mkdtempSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { aggregate, loadProgress, planOrder } from "../scripts/jockey-debuts";

describe("騎手デビュー戦集計の続きから再開", () => {
  it("未確認の馬を先に、未デビューの馬は確認日が古い順に読み、デビュー済みは読まない", () => {
    const horses = { b: "2026-11-20", c: ["ルメール", "1"] as [string, string], d: "2026-11-18" };
    expect(planOrder(["a", "b", "c", "d", "e"], horses)).toEqual(["a", "e", "d", "b"]);
  });

  it("記録済みの全頭から騎手ごとに集計し、今の世代にいない馬は数えない", () => {
    const horses = {
      a: ["ルメール", "1"] as [string, string],
      b: ["ルメール", "4"] as [string, string],
      c: ["川田将雅", "3"] as [string, string],
      d: "2026-11-20",
      gone: ["川田将雅", "1"] as [string, string],
    };
    expect(aggregate(["a", "b", "c", "d"], horses)).toEqual({
      ルメール: { debutRides: 2, debutWins: 1, debutPlaces: 1 },
      川田将雅: { debutRides: 1, debutWins: 0, debutPlaces: 1 },
    });
  });

  it("記録がない・壊れている・世代が違うときは最初から", () => {
    const dir = mkdtempSync(join(tmpdir(), "jd-"));
    const p = join(dir, "x.json");
    expect(loadProgress(p, 2024).horses).toEqual({});
    writeFileSync(p, "{oops");
    expect(loadProgress(p, 2024).horses).toEqual({});
    writeFileSync(p, JSON.stringify({ season_crop: 2023, updated_at: null, horses: { a: "2026-01-01" } }));
    expect(loadProgress(p, 2024).horses).toEqual({});
    expect(loadProgress(p, 2023).horses).toEqual({ a: "2026-01-01" });
  });
});

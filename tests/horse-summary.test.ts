import { describe, it, expect } from "vitest";
import { finishCounts, earnedPrize, splitTrainer } from "../src/lib/horse-summary";

const r = (finish: string | null, race_name = "2歳未勝利", prize_man = 550, is_jra = true) => ({ finish, race_name, prize_man, is_jra });

describe("horse-summary", () => {
  it("着順の回数", () => {
    expect(finishCounts([r("1"), r("3"), r("5"), r("中止"), r("3")])).toEqual([1, 0, 2, 2]);
  });
  it("収得賞金の目安", () => {
    expect(earnedPrize([r("1", "2歳新馬", 700)])).toBe(400);
    expect(earnedPrize([r("1", "2歳新馬", 700), r("1", "ベゴニア賞(1勝クラス)", 1000)])).toBe(900);
    expect(earnedPrize([r("2", "朝日杯FS(G1)", 2800)])).toBe(1400);
    expect(earnedPrize([r("2", "2歳未勝利", 220)])).toBe(0);
    expect(earnedPrize([r("1", "2歳新馬", 300, false)])).toBe(0);
  });
  it("厩舎の地域", () => {
    expect(splitTrainer("須貝尚介 (栗東)")).toEqual({ name: "須貝尚介", area: "栗東" });
    expect(splitTrainer("[東] 木村哲也")).toEqual({ name: "木村哲也", area: "美浦" });
    expect(splitTrainer("木村哲也美浦")).toEqual({ name: "木村哲也", area: "美浦" });
    expect(splitTrainer(null)).toEqual({ name: "", area: "" });
  });
});

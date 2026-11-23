import { describe, it, expect } from "vitest";
import { isLocalHorse, popularIds, marksFor } from "../src/lib/horse-marks";

describe("地方所属の判定", () => {
  it("地方の書き方いろいろ", () => {
    expect(isLocalHorse("[地] 森下淳平")).toBe(true);
    expect(isLocalHorse("森下淳平 (地方)")).toBe(true);
    expect(isLocalHorse("荒山勝徳 (大井)")).toBe(true);
    expect(isLocalHorse("林和弘（船橋）")).toBe(true);
    expect(isLocalHorse("田中淳司 (北海道)")).toBe(true);
  });
  it("中央・海外・空は地方ではない", () => {
    expect(isLocalHorse("須貝尚介 (栗東)")).toBe(false);
    expect(isLocalHorse("[東] 木村哲也")).toBe(false);
    expect(isLocalHorse("[外] Aidan O'Brien")).toBe(false);
    expect(isLocalHorse(null)).toBe(false);
    expect(isLocalHorse("")).toBe(false);
  });
});

describe("人気馬", () => {
  it("3大会以上で指名され、上位（同数は同順位）に入った馬", () => {
    const counts = new Map([["a", 9], ["b", 5], ["c", 5], ["d", 4], ["e", 2]]);
    expect([...popularIds(counts, 2)].sort()).toEqual(["a", "b", "c"]);
    expect([...popularIds(counts, 30)].sort()).toEqual(["a", "b", "c", "d"]);
  });
});

describe("アイコンの並び", () => {
  it("地方→指名（自分が優先）→人気", () => {
    const marks = { mine: new Set(["x"]), taken: new Set(["x", "y"]), popular: new Set(["x"]) };
    expect(marksFor("x", "荒山勝徳 (大井)", marks)).toEqual(["local", "mine", "popular"]);
    expect(marksFor("y", "須貝尚介 (栗東)", marks)).toEqual(["taken"]);
    expect(marksFor("z", null)).toEqual([]);
  });
});

import { describe, expect, it } from "vitest";
import { noteThumb } from "../src/lib/note-thumb";

describe("noteカードの見出し（予想とコラムの切り替え）", () => {
  it("新馬戦の予想はレース日の日付で「新馬戦予想」", () => {
    const t = noteThumb("2027年ダービーへの道・火下新馬戦予想11月23日(月）東京５Ｒ芝１６００ｍ【12:20】", "2026-11-22T17:54:09.000Z");
    expect(t).toEqual({ kind: "yoso", kicker: "2027年ダービーへの道", title: "新馬戦予想", date: "11/23(月)" });
  });
  it("重賞の予想はレース名＋予想", () => {
    const t = noteThumb("ジャパンC予想　血統で狙う本命は", "2026-11-28T10:00:00.000Z");
    expect(t.kind).toBe("yoso");
    expect(t.title).toBe("ジャパンC予想");
  });
  it("予想でない記事は「コラム」で、公開日（日本時間）を出す", () => {
    const t = noteThumb("キタサンブラック産駒の距離適性を考える", "2026-11-24T16:30:00.000Z");
    expect(t).toEqual({ kind: "column", kicker: "火下遊のnote", title: "コラム", date: "11/25(水)" });
  });
});

import { describe, expect, it } from "vitest";
import { shareSig, verifyShare, sharePath, shareText, myListShareText, xIntentUrl } from "../src/lib/share";

const KEY = "test-secret";
const g = "11111111-2222-3333-4444-555555555555";
const u = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

describe("シェアリンクの署名", () => {
  it("正しい署名だけ通す", () => {
    const sig = shareSig({ groupId: g, who: u }, KEY);
    expect(sig).toHaveLength(16);
    expect(verifyShare({ groupId: g, who: u }, sig, KEY)).toBe(true);
    expect(verifyShare({ groupId: g, who: "all" }, sig, KEY)).toBe(false);
    expect(verifyShare({ groupId: g, who: u }, sig, "other-key")).toBe(false);
    expect(verifyShare({ groupId: g, who: u }, "short", KEY)).toBe(false);
  });
  it("おかしなIDは通さない", () => {
    const sig = shareSig({ groupId: "x", who: "all" }, KEY);
    expect(verifyShare({ groupId: "x", who: "all" }, sig, KEY)).toBe(false);
  });
  it("パスの形", () => {
    expect(sharePath({ groupId: g, who: "all" }, KEY)).toMatch(new RegExp(`^/share/${g}/all/[A-Za-z0-9_-]{16}$`));
  });
});

describe("投稿文", () => {
  it("指名リスト", () => {
    const t = myListShareText("身内杯", { rank: 2, points: 1234.5, horses: [{ horse_id: "a", points: 0 }, { horse_id: "b", points: 1234.5 }] }, 8, new Map([["b", { name: "テストホース" }]]));
    expect(t).toContain("「身内杯」");
    expect(t).toContain("いま2位／8人・1,235万円");
    expect(t).toContain("稼ぎ頭はテストホース");
    expect(t).toContain("#POG");
  });
  it("順位表", () => {
    expect(shareText({ kind: "ranking", groupName: "身内杯", name: "たろう", members: 5, points: 300 })).toContain("首位はたろうさん・300万円");
  });
  it("XのURL", () => {
    expect(xIntentUrl("あ #POG", "https://x.test/s")).toBe("https://x.com/intent/post?text=%E3%81%82%20%23POG&url=https%3A%2F%2Fx.test%2Fs");
  });
});

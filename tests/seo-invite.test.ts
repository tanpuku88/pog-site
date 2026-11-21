import { describe, expect, it } from "vitest";
import { horseDescription, inviteMessage, isHorseId, isInviteCode, newInviteCode } from "../src/lib/seo";

describe("招待リンク", () => {
  it("招待文に大会名とURLが入る", () => {
    const m = inviteMessage("仲間POG", "https://pog-site.vercel.app/join/abc123def456");
    expect(m).toContain("「仲間POG」");
    expect(m.endsWith("https://pog-site.vercel.app/join/abc123def456")).toBe(true);
  });
  it("新しいコードは12文字の英数字で、形のチェックを通る", () => {
    const c = newInviteCode();
    expect(c).toMatch(/^[0-9a-f]{12}$/);
    expect(isInviteCode(c)).toBe(true);
  });
  it("おかしなコードははじく", () => {
    expect(isInviteCode("abc")).toBe(false);
    expect(isInviteCode("abc123def456' or 1=1")).toBe(false);
    expect(isInviteCode("../../etc")).toBe(false);
  });
});

describe("馬ページ", () => {
  it("netkeibaの馬IDだけを受け付ける", () => {
    expect(isHorseId("2024104567")).toBe(true);
    expect(isHorseId("000a01234b")).toBe(true);
    expect(isHorseId("2024%27")).toBe(false);
    expect(isHorseId("")).toBe(false);
  });
  it("紹介文に血統・成績・指名数が入る", () => {
    const h = { id: "2024104567", name: "テストホース", sex: "牡", birth_year: 2024, sire: "キタサンブラック", dam: "テストマム", damsire: "ディープインパクト", trainer: "友道康夫", owner: null, breeder: null, updated_at: null };
    expect(horseDescription(h, { starts: 0, wins: 0, prize: 0 }, 3)).toBe(
      "テストホースのPOG情報。2024年生まれ 牡 父キタサンブラック・母テストマム・母父ディープインパクト。厩舎：友道康夫。成績：未出走。このサイトでの指名数3。",
    );
    expect(horseDescription(h, { starts: 2, wins: 1, prize: 760 }, 0)).toContain("2戦1勝・本賞金760万円");
  });
});

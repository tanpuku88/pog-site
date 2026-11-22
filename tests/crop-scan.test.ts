import { describe, it, expect } from "vitest";
import { cropIdFirst, cropIdUpper, foreignIdFirst, nextScanNumber, reachedEnd } from "../src/lib/crop-scan";

describe("crop-scan", () => {
  it("世代の最初と上限のID", () => {
    expect(cropIdFirst(2024)).toBe("2024100001");
    expect(cropIdUpper(2024)).toBe("2024200000");
    expect(foreignIdFirst(2024)).toBe("2024110001");
  });
  it("前回の続きから調べる", () => {
    expect(nextScanNumber(2024, null)).toBe(2024100001);
    expect(nextScanNumber(2024, "2024103456")).toBe(2024103457);
    expect(nextScanNumber(2024, "2023109999")).toBe(2024100001);
  });
  it("空き番号が続いたら終わり", () => {
    expect(reachedEnd(199, 200)).toBe(false);
    expect(reachedEnd(200, 200)).toBe(true);
  });
});

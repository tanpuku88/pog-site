import { describe, expect, it } from "vitest";
import { BRANDS, CLOSED_FACILITIES, FACILITIES, JRA_FACILITIES, NAR_FACILITIES, REGIONS, facilityBySlug } from "../src/content/jyogai";

describe("場外ガイドのデータ", () => {
  it("施設数が地方・中央の合計と一致する", () => {
    expect(FACILITIES.length).toBe(NAR_FACILITIES.length + JRA_FACILITIES.length);
    expect(NAR_FACILITIES.length).toBe(73);
    expect(JRA_FACILITIES.length).toBe(37);
  });

  it("slugが一意で引ける", () => {
    const slugs = FACILITIES.map((f) => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const f of FACILITIES) expect(facilityBySlug(f.slug)).toBe(f);
  });

  it("全施設に都道府県・地域・住所・運営がある", () => {
    for (const f of FACILITIES) {
      expect(f.pref.length).toBeGreaterThan(0);
      expect(REGIONS).toContain(f.region);
      expect(f.address).toContain(f.pref);
      expect(f.operator.length).toBeGreaterThan(0);
      expect(f.kind.length).toBeGreaterThan(0);
    }
  });

  it("地方施設は有料席の記載がある（公式一覧の転記漏れ防止）", () => {
    for (const f of NAR_FACILITIES) expect(typeof f.paidSeat).toBe("boolean");
  });

  it("閉鎖した場外は出典つきで記録されている", () => {
    expect(CLOSED_FACILITIES.length).toBeGreaterThanOrEqual(20);
    for (const c of CLOSED_FACILITIES) {
      expect(c.years.length).toBeGreaterThan(0);
      expect(c.body.length).toBeGreaterThan(0);
      expect(c.source.url).toMatch(/^https?:\/\//);
    }
  });

  it("系列の解説がある", () => {
    expect(BRANDS.length).toBeGreaterThanOrEqual(10);
    const names = BRANDS.map((b) => b.name).join(" ");
    for (const k of ["ウインズ", "Aiba", "BAOO", "DASH", "オフト"]) expect(names).toContain(k);
  });

  it("閉鎖済みの施設が現役リストに混ざっていない", () => {
    const names = FACILITIES.map((f) => f.name);
    for (const closed of ["ウインズ新橋", "ウインズ銀座通り", "益田場外発売所", "ドリームなかつ", "ジョイホース浜松"]) {
      expect(names).not.toContain(closed);
    }
  });
});

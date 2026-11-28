import { describe, it, expect } from "vitest";
import { sizedPhoto } from "../src/lib/photo-src";

describe("sizedPhoto", () => {
  it("サムネイルURLの幅を標準サイズに差し替える", () => {
    expect(sizedPhoto("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foo.jpg/960px-Foo.jpg", 640))
      .toBe("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foo.jpg/960px-Foo.jpg");
    expect(sizedPhoto("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foo.jpg/960px-Foo.jpg", 400))
      .toBe("https://upload.wikimedia.org/wikipedia/commons/thumb/a/ab/Foo.jpg/500px-Foo.jpg");
  });
  it("原寸URLをサムネイル形式に変換する", () => {
    expect(sizedPhoto("https://upload.wikimedia.org/wikipedia/commons/b/b1/Bar.jpg", 400))
      .toBe("https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Bar.jpg/500px-Bar.jpg");
  });
  it("Wikimedia以外のURLはそのまま", () => {
    expect(sizedPhoto("https://example.com/x.jpg", 640)).toBe("https://example.com/x.jpg");
  });
});

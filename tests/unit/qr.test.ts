import { describe, expect, it } from "vitest";

import { createQrSvg, encodeSvgDataUrl } from "@/lib/qr";

describe("createQrSvg", () => {
  it("returns svg markup and metadata", () => {
    const result = createQrSvg("https://limi.to/r/example");
    expect(result.svg.startsWith("<svg")).toBe(true);
    expect(result.size).toBeGreaterThan(0);
    expect(result.moduleCount).toBeGreaterThan(0);
  });

  it("throws on empty values", () => {
    expect(() => createQrSvg(" ")).toThrowError();
  });
});

describe("encodeSvgDataUrl", () => {
  it("encodes svg content into a data url", () => {
    const { svg } = createQrSvg("https://limi.to/r/example");
    const encoded = encodeSvgDataUrl(svg);
    expect(encoded.startsWith("data:image/svg+xml;base64,")).toBe(true);
    expect(encoded.length).toBeGreaterThan("data:image/svg+xml;base64,".length);
  });

  it("throws on invalid input", () => {
    expect(() => encodeSvgDataUrl("")).toThrowError();
  });
});

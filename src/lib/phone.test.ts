import { describe, expect, it } from "vitest";
import { toTelHref, toWhatsappHref } from "./phone";

describe("toTelHref", () => {
  it("quita espacios y antepone +34", () => {
    expect(toTelHref("958 780 348")).toBe("tel:+34958780348");
  });
});

describe("toWhatsappHref", () => {
  it("construye una URL wa.me con prefijo 34", () => {
    expect(toWhatsappHref("659 518 748")).toBe("https://wa.me/34659518748");
  });
});

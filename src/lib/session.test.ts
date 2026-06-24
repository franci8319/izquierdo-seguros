import { beforeEach, describe, expect, it, vi } from "vitest";

beforeEach(() => {
  process.env.SESSION_SECRET = "test-secret-no-usar-en-produccion";
  vi.useRealTimers();
});

describe("createSessionToken / verifySessionToken", () => {
  it("un token recién creado es válido", async () => {
    const { createSessionToken, verifySessionToken } = await import("./session");
    const token = await createSessionToken();
    expect(await verifySessionToken(token)).toBe(true);
  });

  it("rechaza un token manipulado", async () => {
    const { createSessionToken, verifySessionToken } = await import("./session");
    const token = await createSessionToken();
    const tampered = token.slice(0, -2) + "xx";
    expect(await verifySessionToken(tampered)).toBe(false);
  });

  it("rechaza undefined", async () => {
    const { verifySessionToken } = await import("./session");
    expect(await verifySessionToken(undefined)).toBe(false);
  });

  it("rechaza un token caducado", async () => {
    vi.useFakeTimers();
    const { createSessionToken, verifySessionToken } = await import("./session");
    const token = await createSessionToken();
    vi.setSystemTime(Date.now() + 8 * 24 * 60 * 60 * 1000); // +8 dias, TTL es 7
    expect(await verifySessionToken(token)).toBe(false);
    vi.useRealTimers();
  });
});

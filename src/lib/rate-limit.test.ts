import { beforeEach, describe, expect, it, vi } from "vitest";

const store = new Map<string, number>();

vi.mock("./kv", () => ({
  kv: {
    incr: async (key: string) => {
      const next = (store.get(key) ?? 0) + 1;
      store.set(key, next);
      return next;
    },
    expire: async () => {},
  },
}));

beforeEach(() => {
  store.clear();
});

describe("checkRateLimit", () => {
  it("permite hasta el límite de intentos", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    for (let i = 0; i < 5; i++) {
      expect(await checkRateLimit("login", "1.2.3.4")).toBe(true);
    }
  });

  it("bloquea a partir del sexto intento", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("login", "1.2.3.4");
    }
    expect(await checkRateLimit("login", "1.2.3.4")).toBe(false);
  });

  it("no comparte el contador entre identificadores distintos", async () => {
    const { checkRateLimit } = await import("./rate-limit");
    for (let i = 0; i < 5; i++) {
      await checkRateLimit("login", "1.2.3.4");
    }
    expect(await checkRateLimit("login", "5.6.7.8")).toBe(true);
  });
});

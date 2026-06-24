import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./auth";

describe("hashPassword / verifyPassword", () => {
  it("verifica correctamente la contraseña original", async () => {
    const hash = await hashPassword("mi-contraseña-segura");
    expect(await verifyPassword("mi-contraseña-segura", hash)).toBe(true);
  });

  it("rechaza una contraseña incorrecta", async () => {
    const hash = await hashPassword("mi-contraseña-segura");
    expect(await verifyPassword("otra-cosa", hash)).toBe(false);
  });

  it("genera hashes distintos para la misma contraseña (salt aleatorio)", async () => {
    const hash1 = await hashPassword("repetida");
    const hash2 = await hashPassword("repetida");
    expect(hash1).not.toBe(hash2);
  });
});

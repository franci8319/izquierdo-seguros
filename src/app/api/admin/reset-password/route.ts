import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { hashPassword } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = body?.token;
  const password = body?.password;

  if (typeof token !== "string" || typeof password !== "string" || password.length < 8) {
    return NextResponse.json(
      { error: "Datos inválidos. La contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  const tokenData = await kv.get(`reset:${token}`);
  if (!tokenData) {
    return NextResponse.json({ error: "El enlace ha caducado o no es válido." }, { status: 400 });
  }

  const newHash = await hashPassword(password);
  await kv.set("admin:passwordHash", newHash);
  await kv.del(`reset:${token}`);

  return NextResponse.json({ ok: true });
}

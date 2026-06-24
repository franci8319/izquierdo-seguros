import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
import { hashPassword, verifyPassword } from "@/lib/auth";
import { requireSession } from "@/lib/require-session";

export async function POST(request: NextRequest) {
  const unauthorized = await requireSession(request);
  if (unauthorized) return unauthorized;

  const body = await request.json().catch(() => null);
  const currentPassword = body?.currentPassword;
  const newPassword = body?.newPassword;

  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 8) {
    return NextResponse.json(
      { error: "Datos inválidos. La nueva contraseña debe tener al menos 8 caracteres." },
      { status: 400 }
    );
  }

  const storedHash = await kv.get<string>("admin:passwordHash");
  if (!storedHash || !(await verifyPassword(currentPassword, storedHash))) {
    return NextResponse.json({ error: "La contraseña actual no es correcta." }, { status: 401 });
  }

  const newHash = await hashPassword(newPassword);
  await kv.set("admin:passwordHash", newHash);

  return NextResponse.json({ ok: true });
}

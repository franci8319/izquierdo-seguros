import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";
import { Resend } from "resend";
import { kv } from "@/lib/kv";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = await checkRateLimit("forgot", ip);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Inténtalo de nuevo en unos minutos." },
      { status: 429 }
    );
  }

  const token = randomBytes(24).toString("hex");
  await kv.set(`reset:${token}`, { createdAt: Date.now() }, { ex: 60 * 30 });

  const resend = new Resend(process.env.RESEND_API_KEY);
  const resetUrl = `https://izquierdoseguros.es/admin/reset?token=${token}`;
  await resend.emails.send({
    from: "Izquierdo Seguros <onboarding@resend.dev>",
    to: process.env.RECOVERY_EMAIL as string,
    subject: "Recuperar contraseña del panel",
    html: `<p>Para fijar una nueva contraseña del panel, abre este enlace (caduca en 30 minutos):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  });

  return NextResponse.json({ ok: true });
}

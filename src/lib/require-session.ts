import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

export async function requireSession(request: NextRequest): Promise<NextResponse | null> {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }
  return null;
}

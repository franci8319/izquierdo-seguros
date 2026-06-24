import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/session";

// Solo protege las PÁGINAS de /admin (redirige a login).
// Las rutas /api/admin/* validan su propia sesión via requireSession,
// porque deben devolver 401 JSON en vez de redirigir.
export const config = {
  matcher: ["/admin/:path*"],
};

const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/reset"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_ADMIN_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const valid = await verifySessionToken(token);
  if (!valid) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  return NextResponse.next();
}

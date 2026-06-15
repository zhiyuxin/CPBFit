import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Proxy function (formerly middleware)
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow auth API routes, login page, and static files
  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next/static") ||
    pathname.startsWith("/_next/image") ||
    pathname === "/favicon.ico" ||
    pathname === "/manifest.json" ||
    pathname === "/icon-192.svg"
  ) {
    return NextResponse.next();
  }

  // Check for session token (NextAuth v5 uses "authjs.session-token")
  const sessionToken =
    request.cookies.get("authjs.session-token")?.value ||
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  if (!sessionToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.json|icon-192.svg).*)"],
};

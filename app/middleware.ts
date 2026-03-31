import { NextRequest, NextResponse } from "next/server";
import { validateSessionToken, COOKIE_NAME } from "@/lib/auth";

/**
 * Authentication middleware for access code protection.
 *
 * When APP_ACCESS_CODE is set, all routes (except public paths) require
 * authentication via one of:
 *   1. A valid demo_session cookie (browser sessions)
 *   2. A Bearer token matching the access code (M2M / API access)
 *
 * Unauthenticated page requests redirect to /login;
 * unauthenticated API requests return 401.
 *
 * When APP_ACCESS_CODE is not set, all requests pass through.
 */

const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/webhooks/test-receiver",
];

const PUBLIC_PREFIXES = ["/_next/", "/favicon.ico"];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  const accessCode = process.env.APP_ACCESS_CODE;

  // No access code configured — app is open
  if (!accessCode) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Allow public paths through
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for valid session cookie (browser sessions)
  const sessionCookie = request.cookies.get(COOKIE_NAME);
  if (sessionCookie?.value) {
    const isValid = await validateSessionToken(sessionCookie.value, accessCode);
    if (isValid) {
      return NextResponse.next();
    }
  }

  // Check for Bearer token (M2M / API / integration platform access)
  // LEARNING: This is critical for integration platforms that call your API
  // machine-to-machine. Without this, only browser cookie sessions would work.
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    if (token === accessCode) {
      return NextResponse.next();
    }
  }

  // Not authenticated
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { success: false, message: "Authentication required" },
      { status: 401 },
    );
  }

  // Redirect to login with return URL
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    // Match all paths except static files
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

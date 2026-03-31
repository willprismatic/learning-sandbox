import { NextRequest, NextResponse } from "next/server";
import { createSessionToken, COOKIE_NAME } from "@/lib/auth";

/**
 * POST /api/auth/login
 * Validates the access code and sets a session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessCode } = body;

    const expectedCode = process.env.APP_ACCESS_CODE;

    if (!expectedCode) {
      return NextResponse.json(
        { success: false, message: "Access code authentication is not enabled" },
        { status: 400 },
      );
    }

    if (!accessCode || accessCode !== expectedCode) {
      return NextResponse.json(
        { success: false, message: "Invalid access code" },
        { status: 401 },
      );
    }

    const token = await createSessionToken(expectedCode);
    const isSecure = request.url.startsWith("https://");

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: "lax",
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { success: false, message: "Invalid request" },
      { status: 400 },
    );
  }
}

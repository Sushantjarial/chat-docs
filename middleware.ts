import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export async function middleware(request: NextRequest) {
  const session = await getSessionCookie(request);

  if (!session) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // session.user has the user info

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"], // Specify the routes the middleware applies to
};

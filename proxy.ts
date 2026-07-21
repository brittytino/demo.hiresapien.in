import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  // If a candidate hits /, redirect to the new role hub
  // unless they're accessing existing onboarding or simulation routes
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/hub", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};

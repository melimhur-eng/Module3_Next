import { NextResponse } from "next/server";

// Layer 1: a fast, cheap redirect before any page is built.
// It only checks that a session cookie is present. It is not the security —
// each page and action verifies the signature and the person (see AUTH.md).
export function middleware(request) {
  if (!request.cookies.has("session")) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// Only the private routes — never images, scripts or public pages.
export const config = {
  matcher: ["/checkout/:path*", "/orders/:path*", "/kitchen/:path*"],
};

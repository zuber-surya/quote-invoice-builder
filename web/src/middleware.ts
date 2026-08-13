import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { apiUnauthorized } from "@/lib/api-response";

const PUBLIC_PATHS = ["/login", "/register"];
const PUBLIC_API_PREFIXES = ["/api/auth", "/api/health"];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (PUBLIC_API_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // API routes are never redirected — a redirect can't be parsed as the JSON
  // error envelope every /api/v1 client (including the future Flutter app)
  // expects. Return the same 401 shape the route handlers themselves use.
  if (!isLoggedIn && pathname.startsWith("/api/")) {
    return apiUnauthorized();
  }

  const isPublicPage = PUBLIC_PATHS.includes(pathname);

  if (!isLoggedIn && !isPublicPage) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isLoggedIn && isPublicPage) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

// Every business API route must sit behind this. Matches everything except
// static assets — see CLAUDE.md rule 11 (backend is authoritative for authorization).
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

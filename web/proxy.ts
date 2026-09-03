import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidSession } from "@/lib/adminAuth";

// Guards the admin UI. `proxy` runs in the Node.js runtime on Next 16.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // the login page + its API must stay open
  if (pathname === "/admin/login") return NextResponse.next();

  const guarded =
    pathname === "/admin" ||
    pathname.startsWith("/admin/") ||
    pathname === "/poll/admin";
  if (!guarded) return NextResponse.next();

  if (isValidSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next();
  }

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/admin/:path*", "/poll/admin"],
};

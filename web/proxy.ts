import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isValidSession } from "@/lib/adminAuth";

// Guards the admin UI and the founder dashboard.
// `proxy` runs in the Node.js runtime on Next 16.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ---- founder dashboard: cookie presence only; the page's `me` query validates
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    if (request.cookies.get("fd_founder")?.value) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/founder/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // ---- investor dashboard
  if (pathname === "/vc/dashboard" || pathname.startsWith("/vc/dashboard/")) {
    if (request.cookies.get("fd_vc")?.value) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = "/vc/login";
    url.search = `?next=${encodeURIComponent(pathname)}`;
    return NextResponse.redirect(url);
  }

  // ---- admin
  if (pathname === "/admin/login") return NextResponse.next();
  const adminGuarded =
    pathname === "/admin" || pathname.startsWith("/admin/") || pathname === "/poll/admin";
  if (!adminGuarded) return NextResponse.next();

  if (isValidSession(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.next();
  }
  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  url.search = `?next=${encodeURIComponent(pathname)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/poll/admin",
    "/dashboard",
    "/dashboard/:path*",
    "/vc/dashboard",
    "/vc/dashboard/:path*",
  ],
};

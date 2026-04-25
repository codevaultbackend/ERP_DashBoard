import { NextRequest, NextResponse } from "next/server";
import { mapRoleToRouteGroup } from "./src/core/auth/roles";

const ROLE_PREFIX: Record<string, string> = {
  head_office: "/head-office",
  state: "/state",
  district: "/district",
  retail: "/retail",
};

const publicRoutes = ["/login", "/forgot-password", "/reset-password"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;
  const rawRole = request.cookies.get("role")?.value;
  const group = mapRoleToRouteGroup(rawRole);

  if (!token && !isPublicRoute(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && isPublicRoute(pathname)) {
    const prefix = group ? ROLE_PREFIX[group] : null;
    return NextResponse.redirect(
      new URL(prefix ? `${prefix}/dashboard` : "/login", request.url)
    );
  }

  if (!token || !group) {
    return NextResponse.next();
  }

  const allowedPrefix = ROLE_PREFIX[group];

  const isAllowed =
    pathname === allowedPrefix || pathname.startsWith(`${allowedPrefix}/`);

  if (!isAllowed) {
    return NextResponse.redirect(
      new URL(`${allowedPrefix}/dashboard`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
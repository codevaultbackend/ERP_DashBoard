import { NextRequest, NextResponse } from "next/server";
import { normalizeRole } from "./src/core/auth/roles";

const ROLE_ACCESS: Record<string, string[]> = {
  super_admin: ["/super-admin"],
  admin: ["/admin", "/super-admin"],
  district: ["/district"],
  district_manager: ["/district"],
  inventory_manager: ["/inventory-manager"],
  super_inventory_manager: ["/inventory-manager"],
  hr_admin: ["/hr-admin"],
  stock_manager: ["/stock-manager"],
  super_stock_manager: ["/stock-manager"],
  sales_manager: ["/sales-manager"],
  super_sales_manager: ["/sales-manager"],
  purchase_manager: ["/purchase-manager"],
  finance: ["/finance"],
};

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
  const role = normalizeRole(rawRole);

  const publicRoutes = ["/login", "/forgot-password", "/reset-password"];

  if (!token && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (token && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(
      new URL(
        role && ROLE_ACCESS[role]?.[0]
          ? `${ROLE_ACCESS[role][0]}/dashboard`
          : "/login",
        request.url
      )
    );
  }

  if (!role) return NextResponse.next();

  const allowedPrefixes = ROLE_ACCESS[role] || [];

  const isAllowed = allowedPrefixes.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isAllowed && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(
      new URL(`${allowedPrefixes[0] || "/login"}/dashboard`, request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
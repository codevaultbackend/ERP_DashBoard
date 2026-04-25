import { NextRequest, NextResponse } from "next/server";
import { normalizeRole } from "@/core/auth/roles";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: "BACKEND_URL is not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data?.error || data?.message || "Login failed" },
        { status: response.status }
      );
    }

    const normalizedRole = normalizeRole(data?.user?.role);

    const res = NextResponse.json(
      {
        ...data,
        user: {
          ...data.user,
          normalized_role: normalizedRole,
        },
      },
      { status: 200 }
    );

    res.cookies.set("token", data.token, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    res.cookies.set("role", normalizedRole, {
      httpOnly: false,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
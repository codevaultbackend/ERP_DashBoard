import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const role = body?.role ?? "head_office";

  const response = NextResponse.json({ success: true, role });

  response.cookies.set("token", "demo-token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  response.cookies.set("role", role, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
  });

  return response;
}
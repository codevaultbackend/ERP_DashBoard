import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ message: "Logged out" }, { status: 200 });

  res.cookies.set("token", "", {
    path: "/",
    expires: new Date(0),
  });

  res.cookies.set("role", "", {
    path: "/",
    expires: new Date(0),
  });

  return res;
}
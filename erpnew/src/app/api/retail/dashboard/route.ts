import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const backendUrl =
      process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;

    if (!backendUrl) {
      return NextResponse.json(
        { error: "BACKEND_URL is not configured" },
        { status: 500 }
      );
    }

    const token =
      req.cookies.get("token")?.value ||
      req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

    if (!token) {
      return NextResponse.json(
        { error: "No token provided" },
        { status: 401 }
      );
    }

    const response = await fetch(`${backendUrl}/dash/summary`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";

    if (!response.ok) {
      if (contentType.includes("application/json")) {
        const errorJson = await response.json();
        return NextResponse.json(
          {
            error:
              errorJson?.error ||
              errorJson?.message ||
              "Failed to fetch dashboard",
          },
          { status: response.status }
        );
      }

      const errorText = await response.text();
      return NextResponse.json(
        { error: errorText || "Failed to fetch dashboard" },
        { status: response.status }
      );
    }

    if (!contentType.includes("application/json")) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Invalid backend response: ${text.slice(0, 200)}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
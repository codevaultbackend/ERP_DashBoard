import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ category: string }> }
) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { success: false, message: "BACKEND_URL is not configured", data: [] },
        { status: 500 }
      );
    }

    const { category } = await context.params;

    const authHeader = req.headers.get("authorization") || "";
    const tokenFromHeader = authHeader.startsWith("Bearer ")
      ? authHeader.replace("Bearer ", "")
      : "";

    const tokenFromCookie = req.cookies.get("token")?.value || "";
    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "No token provided", data: [] },
        { status: 401 }
      );
    }

    const backendRes = await fetch(
      `${BACKEND_URL}/stock/category/${encodeURIComponent(category)}`,
      {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const contentType = backendRes.headers.get("content-type") || "";
    const rawText = await backendRes.text();

    if (!contentType.includes("application/json")) {
      return NextResponse.json(
        {
          success: false,
          message: `Backend returned non-JSON response for category "${category}"`,
          data: [],
          debug:
            process.env.NODE_ENV === "development"
              ? rawText.slice(0, 300)
              : undefined,
        },
        { status: 502 }
      );
    }

    const data = JSON.parse(rawText);
    return NextResponse.json(data, { status: backendRes.status });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        message: error?.message || "Failed to fetch category items",
        data: [],
      },
      { status: 500 }
    );
  }
}
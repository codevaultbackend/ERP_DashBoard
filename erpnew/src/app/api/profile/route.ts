import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL;

export async function GET(req: NextRequest) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: "BACKEND_URL is not configured" },
        { status: 500 }
      );
    }

    const token = req.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: token missing" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/profile/GetMy`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.error || data?.message || "Failed to fetch profile",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data?.data || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!BACKEND_URL) {
      return NextResponse.json(
        { error: "BACKEND_URL is not configured" },
        { status: 500 }
      );
    }

    const token = req.cookies.get("token")?.value;
    const body = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Unauthorized: token missing" },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/profile/UpdateMy`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: body.name,
        username: body.username,
        phone_number: body.phone_number,
        aadhaar_url: body.aadhaar_url,
        pan_url: body.pan_url,
        police_doc_url: body.police_doc_url,
      }),
      cache: "no-store",
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data?.error || data?.message || "Failed to update profile",
        },
        { status: response.status }
      );
    }

    return NextResponse.json({
      success: true,
      data: data?.data || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
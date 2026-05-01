import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  if (!query) {
    return NextResponse.json(
      { error: "Missing search query" },
      { status: 400 },
    );
  }

  const base = process.env.API_BASE_URL || "https://app.heebshop.ae/api";
  const token = process.env.API_SECRET_TOKEN;

  const url = `${base}/search/products?search=${encodeURIComponent(query)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept-Language": "ar",
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

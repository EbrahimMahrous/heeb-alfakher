import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const encodedEndpoint = searchParams.get("endpoint");

  if (!encodedEndpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  const endpoint = decodeURIComponent(encodedEndpoint);

  // Get locale from the client (e.g., "ar" or "en")
  const locale = searchParams.get("locale") || "ar";

  const base = process.env.API_BASE_URL || "https://app.heebshop.ae/api";
  const token = process.env.API_SECRET_TOKEN;

  const url = `${base}${endpoint}`;

  // Forward the request with the correct Accept-Language header
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept-Language": locale,
    },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

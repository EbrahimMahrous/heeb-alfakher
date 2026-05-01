import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const encodedEndpoint = searchParams.get("endpoint");
  if (!encodedEndpoint) {
    return NextResponse.json({ error: "Missing endpoint" }, { status: 400 });
  }

  const endpoint = decodeURIComponent(encodedEndpoint);

  const base = process.env.API_BASE_URL || "https://app.heebshop.ae/api";
  const token = process.env.API_SECRET_TOKEN;

  const url = `${base}${endpoint}`;
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

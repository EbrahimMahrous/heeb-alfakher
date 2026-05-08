import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json(
      { found: false, error: "Missing order_id" },
      { status: 400 },
    );
  }

  const base = process.env.API_BASE_URL || "https://app.heebshop.ae/api";
  const token = process.env.API_SECRET_TOKEN;

  try {
    // Call the external API to check order status
    const res = await fetch(`${base}/order/${orderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json({ found: false });
    }

    const data = await res.json();

    // If the API returns success, order exists
    const exists = !!(data.data || data.id || data.order_id);
    return NextResponse.json({ found: exists });
  } catch (err) {
    console.error("Check order error:", err);
    return NextResponse.json({ found: false });
  }
}

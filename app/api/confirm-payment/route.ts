import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { payment_intent_id } = await request.json();
    if (!payment_intent_id) {
      return NextResponse.json(
        { success: false, error: "Missing payment_intent_id" },
        { status: 400 },
      );
    }

    // 1. Retrieve payment intent from Ziina to verify status
    const ziinaUrl = `https://api-v2.ziina.com/api/payment_intent/${payment_intent_id}`;
    const ziinaRes = await fetch(ziinaUrl, {
      headers: {
        Authorization: `Bearer ${process.env.ZIINA_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    });
    const pi = await ziinaRes.json();
    if (!ziinaRes.ok || pi.status !== "succeeded") {
      return NextResponse.json(
        { success: false, error: "Payment not successful" },
        { status: 402 },
      );
    }

    // 2. Get the order_id from localStorage (we saved it during checkout)
    // Note: This works only if called from the same browser context.
    // In production, you should pass order_id via success_url or use a database.
    // For now, we use a custom header or body parameter passed from the frontend.
    // Since this is an API route, we need to get order_id from the request.
    // We'll modify the checkout flow to send order_id in the success_url.
    // But for simplicity, we'll read it from the request body (we pass it from frontend).
    const { order_id } = await request.json().catch(() => ({}));
    if (!order_id) {
      return NextResponse.json(
        { success: false, error: "Missing order_id" },
        { status: 400 },
      );
    }

    // 3. Update the external order with payment intent ID
    const base = process.env.API_BASE_URL || "https://app.heebshop.ae/api";
    const token = process.env.API_SECRET_TOKEN;

    const formData = new URLSearchParams();
    formData.append("order_id", String(order_id));
    formData.append("payment_intent_id", payment_intent_id);
    formData.append("status", "paid"); // Depending on external API

    const updateRes = await fetch(`${base}/order/update`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      return NextResponse.json(
        { success: false, error: err.message || "Failed to update order" },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Confirm payment error:", err);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 },
    );
  }
}

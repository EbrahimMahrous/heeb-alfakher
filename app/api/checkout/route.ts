import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body.customer_name ||
      !body.mobile_number ||
      !body.emirate_name ||
      !body.area_name
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields (customer_name, mobile_number, emirate_name, area_name)",
        },
        { status: 400 },
      );
    }

    const base = process.env.API_BASE_URL || "https://app.heebshop.ae/api";
    const token = process.env.API_SECRET_TOKEN;

    const formData = new URLSearchParams();
    formData.append("customer_name", body.customer_name);
    formData.append("mobile_number", body.mobile_number);
    formData.append("emirate_name", body.emirate_name);
    formData.append("area_name", body.area_name);
    formData.append("payment_type", body.payment_type);
    formData.append("delivery_date", body.delivery_date);
    if (body.pin_location) formData.append("pin_location", body.pin_location);
    if (body.gift_message) formData.append("gift_message", body.gift_message);
    if (body.instruction) formData.append("instruction", body.instruction);

    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((item: any) => {
        formData.append("product[]", String(item.product_id));
        formData.append("quantity[]", String(item.quantity));
      });
    }

    const url = `${base}/checkout/order`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept-Language": "ar",
      },
      body: formData.toString(),
      signal: controller.signal,
    });

    clearTimeout(timeout);
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (err: any) {
    console.error("Checkout proxy error:", err);
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

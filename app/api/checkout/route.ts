import { NextResponse } from "next/server";

// ---------- Ziina Payment Helper ----------
const ZIINA_API =
  process.env.ZIINA_API_BASE_URL || "https://api-v2.ziina.com/api";
const ZIINA_KEY = process.env.ZIINA_SECRET_KEY;

async function createZiinaPayment(
  order: {
    total_amount: number;
    customer_name: string;
    mobile_number: string;
    id?: string;
  },
  host: string,
  locale: string,
) {
  // Ensure API key is set
  if (!ZIINA_KEY) {
    throw new Error("ZIINA_SECRET_KEY is not set in environment variables");
  }

  const amountFils = Math.round(order.total_amount * 100);
  if (isNaN(amountFils) || amountFils <= 0) {
    throw new Error(`Invalid total_amount: ${order.total_amount}`);
  }

  // Ziina will replace {id} with actual payment_intent ID
  const successUrl = `${host}/${locale}/order-success?session_id={id}`;
  const cancelUrl = `${host}/${locale}/checkout`;

  console.log("🔹 Creating Ziina payment:", {
    amountFils,
    successUrl,
    cancelUrl,
  });

  const response = await fetch(`${ZIINA_API}/payment_intent`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${ZIINA_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountFils,
      currency_code: "AED",
      message: `طلب توصيل لـ ${order.customer_name}`,
      success_url: successUrl,
      cancel_url: cancelUrl,
      test: process.env.NODE_ENV !== "production", // test mode in development
      metadata: {
        order_id: String(order.id || ""),
        customer_name: order.customer_name,
        phone: order.mobile_number,
      },
    }),
  });

  const paymentIntent = await response.json();
  console.log("🔸 Ziina response:", JSON.stringify(paymentIntent, null, 2));

  if (!response.ok) {
    const errorMsg =
      paymentIntent.latest_error?.message ||
      paymentIntent.message ||
      "Failed to create payment";
    throw new Error(errorMsg);
  }

  const paymentUrl = paymentIntent.redirect_url || paymentIntent.embedded_url;
  if (!paymentUrl) {
    throw new Error("Ziina returned success but no payment URL");
  }

  return { paymentUrl, paymentIntentId: paymentIntent.id };
}

// ---------- Main POST handler ----------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📥 Checkout request body:", body);

    // Basic validation
    if (
      !body.customer_name ||
      !body.mobile_number ||
      !body.emirate_name ||
      !body.area_name
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Build form data for external order API (app.heebshop.ae)
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

    // 1. Create order on external dashboard
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

    const orderData = await res.json();
    if (!res.ok || (orderData.statusCode && orderData.statusCode !== 200)) {
      console.error("❌ External order creation failed:", orderData);
      return NextResponse.json(
        { error: orderData.message || orderData.error || "فشل إنشاء الطلب" },
        { status: res.status },
      );
    }

    console.log("✅ Order created:", orderData);

    // -- Cash on Delivery --
    if (body.payment_type === "COD") {
      return NextResponse.json(orderData);
    }

    // -- Online payment (Paid) --
    if (body.payment_type === "Paid") {
      const host =
        request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "";
      const locale = body.locale || "ar";

      // Prepare the minimal order data for Ziina
      const paymentOrder = {
        total_amount: body.total_amount,
        customer_name: body.customer_name,
        mobile_number: body.mobile_number,
        id: orderData.id || orderData.order_id,
      };

      const { paymentUrl, paymentIntentId } = await createZiinaPayment(
        paymentOrder,
        host,
        locale,
      );

      return NextResponse.json({
        ...orderData, // original order response from external API
        payment_url: paymentUrl,
        payment_intent_id: paymentIntentId,
      });
    }

    return NextResponse.json(
      { error: "طريقة دفع غير مدعومة" },
      { status: 400 },
    );
  } catch (err: any) {
    console.error("🔥 Checkout Error:", err);
    if (err.name === "AbortError") {
      return NextResponse.json({ error: "Request timeout" }, { status: 504 });
    }
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}

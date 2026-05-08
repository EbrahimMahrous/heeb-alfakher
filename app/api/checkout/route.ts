import { NextResponse } from "next/server";

export const maxDuration = 60;

// ---------- Retry wrapper for fetch ----------
async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  baseDelay = 1000,
): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timeout);
      return res;
    } catch (err: any) {
      if (attempt < retries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(
          `⚠️ Attempt ${attempt + 1} failed, retrying in ${delay}ms...`,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("All retry attempts failed");
}

// ---------- Helper: extract order_id from various response shapes ----------
const extractOrderId = (orderData: any): string | null => {
  return (
    orderData?.data?.order_id ||
    orderData?.data?.id ||
    orderData?.order_id ||
    orderData?.id ||
    null
  );
};

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
  if (!ZIINA_KEY) throw new Error("ZIINA_SECRET_KEY is not set");

  const amountFils = Math.round(order.total_amount * 100);
  if (isNaN(amountFils) || amountFils <= 0)
    throw new Error(`Invalid total_amount`);

  const successUrl = `${host}/${locale}/order-success?session_id={id}`;
  const cancelUrl = `${host}/${locale}/checkout`;

  const response = await fetchWithRetry(
    `${ZIINA_API}/payment_intent`,
    {
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
        test: process.env.NODE_ENV !== "production",
        metadata: {
          order_id: String(order.id || ""),
          customer_name: order.customer_name,
          phone: order.mobile_number,
        },
      }),
    },
    2,
  );

  const paymentIntent = await response.json();
  if (!response.ok) {
    const errorMsg =
      paymentIntent.latest_error?.message ||
      paymentIntent.message ||
      "Failed to create payment";
    throw new Error(errorMsg);
  }
  const paymentUrl = paymentIntent.redirect_url || paymentIntent.embedded_url;
  if (!paymentUrl) throw new Error("Ziina returned success but no payment URL");
  return { paymentUrl, paymentIntentId: paymentIntent.id };
}

// ---------- Main POST handler ----------
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("📥 Checkout request:", {
      customer_name: body.customer_name,
      emirate_name: body.emirate_name,
      area_name: body.area_name,
      payment_type: body.payment_type,
      total_amount: body.total_amount,
    });

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

    const base = process.env.API_BASE_URL || "https://app.heebshop.ae/api";
    const token = process.env.API_SECRET_TOKEN;
    if (!token) {
      console.error("❌ API_SECRET_TOKEN is not set!");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    // Build address string
    const addressStr = `${body.area_name}, ${body.emirate_name}`;

    const formData = new URLSearchParams();
    formData.append("customer_name", body.customer_name);
    formData.append("mobile_number", body.mobile_number);
    formData.append("emirate_name", body.emirate_name);
    formData.append("area_name", body.area_name);
    formData.append("payment_type", body.payment_type);
    formData.append("delivery_date", body.delivery_date || "");
    formData.append("address", addressStr);
    formData.append("sub_total", String(body.total_amount || 0));
    formData.append("total", String(body.total_amount || 0));
    formData.append(
      "paid_amount",
      body.payment_type === "COD" ? "0" : String(body.total_amount || 0),
    );
    formData.append("delivery_fee", "0");
    formData.append("is_confirmed", "1");
    formData.append("is_from_website", "1");

    if (body.pin_location) formData.append("pin_location", body.pin_location);
    if (body.gift_message) formData.append("gift_message", body.gift_message);
    if (body.instruction) formData.append("instruction", body.instruction);
    if (body.items && Array.isArray(body.items)) {
      body.items.forEach((item: any) => {
        formData.append("product[]", String(item.product_id));
        formData.append("quantity[]", String(item.quantity));
      });
    }

    console.log("📤 Sending to:", `${base}/checkout/order`);

    const res = await fetchWithRetry(
      `${base}/checkout/order`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept-Language": "ar",
        },
        body: formData.toString(),
      },
      2,
    );

    const orderData = await res.json();

    console.log(
      "📋 External API response (truncated):",
      JSON.stringify(orderData).substring(0, 500),
    );

    if (!res.ok || (orderData.statusCode && orderData.statusCode !== 200)) {
      console.error(
        "❌ External order creation failed:",
        JSON.stringify(orderData),
      );
      return NextResponse.json(
        { error: orderData.message || orderData.error || "فشل إنشاء الطلب" },
        { status: res.status || 500 },
      );
    }

    // Extract order_id safely
    const orderId = extractOrderId(orderData);

    if (!orderId) {
      console.error("❌ No order_id in external response");
      // Still return success but without orderId – frontend will handle gracefully
      return NextResponse.json(orderData);
    }

    console.log("✅ Order created:", orderId);

    // Always include order_id at top level for frontend reliability
    const enrichedOrderData = {
      ...orderData,
      order_id: orderId,
    };

    // COD – return immediately
    if (body.payment_type === "COD") {
      return NextResponse.json(enrichedOrderData);
    }

    // Paid – create payment and return
    if (body.payment_type === "Paid") {
      const host =
        request.headers.get("origin") || process.env.NEXT_PUBLIC_BASE_URL || "";
      const locale = body.locale || "ar";
      const paymentOrder = {
        total_amount: body.total_amount,
        customer_name: body.customer_name,
        mobile_number: body.mobile_number,
        id: orderId,
      };
      const { paymentUrl, paymentIntentId } = await createZiinaPayment(
        paymentOrder,
        host,
        locale,
      );
      return NextResponse.json({
        ...enrichedOrderData,
        payment_url: paymentUrl,
        payment_intent_id: paymentIntentId,
      });
    }

    return NextResponse.json(
      { error: "طريقة دفع غير مدعومة" },
      { status: 400 },
    );
  } catch (err: any) {
    console.error("🔥 Checkout Error:", err.message);
    if (err.name === "AbortError") {
      return NextResponse.json(
        { error: "Request timeout after retries" },
        { status: 504 },
      );
    }
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 },
    );
  }
}
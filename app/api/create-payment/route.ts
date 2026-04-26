import { NextResponse } from "next/server";

const ZIINA_API =
  process.env.ZIINA_API_BASE_URL || "https://api-v2.ziina.com/api";
const ZIINA_KEY = process.env.ZIINA_SECRET_KEY;
const MIN_AMOUNT_AED = 2;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { total, address, locale } = body;

    const origin = request.headers.get("origin") || "";
    const successUrl = `${origin}/${locale}/order-success`;
    const cancelUrl = `${origin}/${locale}/checkout`;

    const amountFils = Math.round(total * 100);

    if (amountFils < MIN_AMOUNT_AED * 100) {
      return NextResponse.json(
        { error: `الحد الأدنى للدفع هو ${MIN_AMOUNT_AED} دراهم` },
        { status: 400 },
      );
    }

    const response = await fetch(`${ZIINA_API}/payment_intent`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ZIINA_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountFils,
        currency_code: "AED",
        message: `طلب توصيل لـ ${address.fullName}`,
        success_url: successUrl,
        cancel_url: cancelUrl,
        test: process.env.NODE_ENV !== "production",
      }),
    });

    const paymentIntent = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            paymentIntent.latest_error?.message ||
            paymentIntent.message ||
            "فشل في إنشاء الدفع",
        },
        { status: response.status },
      );
    }

    const paymentUrl = paymentIntent.redirect_url || paymentIntent.embedded_url;
    if (!paymentUrl) {
      return NextResponse.json(
        { error: "لم يتم استلام رابط الدفع" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      payment_url: paymentUrl,
      payment_intent_id: paymentIntent.id,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

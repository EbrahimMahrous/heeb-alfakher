import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const payload = await request.json();

    // Dealing with the event
    switch (payload.type) {
      case "payment_intent.succeeded":
        // Update the database to show that the request is paid
        console.log("تم الدفع بنجاح:", payload.data.object);
        break;
      case "payment_intent.payment_failed":
        console.log("فشل الدفع:", payload.data.object);
        break;
      default:
        console.log("حدث غير معروف:", payload.type);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}

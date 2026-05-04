"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/useTranslation";
import { useCartStore } from "@/store/cartStore";

// ----- Custom bottom-left banner after successful payment -----
function OrderSuccessBanner({ orderRef }: { orderRef: string }) {
  const { t } = useTranslation("orderSuccess");
  const [visible, setVisible] = useState(true);

  // Auto-hide after 60 seconds
  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 30000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 bg-white border border-green-400 rounded-2xl shadow-2xl p-4 max-w-sm animate-in slide-in-from-left">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <div>
          <p className="font-bold text-gray-800">{t("orderPlaced")}</p>
          <p className="text-sm text-gray-600">
            {t("referenceNumber")}:{" "}
            <span className="font-mono font-bold text-primary">{orderRef}</span>
          </p>
        </div>
      </div>
      <button
        onClick={() => setVisible(false)}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ✕
      </button>
    </div>
  );
}

export default function OrderSuccessPage() {
  const { t, locale } = useTranslation("orderSuccess");
  const searchParams = useSearchParams();
  // Extract session_id (Ziina will replace {id} with the actual payment_intent ID)
  const sessionId =
    searchParams.get("session_id") || searchParams.get("payment_intent");
  const clearCart = useCartStore((state) => state.clearCart);
  const [countdown, setCountdown] = useState(10);
  const router = useRouter();

  // Clear cart and saved data ONLY if we came from a real payment (sessionId present)
  useEffect(() => {
    if (sessionId) {
      clearCart();
      if (typeof window !== "undefined") {
        localStorage.removeItem("heeb_checkout_data");
        localStorage.removeItem("pending_payment");
      }
    }
  }, [sessionId, clearCart]);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-redirect to home after countdown
  useEffect(() => {
    if (countdown === 0) {
      router.push("/");
    }
  }, [countdown, router]);

  const whatsappLink = "https://wa.me/971523630501";

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Show banner only if payment was processed */}
      {sessionId && <OrderSuccessBanner orderRef={sessionId} />}

      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-3">{t("title")}</h1>
        <p className="text-gray-600 mb-6">{t("message")}</p>

        {sessionId && (
          <div className="bg-gray-50 p-4 rounded-xl mb-6">
            <p className="text-sm text-gray-500">{t("referenceNumber")}</p>
            <p className="text-lg font-mono font-bold text-primary">
              {sessionId}
            </p>
          </div>
        )}

        <div className="space-y-3">
          <Link
            href="/"
            className="inline-block bg-primary text-white px-8 py-3 rounded-full font-medium hover:bg-primary/90 transition"
          >
            {t("backToHome")}
          </Link>
          {countdown > 0 && (
            <p className="text-xs text-gray-400">
              {t("autoRedirect", { seconds: countdown.toString() })}
            </p>
          )}
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-sm text-gray-500 mb-2">{t("needHelp")}</p>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 font-medium transition"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-..."
                clipRule="evenodd"
              />
            </svg>
            <span>{t("whatsappContact")}</span>
          </a>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "@/lib/useTranslation";
import { useCartStore } from "@/store/cartStore";

export default function OrderSuccessPage() {
  const { t, locale } = useTranslation("orderSuccess");
  const searchParams = useSearchParams();
  const sessionId =
    searchParams.get("session_id") || searchParams.get("payment_intent");

  const clearCart = useCartStore((state) => state.clearCart);
  const [countdown, setCountdown] = useState(10);

  // Empty your cart and checkout details before logging into the success page.
  useEffect(() => {
    clearCart();
    if (typeof window !== "undefined") {
      localStorage.removeItem("heeb_checkout_data");
    }
  }, []);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon of success */}
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
          <p className="text-sm text-gray-500">
            {t("needHelp")}{" "}
            <Link href="/contact" className="text-primary underline">
              {t("contactUs")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

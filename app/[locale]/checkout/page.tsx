"use client";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import { useTranslation } from "@/lib/useTranslation";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { t } = useTranslation("checkout");
  const { totalPrice, clearCart } = useCartStore();
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`تم الدفع بواسطة: ${paymentMethod}`);
    clearCart();
    router.push("/");
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold text-primary mb-8">{t("title")}</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="block font-semibold">{t("fullName")}</label>
          <input type="text" required className="w-full border rounded p-2" />
        </div>
        <div className="space-y-2">
          <label className="block font-semibold">{t("address")}</label>
          <input type="text" required className="w-full border rounded p-2" />
        </div>
        <div className="space-y-2">
          <label className="block font-semibold">{t("phone")}</label>
          <input type="tel" required className="w-full border rounded p-2" />
        </div>

        <div className="space-y-2">
          <label className="block font-semibold">{t("paymentMethod")}</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="cash"
                checked={paymentMethod === "cash"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              {t("cashOnDelivery")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="card_on_delivery"
                checked={paymentMethod === "card_on_delivery"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              {t("cardOnDelivery")}
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                value="credit"
                checked={paymentMethod === "credit"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              {t("creditCard")}
            </label>
          </div>
        </div>

        <div className="text-xl font-bold">
          {t("total")}: {totalPrice} د.إ
        </div>
        <Button type="submit" className="w-full bg-primary">
          {t("confirm")}
        </Button>
      </form>
    </div>
  );
}

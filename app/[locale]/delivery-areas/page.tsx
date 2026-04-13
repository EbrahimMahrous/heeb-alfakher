"use client";
import { useTranslation } from "@/lib/useTranslation";
import Link from "next/link";
import Image from "next/image";

const emirates = [
  { key: "abudhabi", emoji: "🏛️" },
  { key: "dubai", emoji: "🏙️" },
  { key: "sharjah", emoji: "🏛️" },
  { key: "ajman", emoji: "🏖️" },
  { key: "rasalkhaimah", emoji: "⛰️" },
  { key: "fujairah", emoji: "🏝️" },
  { key: "ummalquwain", emoji: "🌊" },
];

export default function DeliveryAreasPage() {
  const { t } = useTranslation("deliveryAreas");

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-6">
        <Link href="/" className="text-primary hover:underline flex items-center gap-1">
          <span>←</span> {t("home")}
        </Link>
      </div>

      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          {t("title")}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t("hero")}
        </p>
      </div>

      <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-6 mb-12 text-center">
        <div className="flex justify-center mb-3">
          <Image
            src="/icons/delivery-truck.svg"
            alt="Delivery"
            width={60}
            height={60}
            className="opacity-80"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        </div>
        <p className="text-gray-700 font-medium">{t("deliveryNote")}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-6 text-center">
        {t("allEmirates")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
        {emirates.map((emirate) => (
          <div
            key={emirate.key}
            className="bg-white border border-neutral-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">
              {emirate.emoji}
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {t(`emirates.${emirate.key}`, { fallback: emirate.key })}
              </h3>
              <p className="text-sm text-gray-500">✓ {t("available")}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-neutral-50 rounded-2xl p-6 text-center border border-neutral-200">
        <p className="text-gray-700 mb-2">{t("note")}</p>
        <p className="text-sm text-gray-500">{t("contact")}</p>
      </div>
    </div>
  );
}
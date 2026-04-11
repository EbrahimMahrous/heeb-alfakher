"use client";
import { useTranslation } from "@/lib/useTranslation";
import Link from "next/link";

export default function DeliveryAreasPage() {
  const { t } = useTranslation("deliveryAreas");
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="text-primary hover:underline">← {t("home")}</Link>
      </div>
      <h1 className="text-4xl font-bold text-primary mb-4">{t("title")}</h1>
      <p className="text-xl text-gray-700 mb-8">{t("hero")}</p>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-neutral-100 p-4 rounded-xl">{t("uae")}</div>
        <div className="bg-neutral-100 p-4 rounded-xl">{t("riyadh")}</div>
        <div className="bg-neutral-100 p-4 rounded-xl">{t("doha")}</div>
        <div className="bg-neutral-100 p-4 rounded-xl">{t("manama")}</div>
        <div className="bg-neutral-100 p-4 rounded-xl">{t("muscat")}</div>
      </div>
      <p className="text-gray-600 italic">{t("note")}</p>
    </div>
  );
}
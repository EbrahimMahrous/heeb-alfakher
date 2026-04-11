"use client";
import { useTranslation } from "@/lib/useTranslation";
import Link from "next/link";

export default function HelpPage() {
  const { t } = useTranslation("help");
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="text-primary hover:underline">← {t("home")}</Link>
      </div>
      <h1 className="text-4xl font-bold text-primary mb-4">{t("title")}</h1>
      <p className="text-xl text-gray-700 mb-8">{t("hero")}</p>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-100 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-2">{t("faq")}</h2>
          <Link href="/faq" className="text-primary">اذهب إلى الأسئلة الشائعة →</Link>
        </div>
        <div className="bg-neutral-100 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-2">{t("contact")}</h2>
          <p>{t("email")}</p>
          <p>{t("phone")}</p>
        </div>
        <div className="bg-neutral-100 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-2">{t("orderTracking")}</h2>
          <p className="text-gray-600">(قريبًا)</p>
        </div>
        <div className="bg-neutral-100 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-2">{t("returnsHelp")}</h2>
          <Link href="/returns" className="text-primary">سياسة الاسترجاع →</Link>
        </div>
      </div>
    </div>
  );
}
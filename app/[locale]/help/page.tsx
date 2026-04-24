"use client";
import { useTranslation } from "@/lib/useTranslation";
import Link from "next/link";

export default function HelpPage() {
  const { t } = useTranslation("help");

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb navigation */}
      <div className="mb-6">
        <Link href="/" className="text-primary hover:underline">
          ← {t("home")}
        </Link>
      </div>

      {/* Page header */}
      <h1 className="text-4xl font-bold text-primary mb-4">{t("title")}</h1>
      <p className="text-xl text-gray-700 mb-8">{t("hero")}</p>

      {/* Help options grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* FAQ card */}
        <div className="bg-neutral-100 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-2">{t("faq")}</h2>
          <Link href="/faq" className="text-primary">
            {t("goToFaq")} →
          </Link>
        </div>

        {/* Contact card with interactive email and WhatsApp */}
        <div className="bg-neutral-100 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-2">{t("contact")}</h2>
          <a
            href="mailto:Heebshoop@gmail.com"
            className="text-primary hover:underline block"
          >
            {t("email")}
          </a>
          <a
            href="https://wa.me/971523630501?text=مرحبًا، أحتاج إلى مساعدة."
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline block"
          >
            {t("phone")}
          </a>
        </div>

        {/* Order tracking card */}
        <div className="bg-neutral-100 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-2">{t("orderTracking")}</h2>
          <p className="text-gray-600">{t("comingSoon")}</p>
        </div>

        {/* Returns policy card */}
        <div className="bg-neutral-100 p-6 rounded-2xl">
          <h2 className="text-2xl font-semibold mb-2">{t("returnsHelp")}</h2>
          <Link href="/returns" className="text-primary">
            {t("viewReturnPolicy")} →
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/useTranslation";

export default function ReturnsPage() {
  const { t } = useTranslation("returns");

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-10 flex-1 max-w-4xl">
        {/* breadcrumb */}
        <div className="text-sm text-gray-500 mb-6 flex gap-2">
          <Link href="/" className="hover:text-primary transition">
            {t("home")}
          </Link>
          <span>›</span>
          <span className="text-primary font-medium">{t("title")}</span>
        </div>

        {/* card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
          {/* title */}
          <h1 className="text-3xl font-bold text-primary mb-8">{t("title")}</h1>

          {/* conditions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("conditions")}</h2>

            <ul className="space-y-3 text-gray-700">
              <li className="flex gap-2">
                <span className="text-primary font-semibold">1.</span>
                <span>{t("item1")}</span>
              </li>

              <li className="flex gap-2">
                <span className="text-primary font-semibold">2.</span>
                <span>{t("item2")}</span>
              </li>

              <li className="flex gap-2">
                <span className="text-primary font-semibold">3.</span>
                <span>{t("item3")}</span>
              </li>
            </ul>
          </div>

          {/* recovery */}
          <div className="bg-green-50 rounded-xl p-4 mb-8">
            <p className="text-gray-700">{t("refund")}</p>
          </div>

          {/* note */}
          <div className="mb-8">
            <h3 className="font-semibold mb-2">{t("noteTitle")}</h3>

            <p className="text-gray-700 leading-relaxed">{t("note")}</p>
          </div>

          {/* advice */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h3 className="font-semibold mb-2">{t("tipsTitle")}</h3>

            <p className="text-gray-700 leading-relaxed">{t("tips")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

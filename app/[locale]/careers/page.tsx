// app/[locale]/careers/page.tsx
"use client";
import { useTranslation } from "@/lib/useTranslation";
import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import { toast } from "sonner";

export default function CareersPage() {
  const { t, locale } = useTranslation("careers");

  // Handle apply button click (show toast for now)
  const handleApply = (position: string) => {
    toast.info(
      locale === "ar"
        ? `سيتم تفعيل التقديم على وظيفة ${position} قريباً`
        : `Application for ${position} will be available soon`,
      { duration: 3000 },
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="text-primary hover:underline flex items-center gap-1"
        >
          <span>←</span> {t("home")}
        </Link>
      </div>

      {/* Under Development Notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-amber-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-amber-800">
            {t("underDevelopment")}
          </p>
          <p className="text-sm text-amber-700">{t("underDevelopmentDesc")}</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
          {t("hero")}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t("description")}
        </p>
      </div>

      {/* Open Positions */}
      <h2 className="text-2xl font-semibold mb-6">{t("openings")}</h2>
      <div className="space-y-4 mb-12">
        {/* Position 1 */}
        <div className="border border-neutral-200 rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold">{t("position1")}</h3>
            <p className="text-sm text-gray-500 mt-1">{t("location1")}</p>
          </div>
          <button
            onClick={() => handleApply(t("position1"))}
            className="bg-primary text-white px-5 py-2 rounded-full text-sm hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            {t("apply")}
          </button>
        </div>
        {/* Position 2 */}
        <div className="border border-neutral-200 rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold">{t("position2")}</h3>
            <p className="text-sm text-gray-500 mt-1">{t("location2")}</p>
          </div>
          <button
            onClick={() => handleApply(t("position2"))}
            className="bg-primary text-white px-5 py-2 rounded-full text-sm hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            {t("apply")}
          </button>
        </div>
        {/* Position 3 */}
        <div className="border border-neutral-200 rounded-xl p-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 hover:shadow-md transition-shadow">
          <div>
            <h3 className="text-lg font-semibold">{t("position3")}</h3>
            <p className="text-sm text-gray-500 mt-1">{t("location3")}</p>
          </div>
          <button
            onClick={() => handleApply(t("position3"))}
            className="bg-primary text-white px-5 py-2 rounded-full text-sm hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            {t("apply")}
          </button>
        </div>
      </div>

      {/* CV Submission Section */}
      <div className="bg-gray-50 rounded-2xl p-6 md:p-8 text-center border border-gray-100">
        <h3 className="text-xl font-semibold mb-3">{t("sendCVTitle")}</h3>
        <p className="text-gray-600 mb-4">{t("sendCVDesc")}</p>
        <a
          href="mailto:careers@heebalfakher.ae?subject=Job%20Application%20-%20CV&body=Dear%20Hiring%20Team%2C%0A%0APlease%20find%20attached%20my%20CV%20for%20the%20position%20I%20am%20applying%20for.%0A%0ABest%20regards%2C"
          className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary/90 transition-all shadow-md"
        >
          <Mail className="w-5 h-5" />
          {t("sendCV")}
        </a>
        <p className="text-xs text-gray-500 mt-4">{t("email")}</p>
      </div>
    </div>
  );
}

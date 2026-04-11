"use client";
import { useTranslation } from "@/lib/useTranslation";
import Link from "next/link";

export default function CareersPage() {
  const { t, locale } = useTranslation("careers");
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link href="/" className="text-primary hover:underline">
          ← {t("home")}
        </Link>
      </div>
      <h1 className="text-4xl font-bold text-primary mb-4">{t("title")}</h1>
      <p className="text-xl text-gray-700 mb-8">{t("description")}</p>
      <h2 className="text-2xl font-semibold mb-4">{t("openings")}</h2>
      <ul className="space-y-4">
        <li className="border p-4 rounded-xl flex justify-between items-center">
          <span>{t("position1")}</span>
          <button className="bg-primary text-white px-4 py-2 rounded-full">
            {t("apply")}
          </button>
        </li>
        <li className="border p-4 rounded-xl flex justify-between items-center">
          <span>{t("position2")}</span>
          <button className="bg-primary text-white px-4 py-2 rounded-full">
            {t("apply")}
          </button>
        </li>
        <li className="border p-4 rounded-xl flex justify-between items-center">
          <span>{t("position3")}</span>
          <button className="bg-primary text-white px-4 py-2 rounded-full">
            {t("apply")}
          </button>
        </li>
      </ul>
      <p className="mt-8 text-gray-600">{t("email")}</p>
    </div>
  );
}

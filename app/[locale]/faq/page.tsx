"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";

export default function FaqPage() {
  const { t } = useTranslation("faq");
  const [active, setActive] = useState<number | null>(0);

  const toggle = (index: number) => {
    setActive(active === index ? null : index);
  };

  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
  ];

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl flex-1">
      {/* breadcrumb */}
      <div className="text-sm text-gray-500 mb-6 flex gap-2">
        <Link href="/" className="hover:text-primary transition">
          {t("home")}
        </Link>
        <span>›</span>
        <span className="text-primary font-medium">{t("title")}</span>
      </div>

      {/* title */}
      <h1 className="text-3xl font-bold text-primary mb-8">{t("title")}</h1>

      {/* Accordion */}
      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
          >
            <button
              onClick={() => toggle(index)}
              className="w-full flex justify-between items-center p-5 text-left font-semibold hover:bg-gray-50 transition"
            >
              <span>{faq.q}</span>

              {/* arrow icon */}
              <span
                className={`transform transition duration-300 text-primary text-xl ${
                  active === index ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>

            <div
              className={`px-5 overflow-hidden transition-all duration-300 ${
                active === index ? "max-h-40 pb-5" : "max-h-0"
              }`}
            >
              <p className="text-gray-600 leading-relaxed">{faq.a}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Support Box */}
      <div className="mt-12 bg-linear-to-r from-green-50 to-green-100 p-8 rounded-2xl text-center shadow-sm">
        {/* icon */}
        <div className="flex justify-center mb-4">
          <Image
            src="/icons/question.svg"
            alt="support"
            width={28}
            height={28}
          />
        </div>

        <h3 className="text-lg font-semibold mb-2">{t("supportTitle")}</h3>

        <p className="text-gray-600 mb-5">{t("supportDesc")}</p>

        <Link
          href="https://wa.me/971523630501?text=Hello%20%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%20I%20want%20to%20inquire%20about%20your%20products%20%7C%20%D8%A3%D8%B1%D9%8A%D8%AF%20%D8%A7%D9%84%D8%A7%D8%B3%D8%AA%D9%81%D8%B3%D8%A7%D8%B1%20%D8%B9%D9%86%20%D9%85%D9%86%D8%AA%D8%AC%D8%A7%D8%AA%D9%83%D9%85"
          target="_blank"
          className="bg-[#338A43] hover:opacity-90 text-white px-6 py-2.5 rounded-lg inline-block transition"
        >
          {t("contact")}
        </Link>
      </div>
    </div>
  );
}

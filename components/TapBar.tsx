"use client";
import { useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import { FaTruck, FaChevronDown } from "react-icons/fa";

const emiratesKeys = [
  { key: "dubai", ar: "دبي", en: "Dubai" },
  { key: "sharjah", ar: "الشارقة", en: "Sharjah" },
  { key: "ajman", ar: "عجمان", en: "Ajman" },
  { key: "abudhabi", ar: "أبو ظبي", en: "Abu Dhabi" },
];

export default function TapBar() {
  const { t, locale } = useTranslation("common");
  const [selectedEmirate, setSelectedEmirate] = useState(emiratesKeys[0]);
  const [isOpen, setIsOpen] = useState(false);

  const getEmirateName = (emirate: typeof selectedEmirate) => {
    return locale === "ar" ? emirate.ar : emirate.en;
  };

  return (
    <>
      {/* Top bar - use dark color from config instead of black */}
      <div className="bg-dark text-white text-center text-xs py-1">
        {t("deliveryCities")}
      </div>

      {/* Bottom gray bar */}
      <div className="bg-neutral-200 px-4 py-2 flex items-center justify-between">
        {/* Day + Delivery Time */}
        <div className="flex items-center gap-3 bg-white rounded-full px-4 py-1 shadow-sm border border-neutral-300">
          <FaTruck className="text-primary text-sm" />
          <span className="text-dark text-sm font-medium">
            {t("deliveryIn")} {getEmirateName(selectedEmirate)} {t("today")}
          </span>
          <span className="text-dark text-sm border-r border-neutral-300 pr-3">
            {t("deliveryTime")}
          </span>
        </div>

        {/* Translated Emirates List */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-neutral-300 text-sm text-dark hover:bg-neutral-100 transition"
          >
            {getEmirateName(selectedEmirate)}
            <FaChevronDown size={10} className="text-dark" />
          </button>

          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-99 bg-dark/20"
                onClick={() => setIsOpen(false)}
              />
              <ul className="absolute left-0 mt-2 bg-white shadow-lg border border-neutral-300 rounded-lg w-36 z-[100]">
                {emiratesKeys.map((emirate) => (
                  <li
                    key={emirate.key}
                    className="px-3 py-2 hover:bg-neutral-100 cursor-pointer text-sm text-dark"
                    onClick={() => {
                      setSelectedEmirate(emirate);
                      setIsOpen(false);
                    }}
                  >
                    {getEmirateName(emirate)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </>
  );
}
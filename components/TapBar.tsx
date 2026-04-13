"use client";
import { useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import { Truck, ChevronDown } from "lucide-react";
import { toast } from "sonner";

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

  const handleEmirateChange = (emirate: typeof selectedEmirate) => {
    setSelectedEmirate(emirate);
    setIsOpen(false);
    toast.success(
      locale === "ar"
        ? `تم تغيير منطقة التوصيل إلى ${getEmirateName(emirate)}`
        : `Delivery area changed to ${getEmirateName(emirate)}`,
      { duration: 2000, position: "bottom-center" },
    );
  };

  return (
    <>
      {/* Top bar with animated scrolling text */}
      <div className="bg-dark text-white text-center text-xs py-2 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          {t("deliveryCities")}
        </div>
      </div>

      {/* Bottom gray bar */}
      <div className="bg-neutral-200 px-4 py-2 flex items-center justify-between">
        {/* Delivery info chip */}
        <div className="flex items-center gap-3 bg-white rounded-full px-4 py-1 shadow-sm border border-neutral-300">
          <Truck className="text-primary text-sm" />
          <span className="text-dark text-sm font-medium">
            {t("deliveryIn")} {getEmirateName(selectedEmirate)} {t("today")}
          </span>
          <span className="text-dark text-sm border-r border-neutral-300 pr-3">
            {t("deliveryTime")}
          </span>
        </div>

        {/* Emirates Dropdown - with higher z-index to appear above header */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-neutral-300 text-sm text-dark hover:bg-neutral-100 transition"
          >
            {getEmirateName(selectedEmirate)}
            <ChevronDown size={12} className="text-dark" />
          </button>

          {isOpen && (
            <>
              {/* Backdrop overlay - prevents clicks behind the dropdown */}
              <div
                className="fixed inset-0 z-[55] bg-dark/20"
                onClick={() => setIsOpen(false)}
              />
              {/* Dropdown menu - higher z-index to be above header (header is usually z-50) */}
              <ul className="absolute left-0 mt-2 bg-white shadow-lg border border-neutral-300 rounded-lg w-36 z-[60]">
                {emiratesKeys.map((emirate) => (
                  <li
                    key={emirate.key}
                    className="px-3 py-2 hover:bg-neutral-100 cursor-pointer text-sm text-dark"
                    onClick={() => handleEmirateChange(emirate)}
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

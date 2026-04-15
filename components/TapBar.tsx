"use client";
import { useState } from "react";
import Link from "next/link";
import { useTranslation } from "@/lib/useTranslation";
import { Truck, ChevronDown, MapPin, Heart } from "lucide-react";
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
  const isArabic = locale === "ar";

  const getEmirateName = (emirate: typeof selectedEmirate) => {
    return isArabic ? emirate.ar : emirate.en;
  };

  const handleEmirateChange = (emirate: typeof selectedEmirate) => {
    setSelectedEmirate(emirate);
    setIsOpen(false);
    toast.success(
      isArabic
        ? `تم تغيير منطقة التوصيل إلى ${getEmirateName(emirate)}`
        : `Delivery area changed to ${getEmirateName(emirate)}`,
      { duration: 2000, position: "bottom-center" },
    );
  };

  return (
    <>
      {/* Top bar - transparent white background and text in the middle */}
      <div className="bg-dark text-center py-2 border-b border-neutral-200">
        <div className="container mx-auto px-4 flex justify-center items-center gap-2">
          <Heart size={14} className="text-primary" />
          <span className="text-sm md:text-base font-bold text-white">
            {isArabic ? "حاضرين 24 ساعة لزباينا" : "Here for you 24/7"}
          </span>
          <Heart size={14} className="text-primary" />
        </div>
      </div>

      {/* Bottom strip - same design with components rearranged */}
      <div className="bg-neutral-100 border-b border-neutral-200 shadow-sm">
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* Delivery component */}
              <div className="flex items-center gap-2 bg-gradient-to-r from-white to-neutral-50 rounded-full px-4 py-1.5 shadow-md border border-neutral-200">
                <div className="bg-primary/10 rounded-full p-1">
                  <Truck size={14} className="text-primary" />
                </div>
                <span className="text-dark text-xs sm:text-sm font-semibold whitespace-nowrap">
                  {t("deliveryIn")} {getEmirateName(selectedEmirate)}{" "}
                  {t("today")}
                </span>
                <span className="text-dark text-xs sm:text-sm border-r border-neutral-300 pr-2">
                  {t("deliveryTime")}
                </span>
              </div>

              {/* Compound Emirates (Dropdown) next to it */}
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-neutral-300 text-sm text-dark hover:bg-neutral-50 transition shadow-sm"
                >
                  <MapPin size={12} className="text-primary" />
                  <span>{getEmirateName(selectedEmirate)}</span>
                  <ChevronDown size={12} className="text-dark/60" />
                </button>

                {isOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-[55] bg-dark/20"
                      onClick={() => setIsOpen(false)}
                    />
                    <ul className="absolute left-0 mt-2 bg-white shadow-lg border border-neutral-200 rounded-xl w-36 z-[60] overflow-hidden">
                      {emiratesKeys.map((emirate) => (
                        <li
                          key={emirate.key}
                          className="px-3 py-2 hover:bg-primary/5 cursor-pointer text-sm text-dark transition-colors"
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

            {/* Left side of the page: Page links */}
            <div className="flex items-center gap-3 text-xs text-dark">
              <Link
                href="/about"
                className="hover:text-primary transition-colors"
              >
                {isArabic ? "معلومات عنا" : "About Us"}
              </Link>
              <span className="text-neutral-300">|</span>
              <Link
                href="/returns"
                className="hover:text-primary transition-colors"
              >
                {isArabic ? "سياسة الاسترجاع" : "Returns Policy"}
              </Link>
              <span className="text-neutral-300">|</span>
              <Link
                href="/help"
                className="hover:text-primary transition-colors"
              >
                {isArabic ? "مركز المساعدة" : "Help Center"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

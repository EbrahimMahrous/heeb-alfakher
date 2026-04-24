"use client";
import { useTranslation } from "@/lib/useTranslation";
import { Heart } from "lucide-react";

export default function TapBar() {
  const { t, locale } = useTranslation("common");
  const isArabic = locale === "ar";

  return (
    <>
      {/* Top bar - dark with white text */}
      <div className="bg-dark text-center py-2 border-b border-neutral-200">
        <div className="container mx-auto px-4 flex justify-center items-center gap-2">
          <Heart size={14} className="text-primary" />
          <span className="text-sm md:text-base font-bold text-white">
            {isArabic ? "حاضرين 24 ساعة لزباينا" : "Here for you 24/7"}
          </span>
          <Heart size={14} className="text-primary" />
        </div>
      </div>
    </>
  );
}

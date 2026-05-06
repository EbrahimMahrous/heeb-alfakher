"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";

/**
 * Client component that updates the HTML lang and dir attributes
 * immediately whenever the locale changes (no full refresh needed).
 */
export default function DirUpdater() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";

  useEffect(() => {
    document.documentElement.lang = locale;
    document.documentElement.dir = locale === "ar" ? "rtl" : "ltr";
  }, [locale]);

  return null;
}

"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { categories, subcategories, products } from "@/lib/data";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

export default function CategoriesPage() {
  const { t, locale } = useTranslation("categories");
  const isRtl = locale === "ar";
  const scrollRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Horizontal scrolling using arrows
  const scroll = (direction: "left" | "right", mainId: number) => {
    const el = scrollRefs.current[mainId];
    if (el) {
      const amount = 300;
      const current = el.scrollLeft;
      const to = direction === "left" ? current - amount : current + amount;
      el.scrollTo({ left: to, behavior: "smooth" });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-dark font-medium">{t("title")}</span>
      </div>

      <h1 className="text-3xl font-bold text-primary mb-2">
        {t("shopByCategory")}
      </h1>
      <p className="text-gray-500 mb-8">{t("discover")}</p>

      <div className="space-y-10">
        {categories.map((cat) => {
          const catSubs = subcategories.filter(
            (sub) => sub.mainCategoryId === cat.id,
          );
          if (catSubs.length === 0) return null;

          return (
            <div key={cat.id} className="border-b border-neutral-200 pb-6">
              {/* Main Classification Title */}
              <h2 className="text-2xl font-bold text-dark mb-4">
                {locale === "ar" ? cat.name : cat.nameEn}
              </h2>

              {/* Subcategory bar with navigation buttons */}
              <div className="relative group">
                <button
                  onClick={() => scroll(isRtl ? "right" : "left", cat.id)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition disabled:opacity-0"
                  aria-label={t("prev")}
                >
                  <FaChevronLeft />
                </button>

                <div
                  ref={(el) => {
                    scrollRefs.current[cat.id] = el;
                  }}
                  className="flex overflow-x-auto gap-4 pb-4 scroll-smooth scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {catSubs.map((sub) => (
                    <Link
                      href={`/subcategory/${sub.slug}`}
                      key={sub.id}
                      className="shrink-0 w-28 sm:w-32 text-center group"
                    >
                      <div className="w-24 h-24 mx-auto rounded-full bg-neutral-100 overflow-hidden shadow-md group-hover:shadow-lg transition">
                        <Image
                          src="/product-img.png"
                          alt={locale === "ar" ? sub.name : sub.nameEn}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium text-dark group-hover:text-primary">
                        {locale === "ar" ? sub.name : sub.nameEn}
                      </p>
                    </Link>
                  ))}
                </div>

                <button
                  onClick={() => scroll(isRtl ? "left" : "right", cat.id)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition"
                  aria-label={t("next")}
                >
                  <FaChevronRight />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

"use client";
import { useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { categories, subcategories, products } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoriesPage() {
  const { t, locale } = useTranslation("categories");
  const isRtl = locale === "ar";
  const scrollRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Horizontal scroll function
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
        <Link href="/" className="hover:text-primary transition-colors">
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-dark font-medium">{t("title")}</span>
      </div>

      {/* Hero section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
          {t("shopByCategory")}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">{t("discover")}</p>
      </div>

      {/* Categories list */}
      <div className="space-y-12">
        {categories.map((cat) => {
          const catSubs = subcategories.filter(
            (sub) => sub.mainCategoryId === cat.id,
          );
          if (catSubs.length === 0) return null;

          return (
            <div key={cat.id} className="border-b border-neutral-200 pb-8">
              {/* Main category title - clickable to category page */}
              <Link
                href={`/category/${cat.slug}`}
                className="text-2xl font-bold text-dark mb-4 inline-block hover:text-primary transition-colors"
              >
                {locale === "ar" ? cat.name : cat.nameEn}
              </Link>

              {/* Subcategories horizontal scrollable row */}
              <div className="relative group">
                {/* Left scroll button */}
                <button
                  onClick={() => scroll(isRtl ? "right" : "left", cat.id)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/90"
                  aria-label={t("prev")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Scrollable container */}
                <div
                  ref={(el) => {
                    scrollRefs.current[cat.id] = el;
                  }}
                  className="flex overflow-x-auto gap-5 pb-4 scroll-smooth scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {catSubs.map((sub) => {
                    const productCount = products.filter(
                      (p) => p.subcategorySlug === sub.slug,
                    ).length;
                    const subName = locale === "ar" ? sub.name : sub.nameEn;
                    return (
                      <Link
                        href={`/subcategory/${sub.slug}`}
                        key={sub.id}
                        className="shrink-0 w-28 sm:w-32 text-center group/sub"
                      >
                        <div className="w-24 h-24 mx-auto rounded-full bg-neutral-100 overflow-hidden shadow-md group-hover/sub:shadow-lg transition-all duration-300">
                          <Image
                            src="/product-img.png"
                            alt={subName}
                            width={96}
                            height={96}
                            className="object-cover w-full h-full group-hover/sub:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="mt-2 text-sm font-medium text-dark group-hover/sub:text-primary transition-colors">
                          {subName}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {productCount} {t("products")}
                        </p>
                      </Link>
                    );
                  })}
                </div>

                {/* Right scroll button */}
                <button
                  onClick={() => scroll(isRtl ? "left" : "right", cat.id)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/90"
                  aria-label={t("next")}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

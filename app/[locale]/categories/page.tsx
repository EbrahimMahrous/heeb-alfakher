"use client";
import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { categories, getProductsByCategorySlug } from "@/lib/data";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CategoriesPage() {
  const { t, locale } = useTranslation("categories");
  const isRtl = locale === "ar";
  const scrollRefs = useRef<Record<number, HTMLDivElement | null>>({});

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

      {/* Categories list with products */}
      <div className="space-y-12">
        {categories.map((cat) => {
          const categoryProducts = getProductsByCategorySlug(cat.slug);
          const productCount = categoryProducts.length;
          if (productCount === 0) return null;

          return (
            <div key={cat.id} className="border-b border-neutral-200 pb-8">
              {/* Main category title with product count */}
              <div className="flex items-baseline gap-3 mb-4">
                <Link
                  href={`/category/${cat.slug}`}
                  className="text-2xl font-bold text-dark hover:text-primary transition-colors"
                >
                  {locale === "ar" ? cat.name : cat.nameEn}
                </Link>
                <span className="text-sm text-gray-500">
                  ({productCount} {t("products")})
                </span>
              </div>

              {/* Products horizontal scrollable row */}
              <div className="relative group">
                <button
                  onClick={() => scroll(isRtl ? "right" : "left", cat.id)}
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/90"
                  aria-label={t("prev")}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div
                  ref={(el) => {
                    scrollRefs.current[cat.id] = el;
                  }}
                  className="flex overflow-x-auto gap-5 pb-4 scroll-smooth scrollbar-hide"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {categoryProducts.map((product) => {
                    const productName =
                      locale === "ar" ? product.name : product.nameEn;
                    return (
                      <Link
                        href={`/product/${product.id}`}
                        key={product.id}
                        className="shrink-0 w-36 sm:w-40 text-center group/product"
                      >
                        <div className="w-32 h-32 mx-auto rounded-lg bg-neutral-100 overflow-hidden shadow-md group-hover/product:shadow-lg transition-all duration-300">
                          <Image
                            src={product.image || "/product-img.png"}
                            alt={productName}
                            width={128}
                            height={128}
                            className="object-cover w-full h-full group-hover/product:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="mt-2 text-sm font-medium text-dark group-hover/product:text-primary transition-colors line-clamp-2">
                          {productName}
                        </p>
                      </Link>
                    );
                  })}
                </div>

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

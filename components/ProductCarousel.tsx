"use client";
import { useRef } from "react";
import { useTranslation } from "@/lib/useTranslation";
import ProductCard from "./ProductCard";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface ProductCarouselProps {
  title?: string;
  products: any[];
  viewAllLink?: string;
}

export default function ProductCarousel({
  title,
  products,
  viewAllLink = "/categories",
}: ProductCarouselProps) {
  const { t, locale } = useTranslation("common");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isRtl = locale === "ar";

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const amount = 300;
      const current = scrollRef.current.scrollLeft;
      const to = direction === "left" ? current - amount : current + amount;
      scrollRef.current.scrollTo({ left: to, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {t("noProducts") || "لا توجد منتجات"}
      </div>
    );
  }

  return (
    <div className="my-8">
      {title && (
        <div className="flex justify-between items-center mb-4 px-4">
          <h2 className="text-2xl font-bold text-primary">{title}</h2>
          <a href={viewAllLink} className="text-orange hover:underline text-sm">
            {t("browseAll")} →
          </a>
        </div>
      )}

      <div className="relative group">
        {/* Left scroll button (black background, white arrow) */}
        <button
          onClick={() => scroll(isRtl ? "right" : "left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black rounded-full p-2 shadow-md hover:bg-gray-800 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={t("previous") || "السابق"}
        >
          <FaChevronLeft className="text-white text-sm" />
        </button>

        {/* Scroll container (without auto-play) */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {products.map((product) => (
            <div key={product.id} className="min-w-62.5 sm:min-w-70 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Right scroll button (black background, white arrow) */}
        <button
          onClick={() => scroll(isRtl ? "left" : "right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black rounded-full p-2 shadow-md hover:bg-gray-800 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={t("next") || "التالي"}
        >
          <FaChevronRight className="text-white text-sm" />
        </button>
      </div>
    </div>
  );
}

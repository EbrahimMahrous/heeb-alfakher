"use client";
import Link from "next/link";
import { useRef } from "react";
import { useTranslation } from "@/lib/useTranslation";
import ProductCard from "./ProductCard";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGridProps {
  title?: string;
  products: any[];
  bannerContent?: {
    title: string;
    description?: string;
    linkText?: string;
    linkHref?: string;
    bgColor?: string;
  };
}

export default function ProductGrid({
  title,
  products,
  bannerContent,
}: ProductGridProps) {
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
    return null;
  }

  return (
    <div className="my-8">
      <div className="relative group">
        {/* Left scroll button */}
        <button
          onClick={() => scroll(isRtl ? "right" : "left")}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-dark text-white rounded-full p-2 shadow-md hover:bg-dark/80 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={isRtl ? "التالي" : "السابق"}
        >
          <ChevronLeft />
        </button>

        {/* Horizontal scroll container */}
        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {/* Vertical banner (first element) */}
          {bannerContent && (
            <div className="min-w-62.5 sm:min-w-70 snap-start">
              <div
                className={`bg-linear-to-br ${bannerContent.bgColor || "from-primary/20 to-orange/20"} rounded-2xl p-5 flex flex-col justify-between h-full min-h-95 shadow-md`}
              >
                <div>
                  <h3 className="text-2xl font-bold text-primary mb-2">
                    {bannerContent.title}
                  </h3>
                  {bannerContent.description && (
                    <p className="text-gray-600 text-sm mt-2">
                      {bannerContent.description}
                    </p>
                  )}
                </div>
                <Link
                  href={bannerContent.linkHref || "/categories"}
                  className="mt-4 text-orange font-semibold hover:underline inline-flex items-center gap-1"
                >
                  {bannerContent.linkText || t("browseAll")}
                  <span>→</span>
                </Link>
              </div>
            </div>
          )}

          {/* Products */}
          {products.map((product) => (
            <div key={product.id} className="min-w-62.5 sm:min-w-70 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Right scroll button */}
        <button
          onClick={() => scroll(isRtl ? "left" : "right")}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-dark text-white rounded-full p-2 shadow-md hover:bg-dark/80 transition opacity-0 group-hover:opacity-100 focus:opacity-100"
          aria-label={isRtl ? "السابق" : "التالي"}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}

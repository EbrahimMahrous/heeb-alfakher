"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { useTranslation } from "@/lib/useTranslation";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ui/ProductSkeleton";
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
    bannerImage?: string;
  };
  loading?: boolean;
}

export default function ProductGrid({
  title,
  products,
  bannerContent,
  loading,
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

  const localizedBannerHref = bannerContent?.linkHref
    ? `/${locale}${bannerContent.linkHref}`
    : `/${locale}/categories`;

  // ---------- Loading state: static grid, no horizontal scroll ----------
  if (loading) {
    return (
      <div className="my-8 px-4">
        {title && (
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-primary">{title}</h2>
          </div>
        )}
        {/* Grid 2 cols on mobile, 3 cols on tablet, 4 on desktop – no overflow */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  const visibleProducts = (products || [])
    .filter((p) => p != null)
    .filter((p) => p.status !== "off");

  if (!visibleProducts || visibleProducts.length === 0) {
    return null;
  }

  return (
    <div className="my-8">
      <div className="relative group">
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
          className="flex items-stretch overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {bannerContent && (
            <Link
              href={localizedBannerHref}
              className="min-w-62.5 sm:min-w-70 snap-start"
            >
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-md flex flex-col h-full">
                <div className="relative flex-1 bg-neutral-100">
                  {bannerContent.bannerImage ? (
                    <Image
                      src={bannerContent.bannerImage}
                      alt={bannerContent.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      priority
                    />
                  ) : (
                    <div
                      className={`absolute inset-0 bg-linear-to-br ${bannerContent.bgColor || "from-primary/20 to-orange/20"}`}
                    />
                  )}
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute inset-0 p-5 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 drop-shadow-md">
                        {bannerContent.title}
                      </h3>
                      {bannerContent.description && (
                        <p className="text-white/90 text-sm drop-shadow">
                          {bannerContent.description}
                        </p>
                      )}
                    </div>
                    <span className="text-orange font-semibold inline-flex items-center gap-1 drop-shadow">
                      {bannerContent.linkText || t("browseAll")}
                      <span>→</span>
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {visibleProducts.map((product) => (
            <div key={product.id} className="min-w-62.5 sm:min-w-70 snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

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

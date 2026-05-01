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

  if (loading) {
    return (
      <div className="my-8">
        {title && (
          <div className="flex justify-between items-center mb-4 px-4">
            <h2 className="text-2xl font-bold text-primary">{title}</h2>
          </div>
        )}
        <div className="flex overflow-x-auto gap-4 pb-4 snap-x snap-mandatory scrollbar-hide">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="min-w-62.5 sm:min-w-70 snap-start">
              <ProductSkeleton />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Actual products (without download)
  const visibleProducts = (products || [])
    .filter((p) => p != null)
    .filter((p) => p.status !== "off");

  if (!visibleProducts || visibleProducts.length === 0) {
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
          {/* Banner Card */}
          {bannerContent && (
            <div className="min-w-62.5 sm:min-w-70 snap-start">
              <div className="relative rounded-2xl overflow-hidden shadow-md h-86 flex flex-col">
                {bannerContent.bannerImage ? (
                  <Image
                    src={bannerContent.bannerImage}
                    alt={bannerContent.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 300px"
                  />
                ) : (
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${bannerContent.bgColor || "from-primary/20 to-orange/20"}`}
                  />
                )}
                <div className="absolute inset-0 bg-black/20" />
                <div className="relative z-10 p-5 flex flex-col justify-between h-full">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">
                      {bannerContent.title}
                    </h3>
                    {bannerContent.description && (
                      <p className="text-white/90 text-sm mt-2 drop-shadow">
                        {bannerContent.description}
                      </p>
                    )}
                  </div>
                  <Link
                    href={bannerContent.linkHref || "/categories"}
                    className="mt-4 text-orange font-semibold hover:underline inline-flex items-center gap-1 drop-shadow"
                  >
                    {bannerContent.linkText || t("browseAll")}
                    <span>→</span>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Products */}
          {visibleProducts.map((product) => (
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

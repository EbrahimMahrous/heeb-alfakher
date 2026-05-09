"use client";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { fetchAllCategories } from "@/lib/api/categories";
import { fetchAllProducts } from "@/lib/api/products";
import CategoriesSkeleton from "@/components/ui/CategoriesSkeleton"; // ← updated import

export default function CategoriesPage() {
  const { t, locale } = useTranslation("categories");
  const isRtl = locale === "ar";
  const scrollRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAllCategories(), fetchAllProducts()])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const scroll = (direction: "left" | "right", mainId: number) => {
    const el = scrollRefs.current[mainId];
    if (el) {
      const amount = 300;
      const current = el.scrollLeft;
      const to = direction === "left" ? current - amount : current + amount;
      el.scrollTo({ left: to, behavior: "smooth" });
    }
  };

  // Show skeleton while loading
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb skeleton */}
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
          <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
          <span>/</span>
          <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
        </div>
        {/* Hero skeleton */}
        <div className="text-center mb-10">
          <div className="h-8 w-64 bg-neutral-200 rounded mx-auto mb-3 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-neutral-200 rounded mx-auto animate-pulse" />
        </div>
        <CategoriesSkeleton /> {/* ← updated component name */}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link
          href={`/${locale}`}
          className="hover:text-primary transition-colors"
        >
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-dark font-medium">{t("title")}</span>
      </div>

      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
          {t("shopByCategory")}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">{t("discover")}</p>
      </div>

      <div className="space-y-12">
        {categories.map((cat) => {
          const categoryProducts = products.filter(
            (p) => p.categorySlug === cat.slug && p.status !== "off",
          );
          const productCount = categoryProducts.length;

          if (productCount === 0) return null; // hide empty categories in production

          return (
            <div key={cat.id} className="border-b border-neutral-200 pb-8">
              <div className="flex items-baseline gap-3 mb-4">
                <Link
                  href={`/${locale}/category/${cat.slug}`}
                  className="text-2xl font-bold text-dark hover:text-primary transition-colors"
                >
                  {locale === "ar" ? cat.name : cat.nameEn}
                </Link>
                <span className="text-sm text-gray-500">
                  ({productCount} {t("products")})
                </span>
              </div>

              {productCount > 0 && (
                <div className="relative group">
                  <button
                    onClick={() => scroll(isRtl ? "right" : "left", cat.id)}
                    className="absolute inset-s-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/90"
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
                          href={`/${locale}/product/${product.id}`}
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
                    className="absolute inset-e-0 top-1/2 -translate-y-1/2 z-10 bg-black/70 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-black/90"
                    aria-label={t("next")}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

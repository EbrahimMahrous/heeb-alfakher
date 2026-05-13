"use client";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { fetchAllCategories } from "@/lib/api/categories";
import { fetchAllProductsWithCategorySlug } from "@/lib/api/products";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ui/ProductSkeleton";

export default function ProductsPage() {
  const { t, locale } = useTranslation("subcategory");
  const params = useParams();
  const slugFromUrl = params?.slug as string | undefined;

  // Treat "all" as no slug (show all products)
  const slug = slugFromUrl === "all" ? null : slugFromUrl;

  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [cats, prods] = await Promise.all([
          fetchAllCategories(),
          fetchAllProductsWithCategorySlug(),
        ]);
        setAllCategories(cats);
        setAllProducts(prods);
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Determine the active category from the real slug (null for all)
  const mainCategory = useMemo(() => {
    if (!slug) return null;
    return allCategories.find((cat) => cat.slug === slug) || null;
  }, [slug, allCategories]);

  // Filter products based on the active category (or show all)
  const filteredProducts = useMemo(() => {
    let prods = mainCategory
      ? allProducts.filter((p) => p.categorySlug === mainCategory.slug)
      : allProducts;

    prods = prods.filter((p) => p.status !== "off");
    prods.sort((a, b) =>
      locale === "ar"
        ? a.name.localeCompare(b.name)
        : a.nameEn.localeCompare(b.nameEn),
    );
    return prods;
  }, [allProducts, mainCategory, locale]);

  // Page title – just the category name or "All Products"
  const pageTitle = useMemo(() => {
    if (mainCategory) {
      return locale === "ar" ? mainCategory.name : mainCategory.nameEn;
    }
    return t("allProducts");
  }, [mainCategory, locale, t]);

  // Breadcrumb
  const breadcrumbItems = useMemo(() => {
    const items = [
      { href: `/${locale}`, label: t("home") },
      { href: `/${locale}/categories`, label: t("categories") },
    ];
    if (mainCategory) {
      const name = locale === "ar" ? mainCategory.name : mainCategory.nameEn;
      items.push({ label: name, href: "" });
    } else {
      items.push({ label: t("allProducts"), href: "" });
    }
    return items;
  }, [locale, mainCategory, t]);

  if (!loading && slug && !mainCategory) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {t("notFound")}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6 flex-wrap">
        {breadcrumbItems.map((item, idx) => (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <span>/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-dark font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </div>

      {/* Page Header – clean title */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-dark">
          {pageTitle}
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          {loading ? "..." : `${filteredProducts.length} ${t("products")}`}
        </p>
      </div>

      {/* Horizontal Category Filter Bar */}
      <div className="bg-neutral-50/80 backdrop-blur-sm border border-neutral-200 rounded-2xl p-2 mb-8 flex flex-wrap items-center gap-2 shadow-sm">
        {loading ? (
          // Skeleton pills for the filter bar
          Array.from({ length: 7 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-24 rounded-full bg-neutral-200 animate-pulse"
            />
          ))
        ) : (
          <>
            {/* "All" button – always visible when loaded */}
            <Link
              href={`/${locale}/subcategory/all`}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all
                ${
                  !slug
                    ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                    : "bg-white text-dark border border-neutral-300 hover:border-primary hover:shadow"
                }`}
            >
              {t("all")}
            </Link>

            {/* Real category buttons */}
            {allCategories.map((cat) => {
              const isActive = mainCategory?.slug === cat.slug;
              return (
                <Link
                  key={cat.id}
                  href={`/${locale}/subcategory/${cat.slug}`}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2
                    ${
                      isActive
                        ? "bg-primary text-white shadow-lg shadow-primary/25 scale-105"
                        : "bg-white text-dark border border-neutral-300 hover:border-primary hover:shadow"
                    }`}
                >
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={locale === "ar" ? cat.name : cat.nameEn}
                      width={20}
                      height={20}
                      className="rounded-full object-cover w-5 h-5"
                    />
                  ) : (
                    <span className="text-xs opacity-50">•</span>
                  )}
                  <span>{locale === "ar" ? cat.name : cat.nameEn}</span>
                </Link>
              );
            })}
          </>
        )}
      </div>

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 text-gray-500">{t("noProducts")}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

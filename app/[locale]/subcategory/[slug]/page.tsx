"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { fetchAllCategories } from "@/lib/api/categories";
import { fetchAllProductsWithCategorySlug } from "@/lib/api/products";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ui/ProductSkeleton";
import { SlidersHorizontal, ArrowDownUp } from "lucide-react";

export default function ProductsPage() {
  const { t, locale } = useTranslation("subcategory");
  const { slug } = useParams();

  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Fetch categories & products (with guaranteed categorySlug) ---
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

  // --- Identify current category from URL slug ---
  const mainCategory = slug
    ? (allCategories.find((cat) => cat.slug === slug) ?? null)
    : null;

  // --- Filter states ---
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(1000);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name-asc">(
    "name-asc",
  );
  const [selectedCategorySlugs, setSelectedCategorySlugs] = useState<string[]>(
    [],
  );
  const [showFilters, setShowFilters] = useState(false);

  // Initialize selected categories based on URL slug
  useEffect(() => {
    if (mainCategory) {
      setSelectedCategorySlugs([mainCategory.slug]);
    } else {
      setSelectedCategorySlugs([]);
    }
  }, [mainCategory]);

  // --- Filter products by selected categories ---
  const categoryFilteredProducts = useMemo(() => {
    if (selectedCategorySlugs.length === 0) return allProducts;
    return allProducts.filter((p) =>
      selectedCategorySlugs.includes(p.categorySlug),
    );
  }, [allProducts, selectedCategorySlugs]);

  // --- Calculate max price from filtered products ---
  useEffect(() => {
    const maxPrice = Math.max(
      ...categoryFilteredProducts.map((p) => p.discountedPrice || p.price),
      100,
    );
    setMaxPossiblePrice(maxPrice);
    setPriceRange((prev) => [
      Math.min(prev[0], maxPrice),
      Math.min(prev[1], maxPrice),
    ]);
  }, [categoryFilteredProducts]);

  // --- Final filtering & sorting ---
  const filteredProducts = useMemo(() => {
    let prods = categoryFilteredProducts.filter(
      (p) =>
        (p.discountedPrice || p.price) >= priceRange[0] &&
        (p.discountedPrice || p.price) <= priceRange[1],
    );
    if (sortBy === "price-asc") {
      prods.sort(
        (a, b) =>
          (a.discountedPrice || a.price) - (b.discountedPrice || b.price),
      );
    } else if (sortBy === "price-desc") {
      prods.sort(
        (a, b) =>
          (b.discountedPrice || b.price) - (a.discountedPrice || b.price),
      );
    } else {
      prods.sort((a, b) =>
        locale === "ar"
          ? a.name.localeCompare(b.name)
          : a.nameEn.localeCompare(b.nameEn),
      );
    }
    return prods;
  }, [categoryFilteredProducts, priceRange, sortBy, locale]);

  // Toggle a category filter (no URL change – just filtering)
  const toggleCategory = (catSlug: string) => {
    setSelectedCategorySlugs((prev) =>
      prev.includes(catSlug)
        ? prev.filter((c) => c !== catSlug)
        : [...prev, catSlug],
    );
  };

  const resetFilters = () => {
    setSelectedCategorySlugs([]);
    setPriceRange([0, maxPossiblePrice]);
    setSortBy("name-asc");
  };

  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), priceRange[1] - 1);
    setPriceRange([value, priceRange[1]]);
  };
  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), priceRange[0] + 1);
    setPriceRange([priceRange[0], value]);
  };

  // --- Breadcrumb & page title ---
  let pageTitle = t("allProducts");
  const breadcrumbItems = [
    { href: "/", label: t("home") },
    { href: "/categories", label: t("categories") },
  ];
  if (mainCategory) {
    pageTitle = locale === "ar" ? mainCategory.name : mainCategory.nameEn;
    breadcrumbItems.push({ label: pageTitle, href: "" });
  } else {
    breadcrumbItems.push({ label: t("allProducts"), href: "" });
  }

  // If slug is provided but category not found (after loading)
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

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="lg:w-1/3 xl:w-1/4">
          <div className="bg-neutral-50 p-5 rounded-2xl sticky top-24 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t("filters")}</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden text-primary"
              >
                <SlidersHorizontal size={20} />
              </button>
            </div>

            <div
              className={`space-y-8 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              {/* Price Filter */}
              <div>
                <h4 className="font-semibold mb-4">{t("priceRange")}</h4>
                <div className="px-1">
                  <div className="relative mb-6">
                    <input
                      type="range"
                      min={0}
                      max={maxPossiblePrice}
                      value={priceRange[0]}
                      onChange={handleMinPriceChange}
                      className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none"
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxPossiblePrice}
                      value={priceRange[1]}
                      onChange={handleMaxPriceChange}
                      className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none"
                    />
                    <div className="h-1 bg-neutral-200 rounded-full" />
                  </div>
                  <div className="flex justify-between items-center gap-3">
                    <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2 flex-1 text-center">
                      <span className="text-xs text-neutral-500 block">
                        Min
                      </span>
                      <span className="font-semibold text-dark">
                        {priceRange[0]} {t("currency")}
                      </span>
                    </div>
                    <span className="text-neutral-400">—</span>
                    <div className="bg-white border border-neutral-200 rounded-lg px-3 py-2 flex-1 text-center">
                      <span className="text-xs text-neutral-500 block">
                        Max
                      </span>
                      <span className="font-semibold text-dark">
                        {priceRange[1]} {t("currency")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filter */}
              <div>
                <h4 className="font-semibold mb-3">{t("filterByCategory")}</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategorySlugs([])}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      selectedCategorySlugs.length === 0
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-neutral-300 hover:border-primary text-dark"
                    }`}
                  >
                    {t("all")}
                  </button>
                  {allCategories.map((cat) => {
                    const isActive = selectedCategorySlugs.includes(cat.slug);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleCategory(cat.slug)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm border transition ${
                          isActive
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-neutral-300 hover:border-primary text-dark"
                        }`}
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden bg-neutral-100">
                          {cat.image ? (
                            <Image
                              src={cat.image}
                              alt={locale === "ar" ? cat.name : cat.nameEn}
                              width={20}
                              height={20}
                              className="object-cover w-full h-full"
                            />
                          ) : (
                            <span className="text-xs">🪔</span>
                          )}
                        </div>
                        <span>{locale === "ar" ? cat.name : cat.nameEn}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset button */}
              <div className="pt-2">
                <button
                  onClick={resetFilters}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-full hover:bg-neutral-100 transition"
                >
                  {t("reset")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="lg:w-2/3 xl:w-3/4">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
            <h2 className="text-xl font-semibold text-dark">
              {t("allProducts")} ({loading ? "..." : filteredProducts.length})
            </h2>
            <div className="flex items-center gap-2">
              <ArrowDownUp size={18} className="text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-white border border-neutral-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="name-asc">{t("nameAsc")}</option>
                <option value="price-asc">{t("priceAsc")}</option>
                <option value="price-desc">{t("priceDesc")}</option>
              </select>
            </div>
          </div>

          {loading ? (
            /* Display skeleton loading cards */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              {t("noProducts")}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

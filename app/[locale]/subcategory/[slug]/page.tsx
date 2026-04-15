"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { categories, subcategories, products as allProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, ArrowDownUp } from "lucide-react";

export default function ProductsPage() {
  const { t, locale } = useTranslation("subcategory");
  const { slug } = useParams();
  const isRtl = locale === "ar";

  // Get subcategory info from slug (if any)
  const subcategory = slug ? subcategories.find((s) => s.slug === slug) : null;
  const mainCategory = subcategory
    ? categories.find((cat) => cat.id === subcategory.mainCategoryId)
    : null;

  const [productsList, setProductsList] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Filter state
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [maxPossiblePrice, setMaxPossiblePrice] = useState(500);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name-asc">(
    "name-asc",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load all products and calculate max price
  useEffect(() => {
    setProductsList(allProducts);
    const maxPrice = Math.max(
      ...allProducts.map((p) => p.discountedPrice || p.price),
      100,
    );
    setMaxPossiblePrice(maxPrice);
    setPriceRange([0, maxPrice]);

    // Set initial category filter if coming from a subcategory
    if (mainCategory && !selectedCategories.length) {
      setSelectedCategories([mainCategory.slug]);
    }
  }, [slug, mainCategory]);

  // Apply filters and sorting
  useEffect(() => {
    let prods = [...productsList];

    // Price filter
    prods = prods.filter(
      (p) =>
        (p.discountedPrice || p.price) >= priceRange[0] &&
        (p.discountedPrice || p.price) <= priceRange[1],
    );

    // Category filter
    if (selectedCategories.length > 0) {
      const subCats = subcategories.filter((sub) =>
        selectedCategories.includes(
          categories.find((cat) => cat.id === sub.mainCategoryId)?.slug || "",
        ),
      );
      const subSlugs = subCats.map((s) => s.slug);
      prods = prods.filter((p) => subSlugs.includes(p.subcategorySlug));
    }

    // Sorting
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
    } else if (sortBy === "name-asc") {
      prods.sort((a, b) =>
        locale === "ar"
          ? a.name.localeCompare(b.name)
          : a.nameEn.localeCompare(b.nameEn),
      );
    }

    setFilteredProducts(prods);
  }, [productsList, priceRange, sortBy, selectedCategories, locale]);

  // Toggle category selection
  const toggleCategory = (catSlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catSlug)
        ? prev.filter((c) => c !== catSlug)
        : [...prev, catSlug],
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, maxPossiblePrice]);
    setSortBy("name-asc");
  };

  // Handle price slider change
  const handleMinPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.min(Number(e.target.value), priceRange[1] - 1);
    setPriceRange([value, priceRange[1]]);
  };

  const handleMaxPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(Number(e.target.value), priceRange[0] + 1);
    setPriceRange([priceRange[0], value]);
  };

  // Page title and breadcrumb
  const pageTitle = subcategory
    ? locale === "ar"
      ? subcategory.name
      : subcategory.nameEn
    : t("allProducts");

  const breadcrumbItems = [
    { href: "/", label: t("home") },
    { href: "/categories", label: t("categories") },
  ];
  if (subcategory && mainCategory) {
    breadcrumbItems.push({
      href: `/category/${mainCategory.slug}`,
      label: locale === "ar" ? mainCategory.name : mainCategory.nameEn,
    });
  }
  breadcrumbItems.push({ label: pageTitle, href: "" });

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
              {/* Professional Price Filter */}
              <div>
                <h4 className="font-semibold mb-4">{t("priceRange")}</h4>
                <div className="px-1">
                  {/* Dual range slider */}
                  <div className="relative mb-6">
                    <input
                      type="range"
                      min={0}
                      max={maxPossiblePrice}
                      value={priceRange[0]}
                      onChange={handleMinPriceChange}
                      className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-0"
                    />
                    <input
                      type="range"
                      min={0}
                      max={maxPossiblePrice}
                      value={priceRange[1]}
                      onChange={handleMaxPriceChange}
                      className="absolute w-full h-1 appearance-none bg-transparent pointer-events-none [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-md [&::-moz-range-thumb]:border-0"
                    />
                    {/* Track background */}
                    <div className="h-1 bg-neutral-200 rounded-full" />
                  </div>
                  {/* Price display */}
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

              {/* Category Filter - Professional button grid (no scroll) */}
              <div>
                <h4 className="font-semibold mb-3">{t("filterByCategory")}</h4>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategories([])}
                    className={`px-3 py-1.5 rounded-full text-sm border transition ${
                      selectedCategories.length === 0
                        ? "bg-primary text-white border-primary"
                        : "bg-white border-neutral-300 hover:border-primary text-dark"
                    }`}
                  >
                    {t("all")}
                  </button>
                  {categories.map((cat) => {
                    const isActive = selectedCategories.includes(cat.slug);
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
                          <Image
                            src={cat.image || "/product-img.png"}
                            alt={locale === "ar" ? cat.name : cat.nameEn}
                            width={20}
                            height={20}
                            className="object-cover w-full h-full"
                          />
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
              {t("allProducts")} ({filteredProducts.length})
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

          {filteredProducts.length === 0 ? (
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

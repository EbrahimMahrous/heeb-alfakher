"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { categories, subcategories, products as allProducts } from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { SlidersHorizontal, ArrowDownUp } from "lucide-react"; // ← icons from lucide-react

// List of countries for filter
const countriesList = [
  { key: "qatar", ar: "قطر", en: "Qatar" },
  { key: "yemen", ar: "اليمن", en: "Yemen" },
  { key: "saudi", ar: "السعودية", en: "Saudi Arabia" },
  { key: "sudan", ar: "السودان", en: "Sudan" },
  { key: "bahrain", ar: "البحرين", en: "Bahrain" },
  { key: "oman", ar: "عُمان", en: "Oman" },
  { key: "uae", ar: "الإمارات", en: "UAE" },
  { key: "south-africa", ar: "جنوب أفريقيا", en: "South Africa" },
];

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
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name-asc">(
    "name-asc",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Load all products
  useEffect(() => {
    setProductsList(allProducts);
    // Set max price based on all products
    const maxPrice = Math.max(
      ...allProducts.map((p) => p.discountedPrice || p.price),
      100,
    );
    setPriceRange([0, maxPrice]);
    // Set initial filter if coming from a subcategory
    if (mainCategory && !selectedCategories.length) {
      setSelectedCategories([mainCategory.slug]);
    } else {
      setSelectedCategories([]);
    }
    setSelectedCountries([]);
  }, [slug]); // Only when slug changes, reset filters

  // Apply filters
  useEffect(() => {
    let prods = [...productsList];

    // Price filter
    prods = prods.filter(
      (p) =>
        (p.discountedPrice || p.price) >= priceRange[0] &&
        (p.discountedPrice || p.price) <= priceRange[1],
    );

    // Main category filter
    if (selectedCategories.length > 0) {
      const subCats = subcategories.filter((sub) =>
        selectedCategories.includes(
          categories.find((cat) => cat.id === sub.mainCategoryId)?.slug || "",
        ),
      );
      const subSlugs = subCats.map((s) => s.slug);
      prods = prods.filter((p) => subSlugs.includes(p.subcategorySlug));
    }

    // Country filter
    if (selectedCountries.length > 0) {
      prods = prods.filter((p) => selectedCountries.includes(p.countryCode));
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
          (b.discountedPrice || b.price) - (a.discountedPrice || a.price),
      );
    } else if (sortBy === "name-asc") {
      prods.sort((a, b) =>
        locale === "ar"
          ? a.name.localeCompare(b.name)
          : a.nameEn.localeCompare(b.nameEn),
      );
    }

    setFilteredProducts(prods);
  }, [
    productsList,
    priceRange,
    sortBy,
    selectedCategories,
    selectedCountries,
    locale,
  ]);

  const toggleCategory = (catSlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catSlug)
        ? prev.filter((c) => c !== catSlug)
        : [...prev, catSlug],
    );
  };

  const toggleCountry = (countryKey: string) => {
    setSelectedCountries((prev) =>
      prev.includes(countryKey)
        ? prev.filter((c) => c !== countryKey)
        : [...prev, countryKey],
    );
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    const maxPrice = Math.max(
      ...productsList.map((p) => p.discountedPrice || p.price),
      100,
    );
    setPriceRange([0, maxPrice]);
    setSortBy("name-asc");
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
  breadcrumbItems.push({
    label: pageTitle,
    href: "",
  });

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
              {/* Filter by Main Category */}
              <div>
                <h4 className="font-semibold mb-3">{t("filterByCategory")}</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedCategories.length === 0}
                      onChange={() => setSelectedCategories([])}
                      className="w-4 h-4 accent-primary"
                    />
                    <span className="text-sm">{t("all")}</span>
                  </label>
                  {categories.map((cat) => {
                    const isChecked = selectedCategories.includes(cat.slug);
                    return (
                      <label
                        key={cat.id}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCategory(cat.slug)}
                          className="w-4 h-4 accent-primary"
                        />
                        <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                          <Image
                            src={cat.image || "/product-img.png"}
                            alt={locale === "ar" ? cat.name : cat.nameEn}
                            width={32}
                            height={32}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <span className="text-sm">
                          {locale === "ar" ? cat.name : cat.nameEn}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Filter by Country */}
              <div>
                <h4 className="font-semibold mb-3">{t("filterByCountry")}</h4>
                <div className="flex flex-wrap gap-2">
                  {countriesList.map((country) => {
                    const isActive = selectedCountries.includes(country.key);
                    return (
                      <button
                        key={country.key}
                        onClick={() => toggleCountry(country.key)}
                        className={`px-3 py-1 rounded-full text-sm border transition ${
                          isActive
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-neutral-300 hover:border-primary"
                        }`}
                      >
                        {locale === "ar" ? country.ar : country.en}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Reset button */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={resetFilters}
                  className="flex-1 px-3 py-2 text-sm border border-neutral-300 rounded-full hover:bg-neutral-100 transition"
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

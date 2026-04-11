"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import {
  subcategories,
  getProductsBySubcategorySlug,
  categories,
} from "@/lib/data";
import ProductCard from "@/components/ProductCard";
import { FaSlidersH, FaSortAmountDown } from "react-icons/fa";

// List of countries for the filter (with key and translated text)
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

// List of tags (temporary, can be fetched from the API later)
const tagsList = [
  { id: 1, name: "tag1", nameAr: "علامة 1", nameEn: "Tag 1" },
  { id: 2, name: "tag2", nameAr: "علامة 2", nameEn: "Tag 2" },
  { id: 3, name: "tag3", nameAr: "علامة 3", nameEn: "Tag 3" },
];

// Helper function to extract the country name from the origin text (e.g., "UAE 🇦🇪" -> "Emirates")
const extractCountryName = (origin: string) => {
  return origin.split(" ")[0].trim();
};

export default function SubcategoryPage() {
  const { t, locale } = useTranslation("subcategory");
  const { slug } = useParams();
  const isRtl = locale === "ar";
  const subcategory = subcategories.find((s) => s.slug === slug);
  const [productsList, setProductsList] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  // Filter status
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "name-asc">(
    "name-asc",
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // When loading products for the subcategory
  useEffect(() => {
    if (!subcategory) return;
    const prods = getProductsBySubcategorySlug(slug as string);
    setProductsList(prods);
    const maxPrice = Math.max(
      ...prods.map((p) => p.discountedPrice || p.price),
      100,
    );
    setPriceRange([0, maxPrice]);
    // Reset filters when changing subcategory
    setSelectedCategories([]);
    setSelectedCountries([]);
    setSelectedTags([]);
  }, [slug, subcategory]);

  // Apply all filters
  useEffect(() => {
    let prods = [...productsList];

    // 1. Price filter
    prods = prods.filter(
      (p) =>
        (p.discountedPrice || p.price) >= priceRange[0] &&
        (p.discountedPrice || p.price) <= priceRange[1],
    );

    // 2. Main classification filter (if any classification is selected)
    if (selectedCategories.length > 0) {
      prods = prods.filter((p) =>
        selectedCategories.includes(p.mainCategorySlug || p.category),
      );
    }

    // 3. Country filter (matching origin)
    if (selectedCountries.length > 0) {
      prods = prods.filter((p) => {
        const country = extractCountryName(p.origin);
        return selectedCountries.includes(country);
      });
    }

    // 4. Tag filter (Products currently have no tags, we are temporarily adding random tags to illustrate the idea)
    if (selectedTags.length > 0) {
      // In fact, every product should have a `tags` field (array)
      // We will assume that products with odd IDs are marked 1, even IDs are marked 2, etc. (for illustration)
      prods = prods.filter((p) => {
        // Experience: Mark 1 for products ID 1, 4, 7..., Mark 2 for 2, 5, 8..., Mark 3 for 3, 6, 9...
        const tagId = (p.id % 3) + 1;
        return selectedTags.includes(`tag${tagId}`);
      });
    }

    // 5. Order
    if (sortBy === "price-asc")
      prods.sort(
        (a, b) =>
          (a.discountedPrice || a.price) - (b.discountedPrice || b.price),
      );
    if (sortBy === "price-desc")
      prods.sort(
        (a, b) =>
          (b.discountedPrice || b.price) - (a.discountedPrice || a.price),
      );
    if (sortBy === "name-asc")
      prods.sort((a, b) =>
        locale === "ar"
          ? a.name.localeCompare(b.name)
          : a.nameEn.localeCompare(b.nameEn),
      );

    setFilteredProducts(prods);
  }, [
    productsList,
    priceRange,
    sortBy,
    selectedCategories,
    selectedCountries,
    selectedTags,
    locale,
  ]);

  if (!subcategory)
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {t("notFound")}
      </div>
    );

  const name = locale === "ar" ? subcategory.name : subcategory.nameEn;

  // Function to switch classification selection
  const toggleCategory = (catSlug: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catSlug)
        ? prev.filter((c) => c !== catSlug)
        : [...prev, catSlug],
    );
  };

  // Function to switch country selection
  const toggleCountry = (countryKey: string) => {
    const countryName =
      locale === "ar"
        ? countriesList.find((c) => c.key === countryKey)?.ar
        : countriesList.find((c) => c.key === countryKey)?.en;
    if (countryName) {
      setSelectedCountries((prev) =>
        prev.includes(countryName)
          ? prev.filter((c) => c !== countryName)
          : [...prev, countryName],
      );
    }
  };

  // Function to switch flag selection
  const toggleTag = (tagKey: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagKey)
        ? prev.filter((t) => t !== tagKey)
        : [...prev, tagKey],
    );
  };

  // Reset all filters (except price and sorting)
  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedCountries([]);
    setSelectedTags([]);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary">
          {t("home")}
        </Link>
        <span>/</span>
        <Link href="/categories" className="hover:text-primary">
          {t("categories")}
        </Link>
        <span>/</span>
        <span className="text-dark font-medium">{name}</span>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Right column (in RTL it becomes left) - Filters */}
        <div className="lg:w-1/3 xl:w-1/4">
          <div className="bg-neutral-50 p-5 rounded-2xl sticky top-24 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{t("filters")}</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden text-primary"
              >
                <FaSlidersH />
              </button>
            </div>
            <div
              className={`space-y-8 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              {/* 1. Filter by category (with circular images) */}
              <div>
                <h4 className="font-semibold mb-3">{t("filterByCategory")}</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
                  {/* The "All Products" option (means no category is specified) */}
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

              {/* 2. Filter by country */}
              <div>
                <h4 className="font-semibold mb-3">{t("filterByCountry")}</h4>
                <div className="flex flex-wrap gap-2">
                  {countriesList.map((country) => {
                    const countryName =
                      locale === "ar" ? country.ar : country.en;
                    const isActive = selectedCountries.includes(countryName);
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
                        {countryName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Tag Filter*/}
              <div>
                <h4 className="font-semibold mb-3">{t("filterByTags")}</h4>
                <div className="flex flex-wrap gap-2">
                  {tagsList.map((tag) => {
                    const tagName = locale === "ar" ? tag.nameAr : tag.nameEn;
                    const isActive = selectedTags.includes(tag.name);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => toggleTag(tag.name)}
                        className={`px-3 py-1 rounded-full text-sm border transition ${
                          isActive
                            ? "bg-primary text-white border-primary"
                            : "bg-white border-neutral-300 hover:border-primary"
                        }`}
                      >
                        {tagName}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Apply and reset buttons (for all filters) */}
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

        {/* Left column (products) */}
        <div className="lg:w-2/3 xl:w-3/4">
          <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
            <h2 className="text-xl font-semibold text-dark">
              {t("allProducts")} ({filteredProducts.length})
            </h2>
            <div className="flex items-center gap-2">
              <FaSortAmountDown className="text-gray-500" />
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

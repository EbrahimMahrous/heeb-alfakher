"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import {
  categories,
  subcategories,
  getProductsBySubcategorySlug,
} from "@/lib/data";

// Category page - displays all subcategories under a main category
export default function CategoryPage() {
  const { t, locale } = useTranslation("category"); 
  const { slug } = useParams();
  const category = categories.find((cat) => cat.slug === slug);
  const catSubs = subcategories.filter(
    (sub) => sub.mainCategoryId === category?.id,
  );

  // Handle missing category
  if (!category) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {t("notFound")}
      </div>
    );
  }

  const categoryName = locale === "ar" ? category.name : category.nameEn;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          {t("home")}
        </Link>
        <span>/</span>
        <Link
          href="/categories"
          className="hover:text-primary transition-colors"
        >
          {t("categories")}
        </Link>
        <span>/</span>
        <span className="text-dark font-medium">{categoryName}</span>
      </div>

      {/* Hero section */}
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-primary mb-3">
          {categoryName}
        </h1>
        <p className="text-gray-500 max-w-2xl mx-auto">{t("discoverSub")}</p>
      </div>

      {/* Subcategories grid */}
      {catSubs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {t("noSubcategories")}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {catSubs.map((sub) => {
            const productCount = getProductsBySubcategorySlug(sub.slug).length;
            const subName = locale === "ar" ? sub.name : sub.nameEn;
            return (
              <Link href={`/subcategory/${sub.slug}`} key={sub.id}>
                <div className="bg-white border border-neutral-200 rounded-2xl p-5 text-center hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
                  {/* Image circle */}
                  <div className="w-24 h-24 mx-auto rounded-full bg-neutral-100 overflow-hidden shadow-md group-hover:shadow-lg transition-all duration-300">
                    <Image
                      src="/product-img.png"
                      alt={subName}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {/* Subcategory name */}
                  <p className="mt-3 font-medium text-dark group-hover:text-primary transition-colors">
                    {subName}
                  </p>
                  {/* Product count badge */}
                  <p className="text-xs text-gray-400 mt-1">
                    {productCount} {t("products")}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Footer note */}
      <div className="mt-12 text-center text-sm text-gray-400 border-t pt-6">
        {t("footerNote")}
      </div>
    </div>
  );
}

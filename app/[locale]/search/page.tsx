"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/useTranslation";
import { searchProducts } from "@/lib/api/products";
import ProductCard from "@/components/ProductCard";
import ProductSkeleton from "@/components/ui/ProductSkeleton";
import { XCircle } from "lucide-react";

// Inner component that uses useSearchParams (needs Suspense boundary)
function SearchResults() {
  const { t, locale } = useTranslation("search");
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    searchProducts(query)
      .then((data) => setResults(data))
      .catch((err) => {
        console.error("Search failed", err);
        setResults([]);
      })
      .finally(() => setLoading(false));
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-primary mb-2">
        {t("searchResults")} {query && `"${query}"`}
      </h1>
      <p className="text-gray-500 mb-8">
        {loading ? t("loading") : `${results.length} ${t("productsFound")}`}
      </p>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <ProductSkeleton key={i} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="text-center py-16">
          <XCircle className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500">{t("noProductsFound")}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {results.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

// Main page with Suspense boundary (required for useSearchParams)
export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="text-center py-20">Loading search...</div>}
    >
      <SearchResults />
    </Suspense>
  );
}

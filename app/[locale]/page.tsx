"use client";
import { useEffect, useState, useMemo } from "react";
import { useTranslation } from "@/lib/useTranslation";
import Banner from "@/components/HeroCarousel";
import CategorySection from "@/components/CategorySection";
import ProductGrid from "@/components/ProductGrid";
import { fetchAllProducts } from "@/lib/api/products";
import { fetchSlides } from "@/lib/api/slider";

/**
 * Fisher-Yates shuffle algorithm.
 * Returns a new shuffled copy of the array.
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function HomePage() {
  const { t } = useTranslation("common");
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    Promise.all([fetchSlides(), fetchAllProducts()])
      .then(([s, prods]) => {
        setSlides(s);
        setAllProducts(prods);
      })
      .catch((err) => console.error("Failed to load data", err))
      .finally(() => setLoading(false));
  }, []);

  // Shuffle products once when they load – changes every page refresh
  const shuffledProducts = useMemo(
    () => shuffleArray(allProducts),
    [allProducts],
  );

  // Show more products per row (e.g., 12 instead of 8)
  // You can adjust the slice numbers and sizes as you like
  const row1 = shuffledProducts.slice(0, 12);
  const row2 = shuffledProducts.slice(4, 16);
  const row3 = shuffledProducts.slice(8, 20);

  const banner1 = {
    title: t("quickOffers"),
    description: t("quickOffersDesc"),
    linkText: t("browseAll"),
    linkHref: "/categories",
    bgColor: "from-primary/10 to-orange/10",
    bannerImage: "/banners/quick-offers.jpeg",
  };
  const banner2 = {
    title: t("newProducts"),
    description: t("newProductsDesc"),
    linkText: t("shopNow"),
    linkHref: "/categories",
    bgColor: "from-blue-100 to-green-100",
    bannerImage: "/banners/new-arrivals.jpeg",
  };
  const banner3 = {
    title: t("bestSellers"),
    description: t("bestSellersDesc"),
    linkText: t("browseAll"),
    linkHref: "/categories",
    bgColor: "from-yellow-100 to-red-100",
    bannerImage: "/banners/best-seller.jpeg",
  };

  return (
    <main className="container mx-auto px-4">
      <Banner slides={slides} loading={loading} />
      <CategorySection loading={loading} />
      <ProductGrid
        title={t("quickOffers")}
        products={row1}
        bannerContent={banner1}
        loading={loading}
      />
      <ProductGrid
        title={t("newProducts")}
        products={row2}
        bannerContent={banner2}
        loading={loading}
      />
      <ProductGrid
        title={t("bestSellers")}
        products={row3}
        bannerContent={banner3}
        loading={loading}
      />
    </main>
  );
}

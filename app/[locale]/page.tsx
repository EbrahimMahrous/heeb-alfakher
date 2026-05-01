"use client";
import { useEffect, useState } from "react";
import { useTranslation } from "@/lib/useTranslation";
import Banner from "@/components/HeroCarousel";
import CategorySection from "@/components/CategorySection";
import ProductGrid from "@/components/ProductGrid";
import { fetchAllProducts } from "@/lib/api/products";
import { fetchSlides } from "@/lib/api/slider";

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

  const row1Products = allProducts.slice(0, 8);
  const row2Products = allProducts.slice(4, 12);
  const row3Products = allProducts.slice(8, 16);

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
        products={row1Products}
        bannerContent={banner1}
        loading={loading}
      />
      <ProductGrid
        title={t("newProducts")}
        products={row2Products}
        bannerContent={banner2}
        loading={loading}
      />
      <ProductGrid
        title={t("bestSellers")}
        products={row3Products}
        bannerContent={banner3}
        loading={loading}
      />
    </main>
  );
}

"use client";
import { useTranslation } from "@/lib/useTranslation";
import Banner from "@/components/Banner";
import CategorySection from "@/components/CategorySection";
import ProductGrid from "@/components/ProductGrid";
import { products } from "@/lib/data";

export default function HomePage() {
  const { t } = useTranslation("common");

  const row1Products = products.slice(0, 8);
  const row2Products = products.slice(4, 12);
  const row3Products = products.slice(8, 16);

  const banner1 = { title: t("quickOffers"), description: t("quickOffersDesc"), linkText: t("browseAll"), linkHref: "/categories", bgColor: "from-primary/10 to-orange/10" };
  const banner2 = { title: t("newProducts"), description: t("newProductsDesc"), linkText: t("shopNow"), linkHref: "/categories", bgColor: "from-blue-100 to-green-100" };
  const banner3 = { title: t("bestSellers"), description: t("bestSellersDesc"), linkText: t("browseAll"), linkHref: "/categories", bgColor: "from-yellow-100 to-red-100" };

  return (
    <main className="container mx-auto px-4">
      <Banner />
      <CategorySection />
      <ProductGrid title={t("quickOffers")} products={row1Products} bannerContent={banner1} />
      <ProductGrid title={t("newProducts")} products={row2Products} bannerContent={banner2} />
      <ProductGrid title={t("bestSellers")} products={row3Products} bannerContent={banner3} />
    </main>
  );
}
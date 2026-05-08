"use client";
import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { fetchProductById, fetchAllProducts } from "@/lib/api/products";
import { fetchAllCategories } from "@/lib/api/categories";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import ProductCarousel from "@/components/ProductCarousel";
import ProductDetailSkeleton from "@/components/ui/ProductDetailSkeleton";
import { ChevronDown, ChevronUp } from "lucide-react";
import ProductMeta from "@/components/ProductMeta";

export default function ProductDetailPage() {
  const { t, locale } = useTranslation("product");
  const { id } = useParams();
  const searchParams = useSearchParams();
  const categorySlugFromUrl = searchParams.get("category");

  const [product, setProduct] = useState<any>(null);
  const [suggested, setSuggested] = useState<any[]>([]);
  const [allCategories, setAllCategories] = useState<any[]>([]);
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [loadingSuggested, setLoadingSuggested] = useState(true);

  const [quantity, setQuantity] = useState(1);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    setLoadingProduct(true);
    setLoadingSuggested(true);
    fetchProductById(Number(id))
      .then((p) => setProduct(p))
      .catch(console.error)
      .finally(() => setLoadingProduct(false));

    fetchAllCategories().then(setAllCategories).catch(console.error);

    fetchAllProducts()
      .then((all) =>
        setSuggested(all.filter((p: any) => p.id !== Number(id)).slice(0, 8)),
      )
      .catch(console.error)
      .finally(() => setLoadingSuggested(false));
  }, [id]);

  if (loadingProduct) {
    return <ProductDetailSkeleton />;
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        {t("productNotFound")}
      </div>
    );
  }

  if (product.status === "off") {
    return (
      <div className="container mx-auto px-4 py-8 text-center text-gray-500">
        {t("productHidden") || "المنتج غير متاح حالياً"}
      </div>
    );
  }

  const currentCategorySlug = categorySlugFromUrl || product.categorySlug;
  const category = currentCategorySlug
    ? allCategories.find((c: any) => c.slug === currentCategorySlug)
    : null;

  const handleAddToCart = async () => {
    if (isAdding || !product.inStock) return;
    setIsAdding(true);
    try {
      await addItem({
        id: product.id,
        name: product.name,
        nameEn: product.nameEn,
        price: product.price,
        discountedPrice: product.discountedPrice,
        discountPercent: product.discountPercent,
        quantity,
        image: product.image,
        weight: product.weight,
        origin: product.origin,
        originEn: product.originEn,
        flagUrl: product.flagUrl,
      });
      toast.success(t("addToCart"));
    } catch (error) {
      toast.error("حدث خطأ أثناء الإضافة");
    } finally {
      setIsAdding(false);
    }
  };

  // Determine display values based on locale
  const originText = locale === "ar" ? product.origin : product.originEn;
  const currency = t("currency");
  const imageSrc = product.image || "/default-product.jpeg";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb – all links now preserve locale */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-4 flex-wrap">
        <Link href={`/${locale}`} className="hover:text-primary transition">
          {t("home")}
        </Link>
        {category && (
          <>
            <span>/</span>
            <Link
              href={`/${locale}/category/${category.slug}`}
              className="hover:text-primary transition"
            >
              {locale === "ar" ? category.name : category.nameEn}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-dark font-medium">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative bg-neutral-100 rounded-2xl overflow-hidden h-96 md:h-125">
          <Image
            src={imageSrc}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            unoptimized={
              typeof imageSrc === "string" && imageSrc.startsWith("https://")
            }
          />
          {product.discountPercent && (
            // Fixed: use end-4 instead of erroneous inset-e-4
            <div className="absolute top-4 inset-e-4 bg-orange text-white text-sm font-bold px-3 py-1 rounded-full z-10">
              {t("discount")}
            </div>
          )}
          {!product.inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white text-red-600 font-bold px-6 py-2 rounded-full text-lg shadow">
                {t("outOfStock")}
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {product.discountPercent && (
            <div className="inline-block bg-red-100 text-red-600 text-sm font-semibold px-3 py-1 rounded-full w-fit">
              {t("discountPercent", { percent: product.discountPercent })}
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-dark">
            {product.name}
          </h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            {product.discountedPrice ? (
              <>
                <span className="text-primary text-3xl font-bold">
                  {product.discountedPrice} {currency}
                </span>
                <span className="text-neutral-400 line-through text-lg">
                  {product.price} {currency}
                </span>
              </>
            ) : (
              <span className="text-primary text-3xl font-bold">
                {product.price} {currency}
              </span>
            )}
            <span className="text-sm text-neutral-500">
              ({t("priceIncVat")})
            </span>
          </div>

          {/* Meta: origin flag + weight – using external shared component */}
          <ProductMeta
            flagUrl={product.flagUrl}
            origin={originText}
            weight={product.weight}
          />

          {/* Quantity and Add to cart */}
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center border border-neutral-300 rounded-full overflow-hidden">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="px-4 py-2 text-lg font-medium hover:bg-neutral-100 transition"
                disabled={!product.inStock}
              >
                -
              </button>
              <span className="px-4 py-2 text-lg font-medium min-w-12.5 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="px-4 py-2 text-lg font-medium hover:bg-neutral-100 transition"
                disabled={!product.inStock}
              >
                +
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={isAdding || !product.inStock}
              className={`px-8 py-2 rounded-full flex-1 ${
                product.inStock
                  ? "bg-primary hover:bg-primary/90 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              {!product.inStock
                ? t("outOfStock")
                : isAdding
                  ? "جاري..."
                  : t("addToCart")}
            </Button>
          </div>

          {/* Expandable description */}
          <div className="mt-6 border border-neutral-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setIsDetailsOpen(!isDetailsOpen)}
              className="w-full flex justify-between items-center p-4 bg-neutral-50 hover:bg-neutral-100 transition text-end"
            >
              <span className="font-semibold text-lg">
                {t("productDetails")}
              </span>
              {isDetailsOpen ? <ChevronUp /> : <ChevronDown />}
            </button>
            {isDetailsOpen && (
              <div className="p-4 text-neutral-700 leading-relaxed border-t border-neutral-200">
                {product.description || "لا يوجد وصف للمنتج."}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Suggested products */}
      {suggested.length > 0 && (
        <div className="mt-16">
          <ProductCarousel title={t("youMayAlsoLike")} products={suggested} />
        </div>
      )}
    </div>
  );
}

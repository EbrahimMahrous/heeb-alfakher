"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/lib/useTranslation";
import ProductMeta from "./ProductMeta";

interface ProductCardProps {
  product: any;
  categorySlug?: string;
}

export default function ProductCard({
  product,
  categorySlug,
}: ProductCardProps) {
  const { t, locale } = useTranslation("common");
  const addItem = useCartStore((state) => state.addItem);
  const [isAdding, setIsAdding] = useState(false);

  if (!product || product.status === "off") return null;

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
        quantity: 1,
        image: product.image,
        weight: product.weight,
        origin: product.origin,
        originEn: product.originEn,
        flagUrl: product.flagUrl,
      });
      toast.success(t("addToCart"));
    } catch (error) {
      toast.error("حدث خطأ");
    } finally {
      setIsAdding(false);
    }
  };

  const productName = locale === "ar" ? product.name : product.nameEn;
  const effectiveCategorySlug = categorySlug || product.categorySlug;
  const productLink = effectiveCategorySlug
    ? `/${locale}/product/${product.id}?category=${effectiveCategorySlug}`
    : `/${locale}/product/${product.id}`;

  const imageSrc = product.image || "/default-product.jpeg";
  const isExternal =
    typeof imageSrc === "string" &&
    imageSrc.startsWith("https://app.heebshop.ae");

  const originText = locale === "ar" ? product.origin : product.originEn;

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
      {/* Product Image – now uses square aspect ratio */}
      <Link
        href={productLink}
        className="block relative bg-neutral-100"
        style={{ aspectRatio: "1 / 1" }}
      >
        <Image
          src={imageSrc}
          alt={productName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          unoptimized={isExternal}
        />

        {/* Discount badge – fixed RTL class */}
        {product.discountPercent && (
          <div className="absolute top-2 inset-s-2 bg-orange text-white text-xs font-bold px-2 py-1 rounded-full">
            {t("discount")}
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-red-600 font-bold px-4 py-1 rounded-full text-sm shadow">
              {t("outOfStock")}
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={productLink}>
          <h3 className="font-semibold text-md hover:text-primary line-clamp-1">
            {productName}
          </h3>
        </Link>

        <ProductMeta
          flagUrl={product.flagUrl}
          origin={originText}
          weight={product.weight}
        />

        {/* Price */}
        <div className="mt-2 flex items-center flex-wrap gap-2">
          {product.discountedPrice ? (
            <>
              <span className="text-primary font-bold text-lg">
                {product.discountedPrice} {t("currency")}
              </span>
              <span className="text-neutral-400 line-through text-sm">
                {product.price} {t("currency")}
              </span>
              <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                {t("discountPercent", {
                  percent: product.discountPercent ?? 0,
                })}
              </span>
            </>
          ) : (
            <span className="text-primary font-bold text-lg">
              {product.price} {t("currency")}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding || !product.inStock}
          className={`mt-3 rounded-full py-2 px-4 flex items-center justify-center gap-2 w-full ${
            product.inStock
              ? "bg-primary hover:bg-primary/90 text-white"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {!product.inStock ? (
            t("outOfStock")
          ) : (
            <>
              <Image
                src="/icons/plus.svg"
                alt="plus"
                width={16}
                height={16}
                className="invert brightness-0"
              />
              <span>{isAdding ? "جاري الإضافة..." : t("addToCart")}</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

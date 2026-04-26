"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslation } from "@/lib/useTranslation";

const ProductMeta = ({ weight }: { weight?: string }) => {
  if (!weight) return null;
  return (
    <div className="mt-1 inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 rounded-full px-2 py-0.5 w-fit">
      <Image
        src="/uae.svg"
        alt="UAE"
        width={16}
        height={16}
        className="h-4 w-4"
      />
      <span className="text-xs text-neutral-700">UAE</span>
      <span className="text-neutral-400 text-xs">•</span>
      <span className="text-xs text-neutral-700">{weight}</span>
    </div>
  );
};

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

  if (!product) return null;

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
      });
      toast.success(t("addToCart"));
    } catch (error) {
      toast.error("حدث خطأ");
    } finally {
      setIsAdding(false);
    }
  };

  const productName = locale === "ar" ? product.name : product.nameEn;
  const productLink = categorySlug
    ? `/product/${product.id}?category=${categorySlug}`
    : `/product/${product.id}`;

  const imageSrc = product.image || "/default-product.jpeg";

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden hover:shadow-lg transition flex flex-col h-full">
      {/* Image */}
      <Link href={productLink} className="block relative h-48 bg-neutral-100">
        <Image
          src={imageSrc}
          alt={productName}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-cover"
          priority={false}
        />

        {product.discountPercent && (
          <div className="absolute top-2 right-2 bg-orange text-white text-xs font-bold px-2 py-1 rounded-full">
            {t("discount")}
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-white text-red-600 font-bold px-4 py-1 rounded-full text-sm shadow">
              {t("outOfStock")}
            </span>
          </div>
        )}
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        <Link href={productLink}>
          <h3 className="font-semibold text-md hover:text-primary line-clamp-1">
            {productName}
          </h3>
        </Link>

        <ProductMeta weight={product.weight} />

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

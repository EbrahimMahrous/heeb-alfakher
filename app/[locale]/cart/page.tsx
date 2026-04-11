"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/button";
import { useTranslation } from "@/lib/useTranslation";
import { toast } from "sonner";
import ProductCarousel from "@/components/ProductCarousel";
import { products } from "@/lib/data";
import { FaTrashAlt } from "react-icons/fa";

const ProductMeta = ({ weight }: { weight?: string }) => {
  if (!weight) return null;
  return (
    <div className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 rounded-full px-2 py-0.5 w-fit">
      <Image
        src="/UAE.svg"
        alt="UAE"
        width={16}
        height={16}
        className="rounded-full"
      />
      <span className="text-xs text-neutral-700">UAE</span>
      <span className="text-neutral-400 text-xs">•</span>
      <span className="text-xs text-neutral-700">{weight}</span>
    </div>
  );
};

export default function CartPage() {
  const { t, locale } = useTranslation("cart");
  const { items, fetchCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const shippingCost = 15;
  const freeShippingThreshold = 100;
  const subtotal = totalPrice;
  const total =
    subtotal + (subtotal >= freeShippingThreshold ? 0 : shippingCost);
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);

  const cartProductIds = new Set(items.map((i) => i.id));
  const suggestedProducts = products
    .filter((p) => !cartProductIds.has(p.id))
    .slice(0, 8);

  useEffect(() => {
    fetchCart().finally(() => setIsLoading(false));
  }, []);

  const handleUpdateQuantity = async (id: number, quantity: number) => {
    if (quantity < 1) return;
    setIsUpdating(true);
    await updateQuantity(id, quantity);
    setIsUpdating(false);
    toast.success(t("updated"));
  };

  const handleRemoveItem = async (id: number) => {
    setIsUpdating(true);
    await removeItem(id);
    setIsUpdating(false);
    toast.success(t("removed"));
  };

  const handleApplyPromo = () => {
    if (promoCode.trim()) {
      toast.info("رمز ترويجي غير مفعل حالياً");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        جاري تحميل السلة...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl">{t("empty")}</h1>
        <Link href="/" className="text-primary mt-4 inline-block">
          {t("shopNow")}
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary transition">
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-dark font-medium">{t("title")}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h1 className="text-2xl font-bold text-primary">
            {t("title")} ({items.reduce((sum, i) => sum + i.quantity, 0)})
          </h1>
          {items.map((item) => {
            const hasDiscount =
              item.discountedPrice && item.price > item.discountedPrice;
            const discountPercent = hasDiscount
              ? Math.round(
                  ((item.price - item.discountedPrice!) / item.price) * 100,
                )
              : 0;
            return (
              <div
                key={item.id}
                className="flex gap-4 border-b border-neutral-200 pb-6"
              >
                <div className="w-24 h-24 bg-neutral-100 rounded-xl overflow-hidden relative shrink-0">
                  <Image
                    src={item.image || "/product-img.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <div className="mt-1">
                    <ProductMeta weight={item.weight} />
                  </div>
                  <div className="mt-2 flex items-center flex-wrap gap-2">
                    {hasDiscount ? (
                      <>
                        <span className="text-primary font-bold text-lg">
                          {item.discountedPrice} {t("currency")}
                        </span>
                        <span className="text-neutral-400 line-through text-sm">
                          {item.price} {t("currency")}
                        </span>
                        <span className="bg-red-100 text-red-600 text-xs font-semibold px-2 py-0.5 rounded-full">
                          -{discountPercent}%
                        </span>
                      </>
                    ) : (
                      <span className="text-primary font-bold text-lg">
                        {item.price} {t("currency")}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center border border-neutral-300 rounded-full overflow-hidden">
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity - 1)
                      }
                      className="px-3 py-1 text-lg font-medium hover:bg-neutral-100 transition"
                      disabled={isUpdating}
                    >
                      -
                    </button>
                    <span className="px-3 py-1 text-sm font-medium min-w-10 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        handleUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className="px-3 py-1 text-lg font-medium hover:bg-neutral-100 transition"
                      disabled={isUpdating}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-red-500 hover:text-red-700 transition"
                    disabled={isUpdating}
                  >
                    <FaTrashAlt size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-neutral-50 p-6 rounded-2xl shadow-sm h-fit sticky top-24">
          <h2 className="text-xl font-bold mb-4">{t("orderSummary")}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span>{t("subtotal")}</span>
              <span>
                {subtotal} {t("currency")}
              </span>
            </div>
            <div className="flex justify-between border-b pb-3">
              <span>{t("shipping")}</span>
              <span>
                {subtotal >= freeShippingThreshold
                  ? "مجاني"
                  : `${shippingCost} ${t("currency")}`}
              </span>
            </div>
            {remainingForFree > 0 && (
              <div className="bg-green-50 text-green-700 p-2 rounded-lg text-xs text-center">
                {t("freeShippingMessage", { amount: remainingForFree })}
              </div>
            )}
            <div className="flex justify-between text-lg font-bold pt-2">
              <span>{t("total")}</span>
              <span>
                {total} {t("currency")}
              </span>
            </div>
            <div className="text-xs text-neutral-500 text-center">
              {t("taxInclusive")}
            </div>
            <div className="pt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={t("promoCode")}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 border border-neutral-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-primary"
                />
                <Button
                  onClick={handleApplyPromo}
                  className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-full text-sm"
                >
                  {t("apply")}
                </Button>
              </div>
            </div>
            <Link href="/checkout" className="block mt-4">
              <Button className="w-full bg-orange hover:bg-orange/90 text-white py-3 rounded-full text-base font-semibold">
                {t("checkout")}
              </Button>
            </Link>
            <p className="text-center text-xs text-neutral-500 mt-2 flex items-center justify-center gap-1">
              <span>🔒</span> {t("securePayment")}
            </p>
          </div>
        </div>
      </div>

      {suggestedProducts.length > 0 && (
        <div className="mt-16">
          <ProductCarousel
            title={t("youMayAlsoLike")}
            products={suggestedProducts}
          />
        </div>
      )}
    </div>
  );
}

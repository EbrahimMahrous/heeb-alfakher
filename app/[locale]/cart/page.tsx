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
import { Trash2 } from "lucide-react";

// Local storage key for cart persistence
const CART_STORAGE_KEY = "heeb_cart";

// Helper: Save cart items to localStorage
const saveCartToLocalStorage = (items: any[]) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }
};

// Helper: Load cart items from localStorage
const loadCartFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse cart from localStorage", e);
      }
    }
  }
  return null;
};

const ProductMeta = ({ weight }: { weight?: string }) => {
  if (!weight) return null;
  return (
    <div className="inline-flex items-center gap-1 bg-neutral-100 border border-neutral-200 rounded-full px-2 py-0.5 w-fit">
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

export default function CartPage() {
  const { t, locale } = useTranslation("cart");
  const { items, fetchCart, removeItem, updateQuantity, totalPrice } =
    useCartStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [promoCode, setPromoCode] = useState("");

  const shippingCost = 35;
  const freeShippingThreshold = 500;
  const subtotal = totalPrice;
  const total =
    subtotal + (subtotal >= freeShippingThreshold ? 0 : shippingCost);
  const remainingForFree = Math.max(0, freeShippingThreshold - subtotal);
  const progressPercent = Math.min(
    100,
    (subtotal / freeShippingThreshold) * 100,
  );

  const cartProductIds = new Set(items.map((i) => i.id));
  const suggestedProducts = products
    .filter((p) => !cartProductIds.has(p.id))
    .slice(0, 8);

  // Load cart from API, then sync with localStorage
  useEffect(() => {
    const loadCart = async () => {
      try {
        await fetchCart();
      } catch (error) {
        console.error("Failed to fetch cart from API", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadCart();
  }, [fetchCart]);

  // Save cart items to localStorage whenever they change
  useEffect(() => {
    if (!isLoading) {
      if (items.length > 0) {
        saveCartToLocalStorage(items);
      } else {
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, [items, isLoading]);

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
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary transition">
          {t("home")}
        </Link>
        <span>/</span>
        <span className="text-dark font-medium">{t("title")}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Product List */}
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
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary */}
        <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-lg h-fit sticky top-24">
          <h2 className="text-center text-xl font-bold mb-4">
            {t("orderSummary")}
          </h2>

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

            {/* Total + Incl. Tax */}
            <div className="pt-2">
              <div className="flex justify-between text-lg font-bold">
                <span>{t("total")}</span>
                <span>
                  {total} {t("currency")}
                </span>
              </div>
              <div className="flex justify-end text-xs text-neutral-500 mt-0.5">
                <span>({t("taxInclusive")})</span>
              </div>
            </div>

            {/* Progress bar (above the promo code field) */}
            {remainingForFree > 0 && (
              <div
                className="mt-4 p-3 rounded-xl"
                style={{ backgroundColor: "#D1FAE5" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {t("freeShippingMessage", { amount: remainingForFree })}
                  </span>
                </div>
                <div className="relative w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-[#338A43] h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                  {/* Animated icon representing progress */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 transition-all duration-300"
                    style={{ left: `calc(${progressPercent}% - 8px)` }}
                  >
                    <Image
                      src="/icons/delivery-process.svg"
                      alt="delivery-truck"
                      width={16}
                      height={16}
                      className="drop-shadow-md"
                    />
                  </div>
                </div>
                <p className="text-xs text-neutral-600 mt-1 text-right">
                  {progressPercent.toFixed(0)}% مكتمل
                </p>
              </div>
            )}

            {/* Promotional code field with icon */}
            <div className="pt-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Image
                    src="/icons/coupon.svg"
                    alt="coupon"
                    width={18}
                    height={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    placeholder={t("promoCode")}
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full border border-neutral-300 rounded-full py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <Button
                  onClick={handleApplyPromo}
                  className="bg-[#0F172A] hover:bg-[#0F172A]/90 text-white px-4 py-2 rounded-full text-sm"
                >
                  {t("apply")}
                </Button>
              </div>
            </div>

            <Link href="/checkout" className="block mt-4">
              <Button className="w-full bg-[#338A43] hover:bg-[#338A43]/90 text-white py-3 rounded-full text-base font-semibold">
                {t("checkout")}
              </Button>
            </Link>

            {/* Secure payment with icon */}
            <p
              className="text-center text-xs mt-2 flex items-center justify-center gap-1"
              style={{ color: "#94A3B8" }}
            >
              <Image src="/icons/safe.svg" alt="safe" width={16} height={16} />
              <span>{t("securePayment")}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Products */}
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

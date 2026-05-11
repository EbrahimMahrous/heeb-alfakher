"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useTranslation } from "@/lib/useTranslation";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AddressModal from "@/components/AddressModal";
import { toast } from "sonner";

export interface Address {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  city?: string;
  area?: string;
  buildingNo?: string;
  streetAddress?: string;
  isDefault?: boolean;
  pinLocation?: string;
}

// ---------- Generate delivery day options (locale‑aware) ----------
const getDeliveryDays = (locale: string, t: (key: string) => string) => {
  const days = [];
  const today = new Date();

  for (let i = 1; i < 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);

    const dayName = date.toLocaleDateString(locale, { weekday: "long" });
    const monthName = date.toLocaleDateString(locale, { month: "short" });
    const dayNum = date.getDate();

    const label = i === 1 ? t("tomorrow") : `${dayName} ${dayNum} ${monthName}`;

    days.push({
      label,
      date: `${dayNum} ${monthName}`,
      fullDate: date.toISOString(),
      dayName,
    });
  }
  return days;
};

const timeSlots = ["01:00 PM - 06:00 PM", "06:00 PM - 09:00 PM"];
const DEFAULT_TIME_SLOT = timeSlots[0];

export default function CheckoutPage() {
  const { t, locale } = useTranslation("checkout");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();

  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Paid">("COD");
  const [promoCode, setPromoCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGift, setIsGift] = useState(false);

  const deliveryDays = useMemo(() => getDeliveryDays(locale, t), [locale, t]);

  const homeHref = `/${locale}`;
  const cartHref = `/${locale}/cart`;

  const shippingCost = 35;
  const freeShippingThreshold = 500;
  const subtotal = totalPrice;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = subtotal + shipping;

  const handleSaveAddress = (address: Address) => {
    setSelectedAddress(address);
    setEditingAddress(null);
    toast.success(t("addressSaved", { defaultValue: "تم حفظ العنوان بنجاح" }));
  };

  const openAddAddressModal = () => {
    setEditingAddress(null);
    setIsAddressModalOpen(true);
  };

  const openEditAddressModal = () => {
    setEditingAddress(selectedAddress);
    setIsAddressModalOpen(true);
  };

  const buildDeliveryDate = (): string | null => {
    if (!selectedDate) return null;
    const dayObj = deliveryDays.find((d) => d.label === selectedDate);
    if (!dayObj) return null;

    const timeMatch = DEFAULT_TIME_SLOT.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return null;
    let hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);
    const deliveryDate = new Date(dayObj.fullDate);
    deliveryDate.setHours(hour, minute, 0, 0);

    const year = deliveryDate.getFullYear();
    const month = String(deliveryDate.getMonth() + 1).padStart(2, "0");
    const day = String(deliveryDate.getDate()).padStart(2, "0");
    let hours = deliveryDate.getHours();
    const amPmLetter = hours >= 12 ? "PM" : "AM";
    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;
    const formattedHours = String(hours).padStart(2, "0");
    const formattedMinutes = String(deliveryDate.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${formattedHours}:${formattedMinutes} ${amPmLetter}`;
  };

  // ---------- Quick single check for order presence ----------
  const quickCheck = async (orderId: string): Promise<boolean> => {
    try {
      await new Promise((r) => setTimeout(r, 1000)); // tiny delay to let the backend persist
      const res = await fetch(`/api/check-order?order_id=${orderId}`);
      const data = await res.json();
      return !!data.found;
    } catch {
      return false;
    }
  };

  // ---------- Main submit handler ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAddress) {
      return;
    }

    if (!selectedDate) {
      toast.error(
        t("noDeliveryTimeAlert", { defaultValue: "الرجاء اختيار يوم التسليم" }),
      );
      return;
    }

    const area_name = selectedAddress.area?.trim() || "";
    if (!area_name) {
      toast.error(
        t("areaRequired", { defaultValue: "الرجاء اختيار المنطقة الفرعية" }),
      );
      return;
    }

    if (promoCode.trim()) {
      toast.warning(
        t("promoUnappliedWarning", {
          defaultValue:
            "لديك رمز ترويجي غير مطبق. الرجاء تطبيقه أولاً أو مسحه.",
        }),
      );
      return;
    }

    if (isGift && paymentMethod !== "Paid") {
      toast.warning(
        t("giftOnlineOnly", {
          defaultValue:
            "الهدايا تتطلب الدفع عبر الإنترنت. تم تحويل طريقة الدفع تلقائياً.",
        }),
      );
      setPaymentMethod("Paid");
      return;
    }

    setLoading(true);
    try {
      let phoneDigits = selectedAddress.phone.replace(/\D/g, "");
      if (!phoneDigits.startsWith("971")) {
        if (phoneDigits.startsWith("0"))
          phoneDigits = "971" + phoneDigits.substring(1);
        else phoneDigits = "971" + phoneDigits;
      }

      const validEmirates = [
        "Dubai",
        "Abu Dhabi",
        "Sharjah",
        "Ajman",
        "Umm Al Quwain",
        "Ras Al Khaimah",
        "Fujairah",
      ];
      let emirate_name = selectedAddress.city?.trim() || "";
      if (!validEmirates.includes(emirate_name)) emirate_name = "Dubai";

      const orderPayload = {
        customer_name: selectedAddress.fullName,
        mobile_number: phoneDigits,
        emirate_name,
        area_name,
        payment_type: paymentMethod,
        delivery_date: buildDeliveryDate(),
        items: items.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
        })),
        total_amount: total,
        gift_message: null,
        is_gift: isGift || undefined,
        instruction: null,
        pin_location: selectedAddress.pinLocation || undefined,
        locale,
      };

      // ----- COD flow -----
      if (paymentMethod === "COD") {
        const res = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(orderPayload),
        });
        const data = await res.json();
        if (!res.ok || (data.statusCode && data.statusCode !== 200)) {
          throw new Error(data.message || data.error || t("paymentError"));
        }

        const orderId = data.data?.order_id || data.order_id;
        if (!orderId) throw new Error("لم يتم استلام رقم الطلب");

        clearCart(); // clear cart immediately so the user can continue shopping

        // Quick single check – if it passes we show the order ID directly
        const found = await quickCheck(orderId);
        if (found) {
          toast.success(
            t("orderPlacedSuccessfully", {
              defaultValue: "تم تقديم الطلب بنجاح!",
            }),
          );
        } else {
          toast.info(
            t("orderReceived", { defaultValue: "تم استلام طلبك! رقم الطلب:" }) +
              " " +
              orderId,
          );
        }

        router.push(`/${locale}/order-success?order_id=${orderId}`);
        return;
      }

      // ----- Paid flow (unchanged) -----
      const orderRes = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });
      const orderData = await orderRes.json();
      if (
        !orderRes.ok ||
        (orderData.statusCode && orderData.statusCode !== 200)
      ) {
        throw new Error(
          orderData.message || orderData.error || t("paymentError"),
        );
      }

      const orderId = orderData.data?.order_id || orderData.order_id;
      if (orderId) localStorage.setItem("pending_order_id", String(orderId));

      const paymentPayload = {
        total,
        address: {
          fullName: selectedAddress.fullName,
          phone: selectedAddress.phone,
          city: selectedAddress.city,
          area: selectedAddress.area,
        },
        locale,
      };
      const payRes = await fetch("/api/create-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(paymentPayload),
      });
      const payData = await payRes.json();
      if (!payRes.ok || !payData.payment_url)
        throw new Error(payData.error || t("noPaymentUrl"));

      window.location.href = payData.payment_url;
    } catch (err: any) {
      console.error("Checkout Error:", err);
      toast.error(err.message || t("paymentError"));
    } finally {
      setLoading(false);
    }
  };

  const handleGiftChange = (checked: boolean) => {
    setIsGift(checked);
    if (checked) setPaymentMethod("Paid");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href={homeHref} className="hover:text-primary transition-colors">
          {t("home")}
        </Link>
        <span>/</span>
        <Link href={cartHref} className="hover:text-primary transition-colors">
          {t("cart")}
        </Link>
        <span>/</span>
        <span className="text-dark font-medium">{t("title")}</span>
      </div>

      <h1 className="text-2xl font-bold text-primary mb-6">
        {t("billingInfo")}
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form column */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Delivery address */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {t("deliveryAddress")}
                </h2>
              </div>
              {selectedAddress ? (
                <div className="bg-neutral-50 p-4 rounded-xl space-y-2">
                  <p className="font-medium">{selectedAddress.fullName}</p>
                  <p className="text-neutral-600">{selectedAddress.address}</p>
                  <p className="text-neutral-600">{selectedAddress.phone}</p>
                  <button
                    type="button"
                    onClick={openEditAddressModal}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    {t("changeAddress")}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 bg-neutral-50 rounded-xl">
                  <p className="text-neutral-500 mb-3">{t("noAddressAdded")}</p>
                  <button
                    onClick={openAddAddressModal}
                    className="inline-block bg-primary text-white px-6 py-2 rounded-full text-sm"
                  >
                    {t("addNewAddress")}
                  </button>
                </div>
              )}
            </div>

            {selectedAddress && (
              <>
                {/* Schedule delivery */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">
                    {t("scheduleDelivery")}
                  </h2>
                  <div>
                    <p className="text-sm font-medium mb-2 text-gray-700">
                      {t("selectDay")}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {deliveryDays.map((day) => (
                        <button
                          key={day.label}
                          type="button"
                          onClick={() => setSelectedDate(day.label)}
                          className={`px-4 py-2 rounded-full border transition-all ${
                            selectedDate === day.label
                              ? "bg-primary text-white border-primary shadow-md scale-105"
                              : "bg-white border-neutral-300 hover:border-primary hover:shadow-sm hover:scale-105"
                          }`}
                        >
                          <div className="text-center">
                            <div className="font-medium whitespace-nowrap">
                              {day.label}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Gift option */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">{t("isGift")}</h2>
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={isGift}
                      onChange={(e) => handleGiftChange(e.target.checked)}
                      className="w-5 h-5 accent-[#338A43]"
                    />
                    <span className="text-base font-medium">
                      {t("sendAsGift")}
                    </span>
                  </label>
                  {isGift && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                      <p>
                        {t("giftPaymentNote", {
                          defaultValue:
                            "الدفع أونلاين مطلوب للهدايا لضمان إتمام الطلب",
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Payment methods */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
                  <h2 className="text-xl font-semibold mb-4">{t("payment")}</h2>
                  <div className="space-y-3">
                    {[
                      {
                        value: "COD",
                        icon: "/icons/cash.svg",
                        label: "cashOnDelivery",
                      },
                      {
                        value: "Paid",
                        icon: "/icons/online.svg",
                        label: "creditCard",
                      },
                    ].map((method) => (
                      <label
                        key={method.value}
                        className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg ${
                          paymentMethod === method.value
                            ? "bg-primary/5"
                            : "hover:bg-gray-50"
                        } ${isGift && method.value === "COD" ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <input
                          type="radio"
                          value={method.value}
                          checked={paymentMethod === method.value}
                          onChange={(e) =>
                            !isGift || method.value !== "COD"
                              ? setPaymentMethod(
                                  e.target.value as "COD" | "Paid",
                                )
                              : null
                          }
                          disabled={isGift && method.value === "COD"}
                          className="w-4 h-4 accent-primary"
                        />
                        <Image
                          src={method.icon}
                          alt={method.label}
                          width={24}
                          height={24}
                        />
                        <span className="font-medium">{t(method.label)}</span>
                      </label>
                    ))}
                  </div>
                  {paymentMethod === "Paid" && (
                    <div className="mt-4 p-4 bg-neutral-50 rounded-xl">
                      <p className="text-sm text-gray-500 text-center">
                        {t("securePaymentRedirect")}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#338A43] hover:bg-[#338A43]/90 text-white py-3 rounded-full text-lg font-semibold transition-all hover:shadow-lg"
                >
                  {loading ? t("redirecting") : t("confirmOrder")}
                </Button>
              </>
            )}
          </form>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-lg sticky top-24">
            <h2 className="text-xl font-bold mb-4">{t("orderSummary")}</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm group">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden relative shrink-0">
                    <Image
                      src={item.image || "/product-img.png"}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1">{item.name}</p>
                    <p className="text-neutral-500 text-xs">
                      {item.quantity} × {item.discountedPrice || item.price}{" "}
                      {t("currency")}
                    </p>
                  </div>
                  <div className="font-medium">
                    {(item.discountedPrice || item.price) * item.quantity}{" "}
                    {t("currency")}
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-2 text-sm border-t pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600">{t("subtotal")}</span>
                <span className="font-medium">
                  {subtotal} {t("currency")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t("shipping")}</span>
                <span className="font-medium">
                  {shipping === 0 ? t("free") : `${shipping} ${t("currency")}`}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t border-dashed mt-2">
                <span>{t("total")}</span>
                <span className="text-primary">
                  {total} {t("currency")}
                </span>
              </div>
              <div className="text-end text-xs text-neutral-500">
                ({t("taxInclusive")})
              </div>
            </div>
            <div className="mt-6 pt-4 border-t text-center flex items-center justify-center gap-2 text-xs text-[#94A3B8]">
              <Image
                src="/icons/safe.svg"
                alt="secure"
                width={16}
                height={16}
              />
              <span>{t("securePayment")}</span>
            </div>
          </div>
        </div>
      </div>

      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        existingAddress={editingAddress}
      />
    </div>
  );
}

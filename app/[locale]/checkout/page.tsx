"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { useTranslation } from "@/lib/useTranslation";
import Button from "@/components/ui/button";
import { useRouter } from "next/navigation";
import AddressModal from "@/components/AddressModal";
import { PhoneCall, DoorOpen, PackageCheck } from "lucide-react";
import { toast } from "sonner";

// ---------- Local storage helpers ----------
const CHECKOUT_STORAGE_KEY = "heeb_checkout_data";

const saveCheckoutToLocalStorage = (data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data));
  }
};

const loadCheckoutFromLocalStorage = () => {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse checkout data from localStorage", e);
      }
    }
  }
  return null;
};

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

// ---------- Generate delivery day options (Arabic) ----------
const getDeliveryDays = () => {
  const days = [];
  const today = new Date();
  const weekdaysAr = [
    "الأحد",
    "الإثنين",
    "الثلاثاء",
    "الأربعاء",
    "الخميس",
    "الجمعة",
    "السبت",
  ];

  for (let i = 0; i < 4; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    const dayName = weekdaysAr[date.getDay()];
    const dayNum = date.getDate();
    const monthName = date.toLocaleDateString("ar-EG", { month: "short" });

    let label = "";
    if (i === 0) label = "اليوم";
    else if (i === 1) label = "غداً";
    else if (i === 2) label = `${dayName} ${dayNum} ${monthName}`;
    else label = `${dayName} ${dayNum} ${monthName}`;

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

const deliveryOptionsGrid = [
  { id: "call", labelKey: "callBeforeDelivery", icon: "/icons/call-ring.svg" },
  { id: "door", labelKey: "leaveAtDoor", icon: "/icons/door.svg" },
  { id: "boxes", labelKey: "returnHibBoxes", icon: "/icons/box.svg" },
];

// ---------- Main component ----------
export default function CheckoutPage() {
  const { t, locale } = useTranslation("checkout");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();

  // Holds the address being edited (null when adding a new one)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>(
    null,
  );
  const [giftMessage, setGiftMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"COD" | "Paid">("COD");

  const [deliveryDays] = useState(getDeliveryDays());
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Load saved checkout data on mount
  useEffect(() => {
    const savedData = loadCheckoutFromLocalStorage();
    if (savedData) {
      if (savedData.selectedAddress)
        setSelectedAddress(savedData.selectedAddress);
      if (savedData.selectedDate) setSelectedDate(savedData.selectedDate);
      if (savedData.selectedTimeSlot)
        setSelectedTimeSlot(savedData.selectedTimeSlot);
      if (savedData.selectedInstruction)
        setSelectedInstruction(savedData.selectedInstruction);
      if (savedData.giftMessage !== undefined)
        setGiftMessage(savedData.giftMessage);
      if (savedData.paymentMethod) setPaymentMethod(savedData.paymentMethod);
    }
    setIsInitialLoad(false);
  }, []);

  // Persist checkout data to localStorage
  useEffect(() => {
    if (isInitialLoad) return;
    const checkoutData = {
      selectedAddress,
      selectedDate,
      selectedTimeSlot,
      selectedInstruction,
      giftMessage,
      paymentMethod,
    };
    saveCheckoutToLocalStorage(checkoutData);
  }, [
    selectedAddress,
    selectedDate,
    selectedTimeSlot,
    selectedInstruction,
    giftMessage,
    paymentMethod,
    isInitialLoad,
  ]);

  const shippingCost = 35;
  const freeShippingThreshold = 500;
  const subtotal = totalPrice;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = subtotal + shipping;

  const handleInstructionSelect = (id: string) => {
    setSelectedInstruction((prev) => (prev === id ? null : id));
  };

  const handleGiftToggle = () => {
    setGiftMessage((prev) => (prev === "" ? " " : ""));
  };

  // ✅ When user saves a new or edited address
  const handleSaveAddress = (address: Address) => {
    setSelectedAddress(address);
    setEditingAddress(null); // clear editing mode
    toast.success(t("addressSaved", { defaultValue: "تم حفظ العنوان بنجاح" }));
  };

  // ✅ Open modal to add a new address
  const openAddAddressModal = () => {
    setErrorMessage(""); // hide any previous submit error
    setEditingAddress(null); // not editing
    setIsAddressModalOpen(true);
  };

  // ✅ Open modal to edit the current address
  const openEditAddressModal = () => {
    setErrorMessage(""); // hide errors
    setEditingAddress(selectedAddress); // pass current address to modal
    setIsAddressModalOpen(true);
  };

  // Helper: build a formatted delivery date string expected by the API
  const buildDeliveryDate = (): string | null => {
    if (!selectedDate || !selectedTimeSlot) return null;
    const dayObj = deliveryDays.find((d) => d.label === selectedDate);
    if (!dayObj) return null;

    const timeMatch = selectedTimeSlot.match(/(\d{2}):(\d{2})\s*(AM|PM)/i);
    if (!timeMatch) return null;
    let hour = parseInt(timeMatch[1], 10);
    const minute = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3].toUpperCase();

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

  // ---------- Submit the order ----------
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!selectedAddress) {
      const msg = t("noAddressAlert", {
        defaultValue: "الرجاء إضافة عنوان التسليم أولاً",
      });
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const area_name = selectedAddress.area?.trim() || "";
    if (!area_name) {
      const msg = t("areaRequired", {
        defaultValue: "الرجاء اختيار المنطقة الفرعية",
      });
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!selectedDate || !selectedTimeSlot) {
      const msg = t("noDeliveryTimeAlert", {
        defaultValue: "الرجاء اختيار يوم ووقت التسليم",
      });
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const deliveryDateFormatted = buildDeliveryDate();
    if (!deliveryDateFormatted) {
      const msg = "Invalid delivery date/time";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    // Phone number is already sanitized in AddressModal, but just in case it was loaded from old data
    let phoneDigits = selectedAddress.phone.replace(/\D/g, "");
    if (!phoneDigits.startsWith("971")) {
      if (phoneDigits.startsWith("0")) {
        phoneDigits = "971" + phoneDigits.substring(1);
      } else {
        phoneDigits = "971" + phoneDigits;
      }
    }
    const mobile_number = phoneDigits;

    const customer_name = selectedAddress.fullName;

    // Validate emirate (should always be valid because we fill it automatically)
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
    if (!validEmirates.includes(emirate_name)) {
      emirate_name = "Dubai";
      toast.info(
        t("emirateAdjusted", {
          defaultValue: "تم تعيين الإمارة إلى دبي لأن المدينة غير معروفة",
        }),
      );
    }

    const orderPayload = {
      customer_name,
      mobile_number,
      emirate_name,
      area_name,
      payment_type: paymentMethod,
      delivery_date: deliveryDateFormatted,
      items: items.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      total_amount: total,
      gift_message: giftMessage.trim() || null,
      instruction: selectedInstruction,
      pin_location: selectedAddress.pinLocation || undefined,
    };

    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok || data.statusCode !== 200) {
        const errMsg = data.message || data.error || t("paymentError");
        console.error("Checkout API Error:", errMsg);
        throw new Error(errMsg);
      }

      clearCart();
      localStorage.removeItem(CHECKOUT_STORAGE_KEY);
      toast.success(
        t("orderPlacedSuccessfully", { defaultValue: "تم تقديم الطلب بنجاح!" }),
      );
      router.push(`/${locale}/order-success`);
    } catch (err: any) {
      console.error("Checkout Error:", err);
      const message = err.message || t("paymentError");
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-primary transition-colors">
          {t("home")}
        </Link>
        <span>/</span>
        <Link href="/cart" className="hover:text-primary transition-colors">
          {t("cart")}
        </Link>
        <span>/</span>
        <span className="text-dark font-medium">{t("title")}</span>
      </div>

      <h1 className="text-2xl font-bold text-primary mb-6">
        {t("billingInfo")}
      </h1>

      {/* Error banner */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <svg
            className="w-5 h-5 shrink-0"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span className="text-sm">{errorMessage}</span>
          <button
            onClick={() => setErrorMessage("")}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form column */}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Delivery address */}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
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
                    className="inline-block bg-primary text-white px-6 py-2 rounded-full text-sm hover:bg-primary/90 transition-all hover:shadow-md"
                  >
                    {t("addNewAddress")}
                  </button>
                </div>
              )}
            </div>

            {selectedAddress && (
              <>
                {/* Schedule delivery */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-semibold mb-4">
                    {t("scheduleDelivery")}
                  </h2>
                  <div className="space-y-4">
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
                            className={`px-4 py-2 rounded-full border transition-all duration-200 ${
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
                    {selectedDate && (
                      <div>
                        <p className="text-sm font-medium mb-2 text-gray-700">
                          {t("selectTimeSlot")}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setSelectedTimeSlot(slot)}
                              className={`px-4 py-2 rounded-full border transition-all duration-200 ${
                                selectedTimeSlot === slot
                                  ? "bg-primary text-white border-primary shadow-md scale-105"
                                  : "bg-white border-neutral-300 hover:border-primary hover:shadow-sm hover:scale-105"
                              }`}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Delivery Instructions */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-semibold mb-4">
                    {t("deliveryInstructions")}
                  </h2>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {deliveryOptionsGrid.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleInstructionSelect(opt.id)}
                        className={`group flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                          selectedInstruction === opt.id
                            ? "border-[#338A43] bg-[#338A43]/5 shadow-md scale-105"
                            : "border-neutral-200 bg-white hover:border-[#338A43] hover:shadow-md hover:scale-105"
                        }`}
                      >
                        <div className="w-12 h-12 flex items-center justify-center mb-2">
                          {opt.id === "call" && (
                            <PhoneCall
                              size={28}
                              className={`transition-all ${
                                selectedInstruction === opt.id
                                  ? "text-[#338A43]"
                                  : "text-neutral-500 group-hover:text-[#338A43]"
                              }`}
                            />
                          )}
                          {opt.id === "door" && (
                            <DoorOpen
                              size={28}
                              className={`transition-all ${
                                selectedInstruction === opt.id
                                  ? "text-[#338A43]"
                                  : "text-neutral-500 group-hover:text-[#338A43]"
                              }`}
                            />
                          )}
                          {opt.id === "boxes" && (
                            <PackageCheck
                              size={28}
                              className={`transition-all ${
                                selectedInstruction === opt.id
                                  ? "text-[#338A43]"
                                  : "text-neutral-500 group-hover:text-[#338A43]"
                              }`}
                            />
                          )}
                        </div>
                        <span className="text-sm text-center font-medium">
                          {t(opt.labelKey)}
                        </span>
                        {selectedInstruction === opt.id && (
                          <div className="mt-1 text-[#338A43] text-xs font-bold">
                            ✓
                          </div>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Gift Message */}
                  <div className="border-t pt-4">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={giftMessage !== ""}
                        onChange={handleGiftToggle}
                        className="w-5 h-5 accent-[#338A43] transition-transform group-hover:scale-110"
                      />
                      <span className="text-base font-medium group-hover:text-[#338A43] transition-colors">
                        {t("addGiftMessage")}
                      </span>
                    </label>
                    {giftMessage !== "" && (
                      <div className="mt-3 mr-8 animate-fadeIn">
                        <textarea
                          placeholder={t("giftMessagePlaceholder")}
                          value={giftMessage === " " ? "" : giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          rows={3}
                          className="w-full border border-neutral-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#338A43] transition-all"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-semibold mb-4">{t("payment")}</h2>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {[
                        {
                          value: "COD",
                          icon: "/icons/cash.svg",
                          label: "cashOnDelivery",
                        },
                        {
                          value: "COD",
                          icon: "/icons/cash-visa.svg",
                          label: "cardOnDelivery",
                        },
                        {
                          value: "Paid",
                          icon: "/icons/online.svg",
                          label: "creditCard",
                        },
                      ].map((method) => (
                        <label
                          key={method.value + method.label}
                          className={`flex items-center gap-3 cursor-pointer p-2 rounded-lg transition-all ${
                            paymentMethod === method.value
                              ? "bg-primary/5"
                              : "hover:bg-gray-50"
                          }`}
                        >
                          <input
                            type="radio"
                            value={method.value}
                            checked={paymentMethod === method.value}
                            onChange={(e) =>
                              setPaymentMethod(e.target.value as "COD" | "Paid")
                            }
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
                      <div className="mt-4 p-4 bg-neutral-50 rounded-xl animate-fadeIn">
                        <p className="text-sm text-gray-500 text-center">
                          {t("securePaymentRedirect")}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Confirm button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#338A43] hover:bg-[#338A43]/90 text-white py-3 rounded-full text-lg font-semibold transition-all hover:shadow-lg transform hover:scale-[1.02] active:scale-100 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? t("redirecting") : t("confirmOrder")}
                </Button>
              </>
            )}
          </form>
        </div>

        {/* Order summary column */}
        <div className="lg:col-span-1 order-1 lg:order-2">
          <div className="bg-white border border-neutral-200 p-6 rounded-2xl shadow-lg sticky top-24 hover:shadow-xl transition-shadow">
            <h2 className="text-xl font-bold mb-4">{t("orderSummary")}</h2>
            <div className="space-y-3 max-h-64 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 text-sm group">
                  <div className="w-12 h-12 bg-neutral-100 rounded-lg overflow-hidden relative shrink-0 group-hover:shadow-md transition-all">
                    <Image
                      src={item.image || "/product-img.png"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium line-clamp-1 group-hover:text-primary transition-colors">
                      {item.name}
                    </p>
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
              <div className="text-right text-xs text-neutral-500">
                ({t("taxInclusive")})
              </div>
            </div>
            <div
              className="mt-6 pt-4 border-t text-center flex items-center justify-center gap-2 text-xs"
              style={{ color: "#94A3B8" }}
            >
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

      {/* Address modal (supports both add and edit) */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
        existingAddress={editingAddress}
      />
    </div>
  );
}

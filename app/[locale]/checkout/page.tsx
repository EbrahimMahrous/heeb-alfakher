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

// Local storage key for checkout data persistence
const CHECKOUT_STORAGE_KEY = "heeb_checkout_data";

// Helper: Save checkout data to localStorage
const saveCheckoutToLocalStorage = (data: any) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(data));
  }
};

// Helper: Load checkout data from localStorage
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

interface Address {
  id: string;
  fullName: string;
  address: string;
  phone: string;
  city?: string;
}

// A function to dynamically generate delivery days with day and date display.
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
      label: label,
      date: `${dayNum} ${monthName}`,
      fullDate: date.toISOString(),
      dayName: dayName,
    });
  }
  return days;
};

const timeSlots = ["01:00 PM - 06:00 PM", "06:00 PM - 09:00 PM"];

// Delivery options - three horizontal squares (only one choice)
const deliveryOptionsGrid = [
  { id: "call", labelKey: "callBeforeDelivery", icon: "/icons/call-ring.svg" },
  { id: "door", labelKey: "leaveAtDoor", icon: "/icons/door.svg" },
  { id: "boxes", labelKey: "returnHibBoxes", icon: "/icons/box.svg" },
];

export default function CheckoutPage() {
  const { t } = useTranslation("checkout");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const { items, totalPrice, clearCart } = useCartStore();
  const router = useRouter();

  // State for checkout form
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [selectedInstruction, setSelectedInstruction] = useState<string | null>(
    null,
  );
  const [giftMessage, setGiftMessage] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [cardNumber, setCardNumber] = useState("");
  const [cvv, setCvv] = useState("");
  const [expiry, setExpiry] = useState("");

  const [deliveryDays, setDeliveryDays] = useState(getDeliveryDays());
  const [isInitialLoad, setIsInitialLoad] = useState(true); // Prevent overwriting saved data on first render

  // Load saved checkout data from localStorage on mount
  useEffect(() => {
    const savedData = loadCheckoutFromLocalStorage();
    if (savedData) {
      // Restore all fields if they exist
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
      if (savedData.cardNumber) setCardNumber(savedData.cardNumber);
      if (savedData.cvv) setCvv(savedData.cvv);
      if (savedData.expiry) setExpiry(savedData.expiry);
    } else {
      // Default dummy address for testing purposes only - can be removed later
      const dummyAddress: Address = {
        id: "dummy_1",
        fullName: "أحمد محمد",
        address: "شارع الجميرا، فيلا 3، دبي",
        phone: "0501234567",
        city: "دبي",
      };
      setSelectedAddress(dummyAddress);
    }
    setIsInitialLoad(false);
  }, []);

  // Save checkout data to localStorage whenever any relevant state changes (after initial load)
  useEffect(() => {
    if (isInitialLoad) return;
    const checkoutData = {
      selectedAddress,
      selectedDate,
      selectedTimeSlot,
      selectedInstruction,
      giftMessage,
      paymentMethod,
      cardNumber,
      cvv,
      expiry,
    };
    saveCheckoutToLocalStorage(checkoutData);
  }, [
    selectedAddress,
    selectedDate,
    selectedTimeSlot,
    selectedInstruction,
    giftMessage,
    paymentMethod,
    cardNumber,
    cvv,
    expiry,
    isInitialLoad,
  ]);

  const shippingCost = 35;
  const freeShippingThreshold = 500;
  const subtotal = totalPrice;
  const shipping = subtotal >= freeShippingThreshold ? 0 : shippingCost;
  const total = subtotal + shipping;

  // Choose only one of the delivery instructions
  const handleInstructionSelect = (id: string) => {
    if (selectedInstruction === id) {
      setSelectedInstruction(null);
    } else {
      setSelectedInstruction(id);
    }
  };

  const handleGiftToggle = () => {
    if (giftMessage === "") setGiftMessage(" ");
    else setGiftMessage("");
  };

  const handleSaveAddress = (address: Address) => {
    setSelectedAddress(address);
    // The useEffect will automatically save to localStorage
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      alert("الرجاء إضافة عنوان التسليم أولاً");
      return;
    }
    if (!selectedDate || !selectedTimeSlot) {
      alert("الرجاء اختيار يوم ووقت التسليم");
      return;
    }
    if (paymentMethod === "credit_card" && (!cardNumber || !cvv || !expiry)) {
      alert("الرجاء إدخال بيانات البطاقة كاملة");
      return;
    }
    console.log({
      address: selectedAddress,
      deliveryDate: selectedDate,
      timeSlot: selectedTimeSlot,
      instruction: selectedInstruction,
      giftMessage: giftMessage.trim() === "" ? null : giftMessage,
      paymentMethod,
      cardDetails:
        paymentMethod === "credit_card" ? { cardNumber, cvv, expiry } : null,
    });
    alert(`تم إتمام الطلب بنجاح`);
    // Clear checkout data from localStorage after successful order
    localStorage.removeItem(CHECKOUT_STORAGE_KEY);
    clearCart();
    router.push("/");
  };

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

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Right column: The model*/}
        <div className="lg:col-span-2 order-2 lg:order-1">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Delivery address*/}
            <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  {t("deliveryAddress")}
                </h2>
                {selectedAddress && selectedAddress.id === "dummy_1" && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddress(null);
                      // No need to manually remove localStorage here - useEffect will handle saving null
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    إزالة التجريبي
                  </button>
                )}
              </div>
              {selectedAddress ? (
                <div className="bg-neutral-50 p-4 rounded-xl space-y-2">
                  <p className="font-medium">{selectedAddress.fullName}</p>
                  <p className="text-neutral-600">{selectedAddress.address}</p>
                  <p className="text-neutral-600">{selectedAddress.phone}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAddress(null);
                    }}
                    className="text-sm text-red-500 hover:text-red-700 transition-colors"
                  >
                    {t("changeAddress")}
                  </button>
                </div>
              ) : (
                <div className="text-center py-8 bg-neutral-50 rounded-xl">
                  <p className="text-neutral-500 mb-3">{t("noAddressAdded")}</p>
                  <button
                    onClick={() => setIsAddressModalOpen(true)}
                    className="inline-block bg-primary text-white px-6 py-2 rounded-full text-sm hover:bg-primary/90 transition-all hover:shadow-md"
                  >
                    {t("addNewAddress")}
                  </button>
                </div>
              )}
            </div>

            {/* The remaining sections (delivery time, delivery instructions, payment) remain unchanged.*/}
            {selectedAddress && (
              <>
                {/* 1. Book a delivery time */}
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

                {/* 2. Delivery Instructions */}
                {/* 2. Delivery Instructions */}
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
                        {/* Icon */}
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

                        {/* Label */}
                        <span className="text-sm text-center font-medium">
                          {t(opt.labelKey)}
                        </span>

                        {/* Check */}
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

                {/* 3. Payment */}
                <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <h2 className="text-xl font-semibold mb-4">{t("payment")}</h2>
                  <div className="space-y-4">
                    <div className="space-y-3">
                      {[
                        {
                          value: "cash_on_delivery",
                          icon: "/icons/cash.svg",
                          label: "cashOnDelivery",
                        },
                        {
                          value: "card_on_delivery",
                          icon: "/icons/cash-visa.svg",
                          label: "cardOnDelivery",
                        },
                        {
                          value: "credit_card",
                          icon: "/icons/online.svg",
                          label: "creditCard",
                        },
                      ].map((method) => (
                        <label
                          key={method.value}
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
                            onChange={(e) => setPaymentMethod(e.target.value)}
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

                    {paymentMethod === "credit_card" && (
                      <div className="mt-4 p-4 bg-neutral-50 rounded-xl space-y-3 animate-fadeIn">
                        <div className="relative">
                          <Image
                            src="/icons/cash-visa.svg"
                            alt="card"
                            width={20}
                            height={20}
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                          />
                          <input
                            type="text"
                            placeholder={t("cardNumber")}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value)}
                            className="w-full border border-neutral-300 rounded-lg py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            required={paymentMethod === "credit_card"}
                          />
                        </div>
                        <div className="flex gap-3">
                          <input
                            type="text"
                            placeholder="CVV"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            className="flex-1 border border-neutral-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            required={paymentMethod === "credit_card"}
                          />
                          <input
                            type="text"
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="flex-1 border border-neutral-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                            required={paymentMethod === "credit_card"}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#338A43] hover:bg-[#338A43]/90 text-white py-3 rounded-full text-lg font-semibold transition-all hover:shadow-lg transform hover:scale-[1.02] active:scale-100"
                >
                  {t("confirmOrder")}
                </Button>
              </>
            )}
          </form>
        </div>

        {/* Left column: Order summary */}
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

      {/* Adding the model */}
      <AddressModal
        isOpen={isAddressModalOpen}
        onClose={() => setIsAddressModalOpen(false)}
        onSave={handleSaveAddress}
      />
    </div>
  );
}

"use client";
import { useTranslation } from "@/lib/useTranslation";
import { MessageCircle } from "lucide-react";

const PHONE_NUMBER = "971523630501";
const WHATSAPP_LINK = `https://wa.me/${PHONE_NUMBER}`;

export default function WhatsAppButton() {
  const { locale } = useTranslation("common");
  const isArabic = locale === "ar";
  const welcomeMessage = isArabic
    ? "مرحباً! أرغب في الاستفسار عن منتجاتكم."
    : "Hello! I would like to inquire about your products.";

  const encodedMessage = encodeURIComponent(welcomeMessage);
  const finalLink = `${WHATSAPP_LINK}?text=${encodedMessage}`;

  return (
    <a
      href={finalLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 inset-e-6 z-50 bg-[#25D366] hover:bg-[#20b859] text-white rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2"
      aria-label={isArabic ? "الدردشة عبر واتساب" : "Chat on WhatsApp"}
    >
      <MessageCircle className="w-8 h-8 md:w-9 md:h-9" />
      {/* Notification badge also uses logical end */}
      <span className="absolute -top-1 -inset-e-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 animate-pulse">
        1
      </span>
    </a>
  );
}

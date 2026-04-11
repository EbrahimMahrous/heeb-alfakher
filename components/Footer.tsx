"use client";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "@/lib/useTranslation";
import { FaWhatsapp, FaYoutube, FaInstagram, FaFacebook } from "react-icons/fa";

export default function Footer() {
  const { t, locale } = useTranslation("common");
  const isRtl = locale === "ar";

  return (
    <footer className="bg-[#338A43] text-white py-10 mt-12">
      <div className="container mx-auto px-4">
        {/* 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* First column: Logo + Description + Contact icons */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Image
                src="/logo-heeb.svg"
                alt="Heeb Al Fakher"
                width={50}
                height={50}
                className="h-12 w-auto"
              />
            </div>
            <p className="text-sm text-white/90 leading-relaxed mb-4">
              {t("companyDescription")}
            </p>
            <div>
              <p className="font-semibold mb-2">{t("contactUsFooter")}</p>
              <div className="flex gap-3 text-xl">
                <a href="#" className="hover:opacity-80 transition">
                  <FaWhatsapp />
                </a>
                <a href="#" className="hover:opacity-80 transition">
                  <FaYoutube />
                </a>
                <a href="#" className="hover:opacity-80 transition">
                  <FaInstagram />
                </a>
                <a href="#" className="hover:opacity-80 transition">
                  <FaFacebook />
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Explore */}
          <div>
            <h4 className="font-semibold text-lg mb-3">{t("explore")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:underline transition">
                  {t("aboutInfo")}
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:underline transition">
                  {t("returnsPolicy")}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:underline transition">
                  {t("careers")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Third column: Support */}
          <div>
            <h4 className="font-semibold text-lg mb-3">{t("support")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:underline transition">
                  {t("helpCenter")}
                </Link>
              </li>
              <li>
                <Link
                  href="/delivery-areas"
                  className="hover:underline transition"
                >
                  {t("deliveryAreas")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:underline transition">
                  {t("faqFooter")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Help Center + Contact Information + Business Hours */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-wrap gap-4">
              {/* Rectangle 1: Email */}
              <div className="flex items-center gap-3 bg-green-500/20 rounded-xl p-4 flex-1 min-w-50">
                <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full">
                  <Image
                    src="/icons/mail.svg"
                    alt="mail"
                    width={20}
                    height={20}
                    className="invert"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-md">{t("helpCenter")}</h4>
                  <a
                    href="mailto:info@mail.ae"
                    className="hover:underline text-sm block"
                  >
                    info@mail.ae
                  </a>
                </div>
              </div>

              {/* Rectangle 2: Phone */}
              <div className="flex items-center gap-3 bg-green-500/20 rounded-xl p-4 flex-1 min-w-50">
                <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full">
                  <Image
                    src="/icons/call.svg"
                    alt="call"
                    width={20}
                    height={20}
                    className="invert"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-md">{t("phoneSupport")}</h4>
                  <a
                    href="tel:800XXXXXXX"
                    className="hover:underline text-sm block"
                  >
                    0523630501
                  </a>
                </div>
              </div>

              {/* Rectangle 3: Working Times */}
              <div className="flex items-center gap-3 bg-green-500/20 rounded-xl p-4 flex-1 min-w-50">
                <div className="flex items-center justify-center w-10 h-10 bg-green-500/20 rounded-full ">
                  <Image
                    src="/icons/time.svg"
                    alt="time"
                    width={20}
                    height={20}
                    className="invert"
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-md">{t("allDays")}</h4>
                  <span className="text-sm block">{t("timeRange")}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="pt-6 mt-6 border-t border-white/20 text-center text-sm text-white/80">
          © {new Date().getFullYear()} {isRtl ? "حيب الفاخر" : "Heeb Al Fakher"}{" "}
          - {t("copyright")}
        </div>
      </div>
    </footer>
  );
}

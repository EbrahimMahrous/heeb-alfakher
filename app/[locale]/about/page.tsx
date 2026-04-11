"use client";

import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "@/lib/useTranslation";

export default function AboutPage() {
  const { t, locale } = useTranslation("about");

  return (
    <div className="min-h-screen flex flex-col">
      {/* Content */}
      <div className="container mx-auto px-4 py-8 flex-1">
        {/* breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition">
            {t("home")}
          </Link>

          <span>›</span>

          <span className="text-primary font-medium">{t("title")}</span>
        </div>

        {/* the address */}
        <h1 className="text-3xl font-bold text-primary mb-6">{t("title")}</h1>

        {/* Image */}
        <div className="relative w-full h-65 rounded-2xl overflow-hidden mb-10">
          <Image
            src="/product-img.png"
            alt="about"
            fill
            sizes="100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h2 className="text-white text-2xl font-bold">{t("hero")}</h2>
          </div>
        </div>

        {/* Two columns */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Our Story */}
          <div>
            <h2 className="text-2xl font-bold mb-4">{t("story")}</h2>

            <p className="text-gray-700 leading-relaxed">{t("storyDesc")}</p>
          </div>

          {/* Values ​​*/}
          <div className="bg-green-50/60 p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-6">{t("values")}</h2>

            <div className="space-y-6">
              {/* Sustainability */}
              <div className="flex gap-4">
                <div className="bg-[#338A43] p-3 rounded-lg">
                  <Image
                    src="/icons/sustainability.svg"
                    alt="sustain"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{t("sustainability")}</h3>
                  <p className="text-gray-600 text-sm">
                    {t("sustainabilityDesc")}
                  </p>
                </div>
              </div>

              {/* speed */}
              <div className="flex gap-4">
                <div className="bg-[#338A43] p-3 rounded-lg">
                  <Image
                    src="/icons/delivery.svg"
                    alt="delivery"
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{t("speed")}</h3>
                  <p className="text-gray-600 text-sm">{t("speedDesc")}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition">
            {t("home")}
          </Link>
          <span>›</span>
          <span className="text-primary font-medium">{t("title")}</span>
        </div>

        {/* Page title */}
        <h1 className="text-3xl font-bold text-primary mb-6">{t("title")}</h1>

        {/* Hero Banner – responsive using aspect ratio 1180:324 */}
        {/* Outer container uses padding-bottom to maintain the ratio regardless of screen width */}
        <div
          className="relative w-full overflow-hidden rounded-2xl mb-10"
          style={{ paddingBottom: "27.457%" }}
        >
          <Image
            src="/banners/about-us.jpeg"
            alt="about"
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          {/* Overlay text – centered over the image */}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
            <h2 className="text-white text-2xl md:text-3xl font-bold text-center px-4">
              {t("hero")}
            </h2>
          </div>
        </div>

        {/* Two columns grid */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* Left column – Our Story */}
          <div>
            <h2 className="text-2xl font-bold mb-4">{t("story")}</h2>
            <p className="text-gray-700 leading-relaxed">{t("storyDesc")}</p>
          </div>

          {/* Right column – Values */}
          <div className="bg-green-50/60 p-6 rounded-xl">
            <h2 className="text-2xl font-bold mb-6">{t("values")}</h2>
            <div className="space-y-6">
              {/* Sustainability value */}
              <div className="flex gap-4">
                <div className="bg-[#338A43] p-2 rounded-lg shrink-0">
                  <Image
                    src="/icons/sustainability.svg"
                    alt="sustainability icon"
                    width={44}
                    height={44}
                    className="w-11 h-11"
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{t("sustainability")}</h3>
                  <p className="text-gray-600 text-sm">
                    {t("sustainabilityDesc")}
                  </p>
                </div>
              </div>

              {/* Speed value */}
              <div className="flex gap-4">
                <div className="bg-[#338A43] p-2 rounded-lg shrink-0">
                  <Image
                    src="/icons/delivery.svg"
                    alt="delivery speed icon"
                    width={44}
                    height={44}
                    className="w-11 h-11"
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

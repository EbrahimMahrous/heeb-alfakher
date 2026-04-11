"use client";
import { useTranslation } from "@/lib/useTranslation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/pagination";
import Image from "next/image";
import Link from "next/link";

const banners = [
  {
    id: 1,
    image: "/product-img.png",
    titleKey: "groceryDelivery",
    ctaKey: "shopNow",
  },
  {
    id: 2,
    image: "/product-img.png",
    titleKey: "groceryDelivery",
    ctaKey: "shopNow",
  },
];

export default function HeroCarousel() {
  const { t } = useTranslation("common");

  return (
    <div className="relative w-full px-4 my-6">
      <style jsx global>{`
        .swiper-pagination-bullet {
          background-color: white !important;
          opacity: 0.7;
        }
        .swiper-pagination-bullet-active {
          background-color: white !important;
          opacity: 1;
        }
      `}</style>
      <Swiper
        modules={[Pagination, Autoplay]}
        pagination={{ clickable: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="w-full h-100 md:h-125 rounded-2xl overflow-hidden shadow-lg"
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <div className="relative w-full h-full">
              <Image
                src={banner.image}
                alt={t(banner.titleKey)}
                fill
                className="object-cover rounded-lg"
                priority
              />
              <div className="absolute inset-0 bg-dark/40" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center px-4">
                {/* Icon + small text in the same row */}
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Image
                    src="/icons/delivery.svg"
                    alt="delivery"
                    width={24}
                    height={24}
                    className="drop-shadow-sm"
                  />
                  <h2 className="text-sm md:text-base font-semibold">
                    {t(banner.titleKey)}
                  </h2>
                </div>

                {/* Large Texts */}
                <p className="text-3xl md:text-5xl font-bold mb-2">
                  {t("maxDegrees")}
                </p>
                <p className="text-2xl md:text-4xl font-medium mb-6">
                  {t("freshnessDaily")}
                </p>

                <Link
                  href="/categories"
                  className="bg-orange hover:bg-orange/90 text-white font-semibold py-3 px-8 rounded-full transition duration-300 shadow-md"
                >
                  {t(banner.ctaKey)}
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

"use client";
import { useTranslation } from "@/lib/useTranslation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/pagination";
import Image from "next/image";

const BANNER_ASPECT_RATIO = 1180 / 324;

interface Slide {
  id: number;
  image: string;
  title: string;
  description?: string;
}

interface Props {
  slides?: Slide[];
  loading?: boolean;
}

export default function HeroCarousel({ slides = [], loading }: Props) {
  const { t } = useTranslation("common");

  // Load structure
  if (loading) {
    return (
      <div className="relative w-full px-4 my-6">
        <div
          className="relative w-full rounded-2xl overflow-hidden shadow-lg bg-neutral-200 animate-pulse"
          style={{ aspectRatio: BANNER_ASPECT_RATIO }}
        />
      </div>
    );
  }

  // Default slides in case no data is received from the API
  const displaySlides =
    slides.length > 0
      ? slides
      : [
          {
            id: 1,
            image: "/banners/banner-1.jpeg",
            title: t("groceryDelivery"),
          },
          {
            id: 2,
            image: "/banners/banner-2.jpeg",
            title: t("groceryDelivery"),
          },
        ];

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

      <div
        className="relative w-full rounded-2xl overflow-hidden shadow-lg"
        style={{ aspectRatio: BANNER_ASPECT_RATIO }}
      >
        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="w-full h-full"
        >
          {displaySlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative w-full h-full">
                <Image
                  src={slide.image}
                  alt={slide.title}
                  fill
                  className="object-contain rounded-lg"
                  priority
                  unoptimized={slide.image.startsWith("https://")}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
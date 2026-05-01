"use client";
import Link from "next/link";
import Image from "next/image";
import { useRef, useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useTranslation } from "@/lib/useTranslation";
import { fetchAllCategories } from "@/lib/api/categories";
import CategorySkeleton from "./ui/CategorySkeleton";

// @ts-ignore
import "swiper/css";
// @ts-ignore
import "swiper/css/navigation";

interface CategorySectionProps {
  loading?: boolean;
}

export default function CategorySection({
  loading: externalLoading,
}: CategorySectionProps = {}) {
  const { t, locale } = useTranslation("common");
  const isRtl = locale === "ar";
  const prevRef = useRef<HTMLDivElement>(null);
  const nextRef = useRef<HTMLDivElement>(null);
  const swiperRef = useRef<any>(null);
  const navigationPrevEl = isRtl ? nextRef.current : prevRef.current;
  const navigationNextEl = isRtl ? prevRef.current : nextRef.current;

  const [categories, setCategories] = useState<any[]>([]);
  const [internalLoading, setInternalLoading] = useState(true);
  const isLoading =
    externalLoading !== undefined ? externalLoading : internalLoading;

  useEffect(() => {
    if (swiperRef.current && swiperRef.current.params.navigation) {
      swiperRef.current.params.navigation.prevEl = navigationPrevEl;
      swiperRef.current.params.navigation.nextEl = navigationNextEl;
      swiperRef.current.navigation.update();
    }
  }, [isRtl, navigationPrevEl, navigationNextEl]);

  useEffect(() => {
    fetchAllCategories()
      .then((cats) => {
        setCategories(cats);
      })
      .catch((err) => console.error("Failed to load categories", err))
      .finally(() => setInternalLoading(false));
  }, []);

  const getCategoryName = (cat: any) => {
    return locale === "ar" ? cat.name : cat.nameEn;
  };

  return (
    <section className="my-12 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary">
          {t("shopByCategory")}
        </h2>
        <Link
          href="/categories"
          className="text-orange hover:text-orange/80 transition text-sm font-medium"
        >
          {t("viewAll")}
        </Link>
      </div>

      <div className="relative">
        {isLoading ? (
          /* ✅ Skeleton display during loading */
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="min-w-24 md:min-w-28">
                <CategorySkeleton />
              </div>
            ))}
          </div>
        ) : (
          /* ✅ The real slider after downloading */
          <Swiper
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            modules={[Navigation]}
            spaceBetween={16}
            slidesPerView="auto"
            navigation={{
              prevEl: navigationPrevEl,
              nextEl: navigationNextEl,
            }}
            dir={isRtl ? "rtl" : "ltr"}
            breakpoints={{
              320: { slidesPerView: 2.2 },
              640: { slidesPerView: 3.2 },
              768: { slidesPerView: 4.2 },
              1024: { slidesPerView: 5.2 },
            }}
            className="category-swiper"
          >
            {categories.map((cat) => (
              <SwiperSlide key={cat.id} className="w-auto!">
                <Link href={`/subcategory/${cat.slug}`}>
                  <div className="flex flex-col items-center text-center group cursor-pointer">
                    <div className="w-24 h-24 md:w-28 md:h-28 bg-neutral-100 rounded-full flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-all duration-300">
                      {cat.image ? (
                        <Image
                          src={cat.image}
                          alt={getCategoryName(cat)}
                          width={96}
                          height={96}
                          className="object-cover w-full h-full"
                          unoptimized={
                            typeof cat.image === "string" &&
                            cat.image.startsWith("https://")
                          }
                        />
                      ) : (
                        <span className="text-4xl text-neutral-500">🪔</span>
                      )}
                    </div>
                    <p className="mt-3 font-medium text-dark text-sm md:text-base transition-colors group-hover:text-primary">
                      {getCategoryName(cat)}
                    </p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>
        )}

        {/* Scroll buttons – only appear after loading */}
        {!isLoading && (
          <>
            <div
              ref={prevRef}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-all duration-200"
              style={{ display: "flex" }}
              onClick={() => {
                if (isRtl) {
                  swiperRef.current?.slideNext();
                } else {
                  swiperRef.current?.slidePrev();
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-dark"
                style={{ transform: isRtl ? "rotate(180deg)" : "none" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 19.5L8.25 12l7.5-7.5"
                />
              </svg>
            </div>
            <div
              ref={nextRef}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 z-10 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center cursor-pointer hover:bg-neutral-100 transition-all duration-200"
              style={{ display: "flex" }}
              onClick={() => {
                if (isRtl) {
                  swiperRef.current?.slidePrev();
                } else {
                  swiperRef.current?.slideNext();
                }
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-dark"
                style={{ transform: isRtl ? "rotate(180deg)" : "none" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M8.25 4.5l7.5 7.5-7.5 7.5"
                />
              </svg>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

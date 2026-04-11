// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

const storeInfo = {
  name: "حيب الفاخر",
  nameEn: "Heeb Al Fakher",
  founded: "2022-01-01",
  productsCount: "50+",
  deliveryFee: 35,
  deliveryInfo: "توصيل يومي بمركبات مبردة",
  deliveryInfoEn: "Daily delivery with refrigerated vehicles",
  social: {
    whatsapp: "https://wa.me/971XXXXXXXXX",
    instagram: "https://instagram.com/heebalfakher",
    tiktok: "https://tiktok.com/@heebalfakher",
  },
};

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const { locale } = params;

  const isArabic = locale === "ar";

  const title = isArabic
    ? "حيب الفاخر | متجر الفواكه الموسمية والألبان والأجار"
    : "Heeb Al Fakher | Seasonal Fruits, Dairy & Pickles Store";

  const description = isArabic
    ? `تأسس متجر حيب الفاخر في يناير 2022، يقدم أكثر من 50 منتجاً من الفواكه الموسمية، منتجات الألبان، والأجار.`
    : `Founded in January 2022, Heeb Al Fakher offers 50+ products of seasonal fruits, dairy, and pickles.`;

  return {
    title,
    description,
    icons: {
      icon: "/logo-icon.svg",
      shortcut: "/logo-icon.svg",
      apple: "/logo-icon.svg",
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        ar: "/ar",
        en: "/en",
      },
    },
    openGraph: {
      title,
      description,
      url: `/${locale}`,
      siteName: storeInfo.name,
      images: [
        {
          url: "/logo-icon.svg",
          width: 512,
          height: 512,
          alt: storeInfo.name,
        },
      ],
      locale: isArabic ? "ar_AE" : "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/logo-icon.svg"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
      },
    },
    other: {
      "contact:whatsapp": storeInfo.social.whatsapp,
      "contact:instagram": storeInfo.social.instagram,
      "contact:tiktok": storeInfo.social.tiktok,
      "business:founding_date": storeInfo.founded,
      "product:count": storeInfo.productsCount,
      "delivery:cost": storeInfo.deliveryFee.toString(),
      "delivery:method": isArabic
        ? storeInfo.deliveryInfo
        : storeInfo.deliveryInfoEn,
    },
  };
}

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const locale = params?.locale || "ar";

  const supportedLocales = ["ar", "en"];
  const safeLocale = supportedLocales.includes(locale) ? locale : "ar";

  return (
    <html lang={safeLocale} dir={safeLocale === "ar" ? "rtl" : "ltr"}>
      <body>{children}</body>
    </html>
  );
}
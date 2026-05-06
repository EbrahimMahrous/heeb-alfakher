import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";
import { Toaster } from "sonner";
import DirUpdater from "@/components/DirUpdater"; // 👈 external component

const storeInfo = {
  name: "حيب الفاخر",
  nameEn: "Heeb Al Fakher",
};

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: storeInfo.name,
  description: "Heeb Al Fakher store for seasonal fruits, dairy and pickles",
  icons: {
    icon: "/logo-icon.svg",
    shortcut: "/logo-icon.svg",
    apple: "/logo-icon.svg",
  },
  openGraph: {
    title: storeInfo.name,
    description: "Heeb Al Fakher store for seasonal fruits, dairy and pickles",
    url: "/",
    siteName: storeInfo.name,
    images: [
      {
        url: "/logo-icon.svg",
        width: 512,
        height: 512,
        alt: storeInfo.name,
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: storeInfo.name,
    description: "Heeb Al Fakher store for seasonal fruits, dairy and pickles",
    images: ["/logo-icon.svg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const locale = headersList.get("x-locale") || "ar";

  const isRTL = locale === "ar";
  const lang = locale;
  const dir = isRTL ? "rtl" : "ltr";

  return (
    <html lang={lang} dir={dir}>
      <head>
        {/* Google Tag Manager – placed as high as possible in <head> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-MBLG7D7G');`,
          }}
        />
      </head>
      <body>
        {/* Google Tag Manager (noscript) – immediately after opening <body> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-MBLG7D7G"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          ></iframe>
        </noscript>

        {/* Updates lang/dir on every locale change without page refresh */}
        <DirUpdater />

        {children}
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
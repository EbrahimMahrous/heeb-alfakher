import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        {children}
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}

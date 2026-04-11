"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import TapBar from "@/components/TapBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

export default function LocaleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const fetchCart = useCartStore((state) => state.fetchCart);

  // 1. Fetch the basket from the API when the page loads (once)
  useEffect(() => {
    fetchCart();
  }, []);

  // 2. Restore the scrolling position when changing path
  useEffect(() => {
    const saved = sessionStorage.getItem(`scroll-${pathname}`);
    if (saved) {
      setTimeout(() => window.scrollTo(0, parseInt(saved)), 0);
      sessionStorage.removeItem(`scroll-${pathname}`);
    }
  }, [pathname]);

  return (
    <>
      <TapBar />
      <Header />
      {children}
      <Footer />
      <WhatsAppButton />
    </>
  );
}

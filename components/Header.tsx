"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";
import CartIcon from "./CartIcon";
import Image from "next/image";
import { useState, useEffect } from "react";

const SEARCH_STORAGE_KEY = "header_search_query";

export default function Header() {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const savedQuery = localStorage.getItem(SEARCH_STORAGE_KEY);
    if (savedQuery) setSearchQuery(savedQuery);
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    localStorage.setItem(SEARCH_STORAGE_KEY, value);
  };

  const isHomeActive =
    pathname === "/" || pathname === "/ar" || pathname === "/en";

  const isCategoriesActive =
    pathname?.startsWith("/categories") ||
    pathname?.startsWith("/ar/categories") ||
    pathname?.startsWith("/en/categories");

  return (
    <header className="bg-white shadow-md py-4 px-4 md:px-8 sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo-heeb.svg"
            alt="Heeb Al Fakher"
            width={120}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <input
            type="text"
            placeholder={t("search")}
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border border-neutral-300 rounded-full py-2 px-4 pr-10 focus:outline-none focus:border-primary"
          />

          <Image
            src="/icons/search.svg"
            alt="search"
            width={18}
            height={18}
            className="absolute right-3 top-1/2 -translate-y-1/2 opacity-60"
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className={`hover:text-primary transition ${
              isHomeActive ? "text-primary font-semibold" : ""
            }`}
          >
            {t("home")}
          </Link>

          <Link
            href="/categories"
            className={`hover:text-primary transition ${
              isCategoriesActive ? "text-primary font-semibold" : ""
            }`}
          >
            {t("categories")}
          </Link>

          <LanguageSwitcher />
          <CartIcon />
        </div>
      </div>
    </header>
  );
}

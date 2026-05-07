"use client";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useTranslation } from "@/lib/useTranslation";
import LanguageSwitcher from "./LanguageSwitcher";
import CartIcon from "./CartIcon";
import Image from "next/image";
import SearchAutocomplete from "./SearchAutocomplete";

export default function Header() {
  const { t } = useTranslation("common");
  const pathname = usePathname();
  const params = useParams();
  const locale = (params?.locale as string) || "ar";

  // Build localized URLs
  const homeHref = `/${locale}`;
  const categoriesHref = `/${locale}/categories`;

  // Active state: compare with the actual language-prefixed pathnames
  const isHomeActive = pathname === `/${locale}` || pathname === `/${locale}/`;
  const isCategoriesActive = pathname.startsWith(`/${locale}/categories`);

  return (
    <header className="bg-white shadow-md py-4 px-4 md:px-8 sticky top-0 z-50">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4">
        {/* Logo – دائمًا يذهب إلى الرئيسية باللغة المختارة */}
        <Link href={homeHref} className="flex items-center">
          <Image
            src="/logo-heeb.svg"
            alt="Heeb Al Fakher"
            width={0}
            height={0}
            className="h-10 w-auto"
            priority
          />
        </Link>

        {/* Search – with autocomplete */}
        <div className="flex-1 max-w-md">
          <SearchAutocomplete />
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-6">
          <Link
            href={homeHref}
            className={`hover:text-primary transition ${isHomeActive ? "text-primary font-semibold" : ""}`}
          >
            {t("home")}
          </Link>
          <Link
            href={categoriesHref}
            className={`hover:text-primary transition ${isCategoriesActive ? "text-primary font-semibold" : ""}`}
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
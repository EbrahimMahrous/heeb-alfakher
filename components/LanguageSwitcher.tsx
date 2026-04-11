"use client";
import { useParams, useRouter, usePathname } from "next/navigation";

export default function LanguageSwitcher() {
  const params = useParams();
  const locale = (params?.locale as string) || "ar";
  const router = useRouter();
  const pathname = usePathname();

  const toggleLanguage = () => {
    const newLocale = locale === "ar" ? "en" : "ar";
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);

    // Save current scroll position
    const currentScrollY = window.scrollY;

    // Change language without resetting scroll
    router.push(newPath, { scroll: false });

    // After changing the path, scroll back to the saved position
    setTimeout(() => {
      window.scrollTo(0, currentScrollY);
    }, 0);
  };

  return (
    <button
      onClick={toggleLanguage}
      className="text-sm font-medium hover:text-primary transition bg-transparent"
    >
      {locale === "ar" ? "EN" : "AR"}
    </button>
  );
}

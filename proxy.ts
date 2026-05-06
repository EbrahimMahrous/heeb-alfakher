import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["ar", "en"];
const defaultLocale = "ar";

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Check if the pathname already includes a supported locale
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  // Redirect to default locale if missing
  if (!pathnameHasLocale) {
    const newUrl = new URL(`/${defaultLocale}${pathname}`, request.url);
    const response = NextResponse.redirect(newUrl);
    // Pass the locale to the root layout
    response.headers.set("x-locale", defaultLocale);
    return response;
  }

  // Extract current locale from the URL (e.g., "en")
  const currentLocale = pathname.split("/")[1];
  const response = NextResponse.next();
  // Send locale to root layout via custom header
  response.headers.set("x-locale", currentLocale);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};

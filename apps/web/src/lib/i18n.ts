export const locales = ["id", "en"] as const;
export const defaultLocale = "id" as const;

export type Locale = (typeof locales)[number];

export const localeFlags: Record<Locale, string> = {
  id: "🇮🇩",
  en: "🇺🇸",
};

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getLocaleFromPathname(pathname: string): Locale {
  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (isValidLocale(firstSegment)) {
    return firstSegment;
  }

  return defaultLocale;
}

export function removeLocaleFromPathname(pathname: string): string {
  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (isValidLocale(firstSegment)) {
    return "/" + segments.slice(2).join("/");
  }

  return pathname;
}

export function addLocaleToPathname(pathname: string, locale: Locale): string {
  if (pathname === "/") {
    return `/${locale}`;
  }

  const segments = pathname.split("/");
  const firstSegment = segments[1];

  if (isValidLocale(firstSegment)) {
    // Replace existing locale
    segments[1] = locale;
    return segments.join("/");
  } else {
    // Add locale
    return `/${locale}${pathname}`;
  }
}

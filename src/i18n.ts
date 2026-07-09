import { getRequestConfig } from "next-intl/server";

export const locales = ["ru", "en", "uz"] as const;
export const defaultLocale = "ru";

export type Locale = (typeof locales)[number];
export const localeLabelKeyMap: Record<Locale, string> = {
  ru: "common.localeNameRu",
  en: "common.localeNameEn",
  uz: "common.localeNameUz",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getNextLocale(locale: Locale): Locale {
  const currentIndex = locales.indexOf(locale);
  return locales[(currentIndex + 1) % locales.length] ?? defaultLocale;
}

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale && isLocale(locale) ? locale : defaultLocale;
  const messages = (await import(`./messages/${currentLocale}.json`)).default;

  return {
    locale: currentLocale,
    messages,
    timeZone: currentLocale === "en" ? "UTC" : "Asia/Tashkent",
  };
});

import { getRequestConfig } from "next-intl/server";

export const locales = ["ru", "en"] as const;
export const defaultLocale = "ru";

export type Locale = (typeof locales)[number];
export const localeLabelKeyMap: Record<Locale, string> = {
  ru: "common.localeNameRu",
  en: "common.localeNameEn",
};

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export function getNextLocale(locale: Locale): Locale {
  return locale === "ru" ? "en" : "ru";
}

export default getRequestConfig(async ({ locale }) => {
  const currentLocale = locale && isLocale(locale) ? locale : defaultLocale;
  const messages = (await import(`./messages/${currentLocale}.json`)).default;

  return {
    locale: currentLocale,
    messages,
    timeZone: currentLocale === "ru" ? "Asia/Tashkent" : "UTC",
  };
});

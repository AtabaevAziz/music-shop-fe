import { getRequestConfig } from "next-intl/server";

export const locales = ["ru", "en"] as const;
export const defaultLocale = "ru";

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
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

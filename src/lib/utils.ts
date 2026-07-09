import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { Locale } from "@/i18n";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatMoney(
  value: number,
  currency = "UZS",
  locale: Locale = "en",
) {
  return new Intl.NumberFormat(getIntlLocale(locale), {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function getIntlLocale(locale: Locale) {
  return locale === "ru" ? "ru-RU" : locale === "uz" ? "uz-UZ" : "en-US";
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "");
}

export function parseList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

"use client";

import { Locale } from "@/i18n";
import { formatMoney } from "@/lib/utils";

export function Money({
  value,
  currency,
  locale,
}: {
  value: number;
  currency: string;
  locale: Locale;
}) {
  return <>{formatMoney(value, currency, locale)}</>;
}

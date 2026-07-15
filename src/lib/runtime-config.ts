import type { Locale } from "@/i18n";
import { locales } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import type { ApiDictionaryOption } from "@/services/config/config-types";

type TranslateFn = (
  key: string,
  values?: Record<string, string | number | Date>,
) => string;

export function getConfiguredLocales(
  supportedLocales: Locale[] | undefined,
): Locale[] {
  const filteredLocales =
    supportedLocales?.filter((locale): locale is Locale =>
      locales.includes(locale),
    ) ?? [];

  return filteredLocales.length ? filteredLocales : [...locales];
}

export function getDictionaryValues<TValue extends string>(
  options: ApiDictionaryOption<TValue>[] | undefined,
  fallback: readonly TValue[],
): TValue[] {
  const values = options?.map((option) => option.value) ?? [];
  return values.length ? values : [...fallback];
}

export function getDictionaryLabel(
  t: TranslateFn,
  option: ApiDictionaryOption<string>,
) {
  return option.labelKey ? t(option.labelKey) : dynamicLabel(t, option.value);
}

export function getDictionarySelectOptions<TValue extends string>(
  t: TranslateFn,
  options: ApiDictionaryOption<TValue>[] | undefined,
  fallback: readonly TValue[],
) {
  const resolvedOptions = options?.length
    ? options
    : fallback.map((value) => ({
        value,
      }));

  return resolvedOptions.map((option) => ({
    label: getDictionaryLabel(t, option),
    value: option.value,
  }));
}

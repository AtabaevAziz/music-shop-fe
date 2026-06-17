import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { FlashToaster } from "@/components/shared/flash-toaster";
import { type Locale, isLocale, locales } from "@/i18n";
import { MusicStoreProvider } from "@/store/music-store";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  if (!isLocale(locale)) {
    return {};
  }
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("appName"),
    description: t("appSubtitle"),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <MusicStoreProvider locale={locale as Locale}>
        <FlashToaster />
        {children}
      </MusicStoreProvider>
    </NextIntlClientProvider>
  );
}

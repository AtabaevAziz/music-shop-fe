import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PublicShell } from "@/components/layout/public-shell";
import { PublicCartModule } from "@/features/storefront/public-cart-module";
import { Locale } from "@/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("cartTitle"),
    description: t("cartDescription"),
  };
}

export default async function PublicCartPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <Suspense fallback={null}>
      <PublicShell locale={locale}>
        <PublicCartModule locale={locale} />
      </PublicShell>
    </Suspense>
  );
}

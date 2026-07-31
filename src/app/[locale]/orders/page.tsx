import { getTranslations } from "next-intl/server";
import { Suspense } from "react";

import { PublicShell } from "@/components/layout/public-shell";
import { PublicOrderTrackingModule } from "@/features/storefront/public-order-tracking-module";
import { Locale } from "@/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("orderTrackingTitle"),
    description: t("orderTrackingDescription"),
  };
}

export default async function PublicOrdersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <Suspense fallback={null}>
      <PublicShell locale={locale}>
        <PublicOrderTrackingModule locale={locale} />
      </PublicShell>
    </Suspense>
  );
}

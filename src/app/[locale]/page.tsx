import { getTranslations } from "next-intl/server";

import { PublicShell } from "@/components/layout/public-shell";
import { StorefrontHomeModule } from "@/features/storefront/storefront-home-module";
import { Locale } from "@/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("appName"),
    description: t("appSubtitle"),
  };
}

export default async function StorefrontHomePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <PublicShell locale={locale}>
      <StorefrontHomeModule locale={locale} />
    </PublicShell>
  );
}

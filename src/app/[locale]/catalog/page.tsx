import { getTranslations } from "next-intl/server";

import { PublicShell } from "@/components/layout/public-shell";
import { PublicCatalogModule } from "@/features/storefront/public-catalog-module";
import { Locale } from "@/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("catalogTitle"),
    description: t("catalogDescription"),
  };
}

export default async function PublicCatalogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <PublicShell locale={locale}>
      <PublicCatalogModule locale={locale} />
    </PublicShell>
  );
}

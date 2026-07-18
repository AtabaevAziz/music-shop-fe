import { getTranslations } from "next-intl/server";

import { PublicShell } from "@/components/layout/public-shell";
import { PublicCategoriesModule } from "@/features/storefront/public-categories-module";
import { Locale } from "@/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("categoriesTitle"),
    description: t("categoriesDescription"),
  };
}

export default async function PublicCategoriesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <PublicShell locale={locale}>
      <PublicCategoriesModule locale={locale} />
    </PublicShell>
  );
}

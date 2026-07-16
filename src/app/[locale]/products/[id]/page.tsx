import { getTranslations } from "next-intl/server";

import { PublicShell } from "@/components/layout/public-shell";
import { PublicProductModule } from "@/features/storefront/public-product-module";
import { Locale } from "@/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("productTitle"),
    description: t("productDescription"),
  };
}

export default async function PublicProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>;
}) {
  const { locale, id } = await params;

  return (
    <PublicShell locale={locale}>
      <PublicProductModule id={id} locale={locale} />
    </PublicShell>
  );
}

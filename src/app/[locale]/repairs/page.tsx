import { getTranslations } from "next-intl/server";

import { PublicShell } from "@/components/layout/public-shell";
import { PublicRepairRequestModule } from "@/features/storefront/public-repair-request-module";
import { Locale } from "@/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("repairsTitle"),
    description: t("repairsDescription"),
  };
}

export default async function PublicRepairsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <PublicShell locale={locale}>
      <PublicRepairRequestModule locale={locale} />
    </PublicShell>
  );
}

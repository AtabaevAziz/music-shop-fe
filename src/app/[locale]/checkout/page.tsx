import { getTranslations } from "next-intl/server";

import { PublicShell } from "@/components/layout/public-shell";
import { PublicCheckoutModule } from "@/features/storefront/public-checkout-module";
import { Locale } from "@/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("checkoutTitle"),
    description: t("checkoutDescription"),
  };
}

export default async function PublicCheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <PublicShell locale={locale}>
      <PublicCheckoutModule locale={locale} />
    </PublicShell>
  );
}

import { getTranslations } from "next-intl/server";

import { PublicShell } from "@/components/layout/public-shell";
import { PublicContactsModule } from "@/features/storefront/public-contacts-module";
import { Locale } from "@/i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  return {
    title: t("contactsTitle"),
    description: t("contactsDescription"),
  };
}

export default async function PublicContactsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <PublicShell locale={locale}>
      <PublicContactsModule />
    </PublicShell>
  );
}

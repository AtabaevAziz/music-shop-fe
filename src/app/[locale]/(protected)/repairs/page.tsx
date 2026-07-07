import { ClientRepairsModule } from "@/features/client/client-repairs-module";
import { Locale } from "@/i18n";

export default async function RepairsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <ClientRepairsModule locale={locale} />;
}

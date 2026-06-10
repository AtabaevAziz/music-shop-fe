import { SettingsModule } from "@/modules/settings";
import { Locale } from "@/lib/i18n";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <SettingsModule locale={locale} />;
}

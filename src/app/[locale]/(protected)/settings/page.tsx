import { SettingsModule } from "@/features/settings/settings-module";
import { Locale } from "@/lib/i18n";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <SettingsModule locale={locale} />;
}

import { DashboardModule } from "@/modules/dashboard";
import { Locale } from "@/lib/i18n";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <DashboardModule locale={locale} />;
}

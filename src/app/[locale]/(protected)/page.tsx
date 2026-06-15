import { DashboardModule } from "@/features/dashboard/dashboard-module";
import { Locale } from "@/i18n";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <DashboardModule locale={locale} />;
}

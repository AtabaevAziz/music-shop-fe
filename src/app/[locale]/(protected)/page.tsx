import { RoleRoute } from "@/components/layout/role-route";
import { ClientHomeModule } from "@/features/client/client-home-module";
import { DashboardModule } from "@/features/dashboard/dashboard-module";
import { Locale } from "@/i18n";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <RoleRoute
      client={<ClientHomeModule locale={locale} />}
      staff={<DashboardModule locale={locale} />}
    />
  );
}

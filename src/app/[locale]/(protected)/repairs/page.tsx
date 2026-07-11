import { RoleRoute } from "@/components/layout/role-route";
import { ClientRepairsModule } from "@/features/client/client-repairs-module";
import { Locale } from "@/i18n";
import { StaffRepairsModule } from "@/features/repairs/staff-repairs-module";

export default async function RepairsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <RoleRoute
      client={<ClientRepairsModule locale={locale} />}
      staff={<StaffRepairsModule locale={locale} />}
    />
  );
}

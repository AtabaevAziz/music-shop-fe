import { RoleRoute } from "@/components/layout/role-route";
import { ClientRepairsModule } from "@/features/client/client-repairs-module";
import { AdminRepairsModule } from "@/features/repairs/admin-repairs-module";
import { Locale } from "@/i18n";

export default async function RepairsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <RoleRoute
      client={<ClientRepairsModule locale={locale} />}
      admin={<AdminRepairsModule locale={locale} />}
    />
  );
}

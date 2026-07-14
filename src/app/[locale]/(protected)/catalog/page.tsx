import { RoleRoute } from "@/components/layout/role-route";
import { CatalogModule } from "@/features/catalog/catalog-module";
import { ClientCatalogModule } from "@/features/client/client-catalog-module";
import { Locale } from "@/i18n";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <RoleRoute
      client={<ClientCatalogModule locale={locale} />}
      admin={<CatalogModule locale={locale} />}
    />
  );
}

import { RoleRoute } from "@/components/layout/role-route";
import { ClientOrdersModule } from "@/features/client/client-orders-module";
import { OrdersModule } from "@/features/orders/orders-module";
import { Locale } from "@/i18n";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return (
    <RoleRoute
      client={<ClientOrdersModule locale={locale} />}
      admin={<OrdersModule locale={locale} />}
    />
  );
}

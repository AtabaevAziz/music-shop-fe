import { OrdersModule } from "@/features/orders/orders-module";
import { Locale } from "@/lib/i18n";

export default async function OrdersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <OrdersModule locale={locale} />;
}

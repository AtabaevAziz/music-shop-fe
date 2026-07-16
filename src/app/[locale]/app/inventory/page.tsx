import { InventoryModule } from "@/features/inventory/inventory-module";
import { Locale } from "@/i18n";

export default async function InventoryPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <InventoryModule locale={locale} />;
}

import { CustomersModule } from "@/features/customers/customers-module";
import { Locale } from "@/lib/i18n";

export default async function CustomersPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <CustomersModule locale={locale} />;
}

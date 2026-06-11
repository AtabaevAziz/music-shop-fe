import { FinanceModule } from "@/features/finance/finance-module";
import { Locale } from "@/lib/i18n";

export default async function FinancePage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <FinanceModule locale={locale} />;
}

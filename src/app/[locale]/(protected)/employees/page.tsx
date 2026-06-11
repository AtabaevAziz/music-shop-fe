import { EmployeesModule } from "@/features/employees/employees-module";
import { Locale } from "@/lib/i18n";

export default async function EmployeesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <EmployeesModule locale={locale} />;
}

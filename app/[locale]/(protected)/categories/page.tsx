import { CategoriesModule } from "@/modules/categories";
import { Locale } from "@/lib/i18n";

export default async function CategoriesPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <CategoriesModule locale={locale} />;
}

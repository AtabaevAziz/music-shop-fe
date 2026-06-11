import { CatalogModule } from "@/features/catalog/catalog-module";
import { Locale } from "@/lib/i18n";

export default async function CatalogPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <CatalogModule locale={locale} />;
}

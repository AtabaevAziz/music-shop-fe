import { BrandsModule } from "@/modules/brands";
import { Locale } from "@/lib/i18n";

export default async function BrandsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <BrandsModule locale={locale} />;
}

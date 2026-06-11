import { MediaModule } from "@/features/media/media-module";
import { Locale } from "@/lib/i18n";

export default async function MediaPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  return <MediaModule locale={locale} />;
}

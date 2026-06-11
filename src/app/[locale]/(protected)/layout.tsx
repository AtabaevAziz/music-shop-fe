import { AppShell } from "@/components/layout/app-shell";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Locale } from "@/lib/i18n";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <AuthGuard locale={locale}>
      <AppShell locale={locale}>{children}</AppShell>
    </AuthGuard>
  );
}

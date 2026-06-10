import { AppShell } from "@/components/app-shell";
import { AuthGuard } from "@/components/auth-guard";
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

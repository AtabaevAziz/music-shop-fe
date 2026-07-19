import { Suspense } from "react";

import { AuthGuard } from "@/components/layout/auth-guard";
import { ProtectedShell } from "@/components/layout/protected-shell";
import { Locale } from "@/i18n";

export default async function ProtectedAppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;

  return (
    <AuthGuard locale={locale}>
      <Suspense fallback={null}>
        <ProtectedShell locale={locale}>{children}</ProtectedShell>
      </Suspense>
    </AuthGuard>
  );
}

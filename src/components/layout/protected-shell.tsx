"use client";

import { AppShell } from "@/components/layout/app-shell";
import { ClientShell } from "@/components/layout/client-shell";
import { Locale } from "@/i18n";
import { useSessionStore } from "@/store/music-store";

export function ProtectedShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { session } = useSessionStore();

  if (session?.role === "client") {
    return <ClientShell locale={locale}>{children}</ClientShell>;
  }

  return <AppShell locale={locale}>{children}</AppShell>;
}

"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Locale } from "@/i18n";
import { useAuthSession } from "@/providers/session-provider";

export function AuthGuard({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { ready, session, sessionError } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  useEffect(() => {
    if (ready && !session && !sessionError) {
      router.replace(`/${locale}/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, session, sessionError, router, locale, pathname]);

  if (!ready) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="empty-state">{t("common.loadingWorkspace")}</div>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>{t("auth.sessionUnavailableTitle")}</h2>
          <p className="muted">{t("auth.sessionUnavailableText")}</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="empty-state">{t("common.loadingWorkspace")}</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

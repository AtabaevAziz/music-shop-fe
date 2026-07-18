"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Locale } from "@/i18n";
import { ApiClientError } from "@/lib/api-error";
import { useAuthSession } from "@/providers/session-provider";

export function AuthGuard({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { ready, session, sessionError, refetchSession } = useAuthSession();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();
  const isBackendUnavailable =
    sessionError instanceof ApiClientError && sessionError.status === 0;

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
          <h2>
            {isBackendUnavailable
              ? t("auth.backendUnavailableTitle")
              : t("auth.sessionUnavailableTitle")}
          </h2>
          <p className="muted">
            {isBackendUnavailable
              ? t("auth.backendUnavailableText")
              : t("auth.sessionUnavailableText")}
          </p>
          <div className="auth-footer-links">
            <Button type="button" variant="outline" onClick={() => void refetchSession()}>
              {t("auth.retrySessionCheck")}
            </Button>
            <Button asChild variant="outline">
              <Link href={`/${locale}/login?next=${encodeURIComponent(pathname)}`}>
                {t("auth.signInAction")}
              </Link>
            </Button>
            <Button asChild>
              <Link href={`/${locale}`}>{t("storefront.backToStorefront")}</Link>
            </Button>
          </div>
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

"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Locale } from "@/i18n";
import { useMusicStore } from "@/store/music-store";

export function AuthGuard({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const { ready, session } = useMusicStore();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations();

  useEffect(() => {
    if (ready && !session) {
      router.replace(`/${locale}/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, session, router, locale, pathname]);

  if (!ready || !session) {
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

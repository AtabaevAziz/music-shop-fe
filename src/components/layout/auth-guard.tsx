"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { Locale } from "@/lib/i18n";
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

  useEffect(() => {
    if (ready && !session) {
      router.replace(`/${locale}/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [ready, session, router, locale, pathname]);

  if (!ready || !session) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="empty-state">Loading workspace...</div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

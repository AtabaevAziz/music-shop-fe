"use client";

import { Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import { Locale, getNextLocale, localeLabelKeyMap } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { useSessionStore } from "@/store/music-store";
import { Role } from "@/types/music";

const roles: Role[] = [
  "admin",
  "store_manager",
  "catalog_manager",
  "sales_operator",
];

export function LoginScreen({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useSessionStore();
  const [isPending, startTransition] = useTransition();
  const next = searchParams.get("next");
  const targetLocale = getNextLocale(locale);
  const currentLocaleLabel = t(localeLabelKeyMap[locale]);
  const roleBlurbs: Record<Role, string> = {
    admin: t("auth.adminBlurb"),
    store_manager: t("auth.storeManagerBlurb"),
    catalog_manager: t("auth.catalogManagerBlurb"),
    sales_operator: t("auth.salesOperatorBlurb"),
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <section className="hero-panel">
          <div className="hero-panel-top">
            <div className="hero-eyebrow">{t("common.brand")}</div>
            <div className="hero-panel-controls">
              <Button
                className="hero-panel-locale"
                variant="secondary"
                type="button"
                onClick={() =>
                  router.push(
                    `/${targetLocale}${pathname.slice(3)}${
                      next ? `?next=${encodeURIComponent(next)}` : ""
                    }`,
                  )
                }
                aria-label={`${t("common.language")}: ${currentLocaleLabel}`}
              >
                <Languages size={16} />
                <span>{currentLocaleLabel}</span>
              </Button>
              <ThemeToggle variant="hero" />
            </div>
          </div>
          <h1>{t("auth.title")}</h1>
          <p className="hero-lead">{t("auth.text")}</p>
          <div className="hero-grid">
            <div className="hero-note">
              <div className="hero-note-label">{t("auth.modulesLabel")}</div>
              <div>{t("auth.modulesValue")}</div>
            </div>
            <div className="hero-note">
              <div className="hero-note-label">{t("auth.demoLabel")}</div>
              <div>{t("auth.demoValue")}</div>
            </div>
          </div>
        </section>
        <section>
          <h2>{t("auth.enterAs")}</h2>
          <div className="login-role-grid">
            {roles.map((role) => (
              <Button
                key={role}
                className="login-role h-auto justify-start whitespace-normal p-5 text-left"
                variant="outline"
                disabled={isPending}
                onClick={() => {
                  startTransition(() => {
                    void login(role).then(() =>
                      router.push(searchParams.get("next") || `/${locale}`),
                    );
                  });
                }}
              >
                <strong className="login-role-title">
                  {dynamicLabel(t, role)}
                </strong>
                <p className="login-role-copy">{roleBlurbs[role]}</p>
              </Button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { useMusicStore } from "@/store/music-store";
import { Role } from "@/types/music";

const roles: Role[] = [
  "admin",
  "store_manager",
  "catalog_manager",
  "sales_operator",
];

export function LoginScreen({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useMusicStore();
  const [isPending, startTransition] = useTransition();
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
          <div className="hero-eyebrow">{t("common.brand")}</div>
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
              <button
                key={role}
                className="login-role"
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
                <p className="muted">{roleBlurbs[role]}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

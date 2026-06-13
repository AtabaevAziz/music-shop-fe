"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
import { useMusicStore } from "@/store/music-store";
import { Role } from "@/types/music";

const roles: Role[] = [
  "admin",
  "store_manager",
  "catalog_manager",
  "sales_operator",
];

export function LoginScreen({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useMusicStore();
  const [isPending, startTransition] = useTransition();
  const dict = getDictionary(locale);
  const roleBlurbs: Record<Role, string> = {
    admin: dict.adminBlurb,
    store_manager: dict.storeManagerBlurb,
    catalog_manager: dict.catalogManagerBlurb,
    sales_operator: dict.salesOperatorBlurb,
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <section className="hero-panel">
          <div className="hero-eyebrow">{dict.brand}</div>
          <h1>{dict.loginTitle}</h1>
          <p className="hero-lead">{dict.loginText}</p>
          <div className="hero-grid">
            <div className="hero-note">
              <div className="hero-note-label">{dict.loginModulesLabel}</div>
              <div>{dict.loginModulesValue}</div>
            </div>
            <div className="hero-note">
              <div className="hero-note-label">{dict.loginDemoLabel}</div>
              <div>{dict.loginDemoValue}</div>
            </div>
          </div>
        </section>
        <section>
          <h2>{dict.enterAs}</h2>
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
                  {translateDynamicLabel(locale, role)}
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

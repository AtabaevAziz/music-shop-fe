"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getDictionary, Locale } from "@/lib/i18n";
import { useMusicStore } from "@/data/store";
import { Role } from "@/data/types";

const roles: { role: Role; blurb: string }[] = [
  {
    role: "admin",
    blurb: "Full operational access with user and settings control.",
  },
  {
    role: "store_manager",
    blurb: "Orders, inventory, staff overview, and finance visibility.",
  },
  {
    role: "catalog_manager",
    blurb: "Products, brands, categories, and media workflows.",
  },
  {
    role: "sales_operator",
    blurb: "Orders, customers, and pickup processing.",
  },
];

export function LoginScreen({ locale }: { locale: Locale }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useMusicStore();
  const [isPending, startTransition] = useTransition();
  const dict = getDictionary(locale);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <section className="hero-panel">
          <strong>{dict.brand}</strong>
          <h1>{dict.loginTitle}</h1>
          <p>{dict.loginText}</p>
          <div className="hero-grid">
            <div
              className="card"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "white",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="muted"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Modules
              </div>
              <div>Dashboard, Catalog, Inventory, Orders, Finance</div>
            </div>
            <div
              className="card"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "white",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div
                className="muted"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Demo mode
              </div>
              <div>Frontend-only state + local persistence</div>
            </div>
          </div>
        </section>
        <section>
          <h2>{dict.enterAs}</h2>
          <div className="login-role-grid">
            {roles.map((entry) => (
              <button
                key={entry.role}
                className="login-role"
                disabled={isPending}
                onClick={() => {
                  startTransition(() => {
                    void login(entry.role).then(() =>
                      router.push(searchParams.get("next") || `/${locale}`),
                    );
                  });
                }}
              >
                <strong>{entry.role}</strong>
                <p className="muted">{entry.blurb}</p>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

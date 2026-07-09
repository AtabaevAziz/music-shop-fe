"use client";

import { ChevronDown, Eye, EyeOff, Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Locale, localeLabelKeyMap, locales } from "@/i18n";
import { useSessionStore, useStoreDb } from "@/store/music-store";
import { Role } from "@/types/music";

const staffRoles = [
  "admin",
  "store_manager",
  "catalog_manager",
  "sales_operator",
] as const satisfies Role[];
const STAFF_PASSWORD = "Secret!1";

type StaffRole = (typeof staffRoles)[number];

function isStaffRole(value: string): value is StaffRole {
  return staffRoles.includes(value as StaffRole);
}

export function LoginScreen({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const db = useStoreDb();
  const { login } = useSessionStore();
  const [isPending, startTransition] = useTransition();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const next = searchParams.get("next");
  const currentLocaleLabel = t(localeLabelKeyMap[locale]);
  const activeCustomers = db.customers.filter(
    (customer) => customer.status === "active",
  );
  const destination = next || `/${locale}`;

  const handleSignIn = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedLogin = loginValue.trim().toLowerCase();
    const normalizedPassword = passwordValue.trim().toLowerCase();

    if (isStaffRole(normalizedLogin) && passwordValue === STAFF_PASSWORD) {
      setError(null);
      startTransition(() => {
        void login(normalizedLogin).then(() => router.push(destination));
      });
      return;
    }

    const matchingCustomer = activeCustomers.find(
      (customer) => customer.email.trim().toLowerCase() === normalizedLogin,
    );
    if (
      !matchingCustomer ||
      normalizedPassword !== matchingCustomer.email.trim().toLowerCase()
    ) {
      setError(t("auth.invalidCredentials"));
      return;
    }

    setError(null);
    startTransition(() => {
      void login("client", matchingCustomer.id).then(() =>
        router.push(destination),
      );
    });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <section className="hero-panel">
          <div className="hero-panel-top">
            <div className="hero-eyebrow">{t("common.brand")}</div>
            <div className="hero-panel-controls">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="hero-panel-locale"
                    variant="secondary"
                    type="button"
                    aria-label={`${t("common.language")}: ${currentLocaleLabel}`}
                  >
                    <Languages size={16} />
                    <span>{currentLocaleLabel}</span>
                    <ChevronDown size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {locales.map((itemLocale) => (
                    <DropdownMenuItem
                      key={itemLocale}
                      disabled={itemLocale === locale}
                      onSelect={() =>
                        router.push(
                          `/${itemLocale}${pathname.slice(3)}${
                            next ? `?next=${encodeURIComponent(next)}` : ""
                          }`,
                        )
                      }
                    >
                      {t(localeLabelKeyMap[itemLocale])}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
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
          <form
            className="auth-signin-panel"
            autoComplete="off"
            onSubmit={handleSignIn}
          >
            <div className="auth-field-group">
              <Label htmlFor="login">{t("auth.loginLabel")}</Label>
              <Input
                id="login"
                name="signin_identifier"
                className="auth-input"
                autoComplete="off"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                placeholder={t("auth.loginPlaceholder")}
                value={loginValue}
                required
                disabled={isPending}
                onChange={(event) => {
                  if (error) {
                    setError(null);
                  }
                  setLoginValue(event.target.value);
                }}
              />
            </div>
            <div className="auth-field-group">
              <Label htmlFor="password">{t("auth.passwordLabel")}</Label>
              <div className="auth-password-field">
                <Input
                  id="password"
                  name="signin_secret"
                  className="auth-input auth-input-with-toggle"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder={t("auth.passwordPlaceholder")}
                  value={passwordValue}
                  required
                  disabled={isPending}
                  onChange={(event) => {
                    if (error) {
                      setError(null);
                    }
                    setPasswordValue(event.target.value);
                  }}
                />
                <button
                  className="auth-password-toggle"
                  type="button"
                  aria-label={
                    isPasswordVisible
                      ? t("auth.hidePassword")
                      : t("auth.showPassword")
                  }
                  aria-pressed={isPasswordVisible}
                  disabled={isPending}
                  onClick={() => setIsPasswordVisible((current) => !current)}
                >
                  {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error ? (
              <p className="auth-form-error" role="alert">
                {error}
              </p>
            ) : null}
            <Button className="auth-submit" type="submit" disabled={isPending}>
              {t("auth.signInAction")}
            </Button>
          </form>
        </section>
      </div>
    </div>
  );
}

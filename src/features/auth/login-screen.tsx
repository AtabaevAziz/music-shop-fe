"use client";

import { ChevronDown, Eye, EyeOff, Languages } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { type FormEvent, useState } from "react";

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
import {
  useAppConfigQuery,
  useAuthConfigQuery,
} from "@/hooks/use-config-query";
import { Locale, localeLabelKeyMap } from "@/i18n";
import {
  API_BASE_URL_ENV_VAR,
  API_BASE_URL_EXAMPLE,
  hasConfiguredApiBaseUrl,
} from "@/lib/api-config";
import { ApiClientError } from "@/lib/api-error";
import { getConfiguredLocales } from "@/lib/runtime-config";
import { useAuthSession } from "@/providers/session-provider";

export function LoginScreen({ locale }: { locale: Locale }) {
  const isApiConfigured = hasConfiguredApiBaseUrl();
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: appConfig } = useAppConfigQuery();
  const { data: authConfig, isPending: isAuthConfigPending } =
    useAuthConfigQuery();
  const { isAuthenticating, login } = useAuthSession();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isManualEntryEnabled, setIsManualEntryEnabled] = useState(false);
  const [loginValue, setLoginValue] = useState("");
  const [passwordValue, setPasswordValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const next = searchParams.get("next");
  const currentLocaleLabel = t(localeLabelKeyMap[locale]);
  const destination = next || `/${locale}/app`;
  const supportedLocales = getConfiguredLocales(appConfig?.supportedLocales);
  const hasPasswordProvider = authConfig
    ? authConfig.providers.some((provider) => provider.type === "password")
    : true;
  const isLoginEnabled = authConfig
    ? authConfig.allowClientLogin || authConfig.allowAdminLogin
    : true;
  const isSubmitDisabled =
    !isApiConfigured ||
    isAuthenticating ||
    isAuthConfigPending ||
    !hasPasswordProvider ||
    !isLoginEnabled;

  const authNotice = !isApiConfigured
    ? null
    : authConfig
      ? !hasPasswordProvider
        ? t("auth.passwordLoginUnavailable")
        : !isLoginEnabled
          ? t("auth.loginUnavailable")
          : !authConfig.allowClientLogin
            ? t("auth.clientLoginDisabled")
            : !authConfig.allowAdminLogin
              ? t("auth.adminLoginDisabled")
              : null
      : null;

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    const normalizedLogin = loginValue.trim().toLowerCase();

    setError(null);
    try {
      await login(normalizedLogin, passwordValue);
      router.push(destination);
    } catch (error) {
      setError(
        error instanceof ApiClientError && error.status === 401
          ? t("auth.invalidCredentials")
          : error instanceof Error
            ? error.message
            : t("auth.invalidCredentials"),
      );
    }
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
                  {supportedLocales.map((itemLocale) => (
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
          </div>
        </section>
        <section>
          <h2>{t("auth.enterAs")}</h2>
          <form
            className="auth-signin-panel"
            autoComplete="off"
            onFocusCapture={() => setIsManualEntryEnabled(true)}
            onPointerDownCapture={() => setIsManualEntryEnabled(true)}
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
                readOnly={!isManualEntryEnabled}
                value={loginValue}
                required
                disabled={isAuthenticating || !isApiConfigured}
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
                  readOnly={!isManualEntryEnabled}
                  value={passwordValue}
                  required
                  disabled={isAuthenticating || !isApiConfigured}
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
                  disabled={isAuthenticating || !isApiConfigured}
                  onClick={() => setIsPasswordVisible((current) => !current)}
                >
                  {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {!isApiConfigured ? (
              <div className="auth-form-error" role="alert">
                <strong>{t("auth.apiBaseUrlMissingTitle")}</strong>
                <p>
                  {t("auth.apiBaseUrlMissingText", {
                    envVar: API_BASE_URL_ENV_VAR,
                  })}
                </p>
                <p>
                  {t("auth.apiBaseUrlMissingHint", {
                    exampleUrl: API_BASE_URL_EXAMPLE,
                  })}
                </p>
              </div>
            ) : null}
            {error ? (
              <p className="auth-form-error" role="alert">
                {error}
              </p>
            ) : null}
            {authNotice ? <p className="muted">{authNotice}</p> : null}
            <Button
              className="auth-submit"
              type="submit"
              disabled={isSubmitDisabled}
            >
              {t("auth.signInAction")}
            </Button>
            <div className="auth-footer-links">
              <button
                type="button"
                className="auth-inline-link"
                onClick={() => router.push(`/${locale}`)}
              >
                {t("storefront.backToStorefront")}
              </button>
              <button
                type="button"
                className="auth-inline-link"
                onClick={() => router.push(`/${locale}/catalog`)}
              >
                {t("storefront.goToCatalog")}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

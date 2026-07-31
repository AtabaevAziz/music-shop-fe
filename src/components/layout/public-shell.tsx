"use client";

import { Languages, LogIn, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStorefrontCartSync } from "@/features/storefront/use-storefront-cart-sync";
import { Locale, localeLabelKeyMap, locales } from "@/i18n";

export function PublicShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  useStorefrontCartSync();
  const queryString = searchParams.toString();

  return (
    <div className="storefront-shell">
      <header className="storefront-topbar">
        <Link href={`/${locale}`} className="storefront-brand">
          <span className="storefront-brand-mark">MS</span>
          <span className="storefront-brand-copy">
            <strong>{t("common.brand")}</strong>
            <span>{t("storefront.headerTagline")}</span>
          </span>
        </Link>
        <div className="storefront-actions">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label={t("common.language")}
              >
                <Languages size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {locales.map((itemLocale) => (
                <DropdownMenuItem
                  key={itemLocale}
                  disabled={itemLocale === locale}
                  onSelect={() => {
                    const nextPath = pathname.slice(3) || "";
                    router.push(
                      `/${itemLocale}${nextPath}${
                        queryString ? `?${queryString}` : ""
                      }`,
                    );
                  }}
                >
                  {t(localeLabelKeyMap[itemLocale])}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
          <Button asChild variant="outline">
            <Link href={`/${locale}/orders`}>
              {t("storefront.trackOrderLink")}
            </Link>
          </Button>
          <div className="storefront-auth-actions">
            <Button
              asChild
              variant="outline"
              className="storefront-register-button"
            >
              <Link href={`/${locale}/login?mode=register`}>
                <UserPlus size={16} />
                {t("auth.registerAction")}
              </Link>
            </Button>
            <Button asChild className="storefront-login-button">
              <Link href={`/${locale}/login`}>
                <LogIn size={16} />
                {t("auth.signInAction")}
              </Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="storefront-main">{children}</main>
    </div>
  );
}

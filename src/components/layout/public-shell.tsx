"use client";

import { Languages, LogIn, ShoppingCart } from "lucide-react";
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
import {
  getStorefrontCartItemsCount,
  useStorefrontCartStore,
} from "@/features/storefront/storefront-cart-store";
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
  const hasHydrated = useStorefrontCartStore((state) => state.hasHydrated);
  const cartItemsCount = useStorefrontCartStore((state) =>
    getStorefrontCartItemsCount(state.items),
  );

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
        <nav className="storefront-nav">
          <Link href={`/${locale}`}>{t("storefront.homeLink")}</Link>
          <Link href={`/${locale}/categories`}>{t("nav.categories")}</Link>
          <Link href={`/${locale}/catalog`}>{t("nav.catalog")}</Link>
          <Link href={`/${locale}/repairs`}>{t("nav.repairs")}</Link>
          <Link href={`/${locale}/contacts`}>{t("nav.contacts")}</Link>
        </nav>
        <div className="storefront-actions">
          <Button asChild variant="outline">
            <Link href={`/${locale}/cart`}>
              <ShoppingCart size={16} />
              {t("nav.cart")}
              {hasHydrated && cartItemsCount > 0 ? (
                <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                  {cartItemsCount}
                </span>
              ) : null}
            </Link>
          </Button>
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
          <Button asChild className="storefront-login-button">
            <Link href={`/${locale}/login`}>
              <LogIn size={16} />
              {t("auth.signInAction")}
            </Link>
          </Button>
        </div>
      </header>
      <main className="storefront-main">{children}</main>
    </div>
  );
}

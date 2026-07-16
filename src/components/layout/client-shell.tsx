"use client";

import { ChevronDown, Languages, LogOut, Menu, UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useClientHomeQuery } from "@/hooks/use-client-home-query";
import {
  useAppConfigQuery,
  useNavigationQuery,
  usePermissionsQuery,
} from "@/hooks/use-config-query";
import { Locale, localeLabelKeyMap } from "@/i18n";
import {
  canAccessRoute,
  getRouteIdFromPathname,
  getVisibleNavigationItems,
} from "@/lib/navigation";
import { getConfiguredLocales } from "@/lib/runtime-config";
import { dynamicLabel } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/providers/session-provider";

const routeTitleKeyMap: Record<string, string> = {
  dashboard: "nav.dashboard",
  catalog: "nav.catalog",
  orders: "nav.orders",
  repairs: "nav.repairs",
};

const routeSubtitleKeyMap: Record<string, string> = {
  dashboard: "section.clientHomeSubtitle",
  catalog: "section.clientCatalogSubtitle",
  orders: "section.clientOrdersSubtitle",
  repairs: "section.repairsSubtitle",
};

export function ClientShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const t = useTranslations();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, logout } = useAuthSession();
  const { data: appConfig } = useAppConfigQuery();
  const {
    data: navigation,
    error: navigationError,
    isPending: isNavigationPending,
  } = useNavigationQuery();
  const {
    data: permissions,
    error: permissionsError,
    isPending: isPermissionsPending,
  } = usePermissionsQuery();
  const { data: homeData } = useClientHomeQuery();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const queryString = searchParams.toString();
  const sessionRole = session?.role;
  const routeId = getRouteIdFromPathname(pathname);
  const currentLocaleLabel = t(localeLabelKeyMap[locale]);
  const supportedLocales = getConfiguredLocales(appConfig?.supportedLocales);
  const visibleNavItems = useMemo(() => {
    return getVisibleNavigationItems(
      navigation,
      locale,
      sessionRole,
      permissions,
    );
  }, [locale, navigation, permissions, sessionRole]);
  const localizedNavItems = useMemo(
    () =>
      visibleNavItems.map((item) => ({
        id: item.id,
        href: item.href,
        label: t(item.titleKey),
        subtitle: item.subtitleKey ? t(item.subtitleKey) : undefined,
      })),
    [t, visibleNavItems],
  );

  const currentPage = useMemo(() => {
    const navItem = localizedNavItems.find((item) => item.id === routeId);
    const forceClientSubtitle = routeId === "dashboard";
    return {
      title: navItem?.label ?? t(routeTitleKeyMap[routeId] ?? "nav.dashboard"),
      subtitle:
        (!forceClientSubtitle ? navItem?.subtitle : undefined) ??
        t(routeSubtitleKeyMap[routeId] ?? "section.clientHomeSubtitle"),
    };
  }, [localizedNavItems, routeId, t]);

  const isAllowed = sessionRole
    ? canAccessRoute(sessionRole, routeId, permissions)
    : false;

  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  if (!session) {
    return null;
  }

  if (isNavigationPending || isPermissionsPending) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="empty-state">{t("common.loadingWorkspace")}</div>
        </div>
      </div>
    );
  }

  if (navigationError || permissionsError) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h2>{t("labels.runtimeConfigUnavailableTitle")}</h2>
          <p className="muted">{t("labels.runtimeConfigUnavailableText")}</p>
        </div>
      </div>
    );
  }

  const localizedRole = dynamicLabel(t, session.role);

  const navContent = (
    <>
      <div className="brand-mark">
        <div className="sidebar-kicker">{t("common.brand")}</div>
        <strong className="sidebar-title">{t("meta.appName")}</strong>
        <p className="sidebar-copy muted">{t("section.clientPortalBlurb")}</p>
        <small className="sidebar-role">{localizedRole}</small>
      </div>
      <div className="sidebar-body">
        <nav className="nav-list">
          {localizedNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn("nav-link", pathname === item.href && "active")}
              onClick={() => setIsNavOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="surface sidebar-metric sidebar-footer">
        <div className="sidebar-metric-label muted">
          {homeData?.customer?.email ?? "—"}
        </div>
        <div className="sidebar-metric-value">
          {dynamicLabel(t, homeData?.customer?.tier ?? "standard")}
        </div>
        <div className="sidebar-metric-copy muted">
          {t("labels.activeOrders")}: {homeData?.orders.length ?? 0} ·{" "}
          {t("nav.repairs")}: {homeData?.repairRequests.length ?? 0}
        </div>
      </div>
    </>
  );

  return (
    <div className="app-shell">
      <aside className="sidebar">{navContent}</aside>
      <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
        <SheetContent side="left" className="sidebar sidebar-mobile p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>{t("nav.openMenu")}</SheetTitle>
          </SheetHeader>
          <div className="p-6">{navContent}</div>
        </SheetContent>
      </Sheet>
      <main className="content-area">
        <div className="topbar">
          <Button
            className="nav-toggle-button"
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setIsNavOpen(true)}
            aria-label={t("nav.openMenu")}
          >
            <Menu size={18} />
          </Button>
          <div className="topbar-copy">
            <strong>{currentPage.title}</strong>
            <div className="muted">{currentPage.subtitle}</div>
          </div>
          <div className="topbar-actions">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="topbar-action"
                  variant="outline"
                  type="button"
                  aria-label={`${t("common.language")}: ${currentLocaleLabel}`}
                  title={`${t("common.language")}: ${currentLocaleLabel}`}
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="profile-menu-trigger"
                  variant="outline"
                  aria-label={`${session.name}: ${localizedRole}`}
                >
                  <span className="profile-menu-icon">
                    <UserRound size={16} />
                  </span>
                  <span className="profile-menu-copy">
                    <span className="profile-menu-name">{session.name}</span>
                    <span className="profile-menu-role">{localizedRole}</span>
                  </span>
                  <ChevronDown size={16} className="profile-menu-chevron" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="profile-menu-content w-72"
              >
                <DropdownMenuLabel className="profile-menu-header">
                  <span className="profile-menu-header-name">
                    {session.name}
                  </span>
                  <span className="profile-menu-header-role">
                    {localizedRole}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="profile-menu-item profile-menu-item-danger"
                  onSelect={() => {
                    void logout().then(() => {
                      router.replace(`/${locale}`);
                    });
                  }}
                >
                  <LogOut size={16} />
                  {t("nav.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <div className="page-scroll">
          {isAllowed ? (
            children
          ) : (
            <section className="table-card">
              <h2>{t("labels.accessRestrictedTitle")}</h2>
              <p className="muted">{t("labels.accessRestrictedText")}</p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

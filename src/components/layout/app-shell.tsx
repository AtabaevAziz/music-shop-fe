"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  Languages,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  UserRound,
  Users,
  Warehouse,
  Wrench,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
import { queryKeys } from "@/lib/query-keys";
import { getConfiguredLocales } from "@/lib/runtime-config";
import { dynamicLabel } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useAuthSession } from "@/providers/session-provider";
import { getSettings } from "@/services/settings";

const routeTitleKeyMap: Record<string, string> = {
  dashboard: "nav.dashboard",
  catalog: "nav.catalog",
  inventory: "nav.inventory",
  orders: "nav.orders",
  customers: "nav.customers",
  repairs: "nav.repairs",
  employees: "nav.employees",
  finance: "nav.finance",
  settings: "nav.settings",
};

const routeSubtitleKeyMap: Record<string, string> = {
  dashboard: "meta.appSubtitle",
  catalog: "section.catalogSubtitle",
  inventory: "section.inventorySubtitle",
  orders: "section.ordersSubtitle",
  customers: "section.customersSubtitle",
  repairs: "section.repairsSubtitle",
  employees: "section.employeesSubtitle",
  finance: "section.financeSubtitle",
  settings: "section.settingsSubtitle",
};

const sidebarStorageKey = "music-shop-admin-sidebar-collapsed";

const navigationIcons = {
  dashboard: LayoutDashboard,
  catalog: Package,
  inventory: Warehouse,
  orders: ShoppingCart,
  customers: Users,
  repairs: Wrench,
  employees: Users,
  finance: BarChart3,
  settings: Settings,
} as const;

export function AppShell({
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
  const { data: settings } = useQuery({
    queryKey: queryKeys.settings,
    queryFn: getSettings,
    enabled: session?.role !== "client",
  });
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const queryString = searchParams.toString();
  const currentLocaleLabel = t(localeLabelKeyMap[locale]);
  const supportedLocales = getConfiguredLocales(appConfig?.supportedLocales);
  const sessionRole = session?.role;
  const routeId = getRouteIdFromPathname(pathname);
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
    return {
      title: navItem?.label ?? t(routeTitleKeyMap[routeId] ?? "nav.dashboard"),
      subtitle:
        navItem?.subtitle ??
        t(routeSubtitleKeyMap[routeId] ?? "meta.appSubtitle"),
    };
  }, [localizedNavItems, routeId, t]);

  const isAllowed = sessionRole
    ? canAccessRoute(sessionRole, routeId, permissions)
    : false;

  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);
  useEffect(() => {
    setIsSidebarCollapsed(
      window.localStorage.getItem(sidebarStorageKey) === "true",
    );
    const mediaQuery = window.matchMedia("(max-width: 1099px)");
    const updateViewport = () => {
      const isMobile = mediaQuery.matches;
      setIsMobileViewport(isMobile);
      if (!isMobile) {
        setIsNavOpen(false);
      }
    };
    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  function toggleSidebar() {
    setIsSidebarCollapsed((currentValue) => {
      const nextValue = !currentValue;
      window.localStorage.setItem(sidebarStorageKey, String(nextValue));
      return nextValue;
    });
  }

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

  function renderNavigationItem(item: (typeof localizedNavItems)[number]) {
    const Icon =
      navigationIcons[item.id as keyof typeof navigationIcons] ?? Package;
    const link = (
      <Link
        key={item.href}
        href={item.href}
        className={cn("nav-link", pathname === item.href && "active")}
        onClick={() => setIsNavOpen(false)}
        aria-label={item.label}
      >
        <Icon className="nav-link-icon" size={18} aria-hidden="true" />
        <span className="nav-link-label">{item.label}</span>
      </Link>
    );

    if (isMobileViewport || !isSidebarCollapsed) {
      return link;
    }

    return (
      <Tooltip key={item.href}>
        <TooltipTrigger asChild>{link}</TooltipTrigger>
        <TooltipContent side="right">{item.label}</TooltipContent>
      </Tooltip>
    );
  }

  const navContent = (
    <>
      <div className="brand-mark">
        <div className="sidebar-kicker">{t("common.brand")}</div>
        <strong className="sidebar-title">{t("meta.appName")}</strong>
        <p className="sidebar-copy muted">{t("meta.appSubtitle")}</p>
        <small className="sidebar-role">{localizedRole}</small>
        {!isMobileViewport && (
          <Button
            className="sidebar-collapse-toggle"
            variant="ghost"
            size="icon"
            type="button"
            onClick={toggleSidebar}
            aria-expanded={!isSidebarCollapsed}
            aria-label={
              isSidebarCollapsed
                ? t("nav.expandSidebar")
                : t("nav.collapseSidebar")
            }
            title={
              isSidebarCollapsed
                ? t("nav.expandSidebar")
                : t("nav.collapseSidebar")
            }
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen size={18} />
            ) : (
              <PanelLeftClose size={18} />
            )}
          </Button>
        )}
      </div>
      <div className="sidebar-body">
        <nav className="nav-list">
          <TooltipProvider delayDuration={120}>
            {localizedNavItems.map(renderNavigationItem)}
          </TooltipProvider>
        </nav>
      </div>
      <div className="surface sidebar-metric sidebar-footer">
        <div className="sidebar-metric-label muted">
          {t("labels.inventoryThresholdTitle")}
        </div>
        <div className="sidebar-metric-value">
          {settings?.lowStockThreshold ?? "—"}
        </div>
        <div className="sidebar-metric-copy muted">
          {t("labels.inventoryThresholdHelp")}
        </div>
      </div>
    </>
  );

  return (
    <div
      className={cn("app-shell", isSidebarCollapsed && "sidebar-collapsed")}
      data-sidebar-collapsed={isSidebarCollapsed}
    >
      <aside className="sidebar">{navContent}</aside>
      <Sheet open={isNavOpen} onOpenChange={setIsNavOpen}>
        <SheetContent
          side="left"
          className={cn(
            "sidebar sidebar-mobile p-0",
            isNavOpen && "sidebar-mobile-open",
          )}
        >
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

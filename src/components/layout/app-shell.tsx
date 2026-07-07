"use client";

import {
  ChevronDown,
  Languages,
  LogOut,
  Menu,
  Moon,
  RotateCcw,
  Sun,
  UserRound,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
import { Locale, getNextLocale, localeLabelKeyMap } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useSessionStore, useStoreDb } from "@/store/music-store";
import { Role } from "@/types/music";

type NavItem = { href: string; label: string; roles?: Role[] };

const navOrder = ["", "catalog", "inventory", "orders", "customers"] as const;
type NavSegment = (typeof navOrder)[number];

const accessMap: Record<NavSegment, Role[]> = {
  "": ["admin", "store_manager", "catalog_manager", "sales_operator"],
  catalog: ["admin", "store_manager", "catalog_manager"],
  inventory: ["admin", "store_manager", "catalog_manager"],
  orders: ["admin", "store_manager", "sales_operator"],
  customers: ["admin", "store_manager", "sales_operator"],
};

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
  const db = useStoreDb();
  const { session, logout, resetDemo } = useSessionStore();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [themeMounted, setThemeMounted] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const sessionRole = session?.role;
  const currentLocaleLabel = t(localeLabelKeyMap[locale]);
  const nextLocale = getNextLocale(locale);
  const isDark = themeMounted && resolvedTheme === "dark";
  const themeLabel = isDark
    ? t("common.switchToLight")
    : t("common.switchToDark");

  const navMap: Record<NavSegment, string> = {
    "": t("nav.dashboard"),
    catalog: t("nav.catalog"),
    inventory: t("nav.inventory"),
    orders: t("nav.orders"),
    customers: t("nav.customers"),
  };

  const navItems: NavItem[] = navOrder.map((segment) => ({
    href: `/${locale}${segment ? `/${segment}` : ""}`,
    label: navMap[segment],
    roles: accessMap[segment],
  }));
  const visibleNavItems = useMemo(
    () =>
      sessionRole
        ? navItems.filter(
            (item) => !item.roles || item.roles.includes(sessionRole),
          )
        : [],
    [navItems, sessionRole],
  );

  const rawSegment = pathname.split("/")[2] ?? "";
  const currentSegment =
    navOrder.find((segment) => segment === rawSegment) ?? "";
  const isAllowed = sessionRole
    ? (accessMap[currentSegment]?.includes(sessionRole) ?? true)
    : false;
  const pageMeta: Record<NavSegment, { title: string; subtitle: string }> = {
    "": { title: t("nav.dashboard"), subtitle: t("meta.appSubtitle") },
    catalog: {
      title: t("nav.catalog"),
      subtitle: t("section.catalogSubtitle"),
    },
    inventory: {
      title: t("nav.inventory"),
      subtitle: t("section.inventorySubtitle"),
    },
    orders: { title: t("nav.orders"), subtitle: t("section.ordersSubtitle") },
    customers: {
      title: t("nav.customers"),
      subtitle: t("section.customersSubtitle"),
    },
  };
  const currentPage = pageMeta[currentSegment] ?? pageMeta[""];

  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    setThemeMounted(true);
  }, []);

  if (!session) return null;
  const localizedRole = dynamicLabel(t, session.role);

  const navContent = (
    <>
      <div className="brand-mark">
        <div className="sidebar-kicker">{t("common.brand")}</div>
        <strong className="sidebar-title">{t("meta.appName")}</strong>
        <p className="sidebar-copy muted">{t("meta.appSubtitle")}</p>
        <small className="sidebar-role">{dynamicLabel(t, session.role)}</small>
      </div>
      <div className="sidebar-body">
        <nav className="nav-list">
          {visibleNavItems.map((item) => (
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
          {t("labels.inventoryThresholdTitle")}
        </div>
        <div className="sidebar-metric-value">
          {db.settings.lowStockThreshold}
        </div>
        <div className="sidebar-metric-copy muted">
          {t("labels.inventoryThresholdHelp")}
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
                  className="profile-menu-item"
                  onSelect={() => setTheme(isDark ? "light" : "dark")}
                >
                  {isDark ? <Moon size={16} /> : <Sun size={16} />}
                  {themeLabel}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="profile-menu-item"
                  onSelect={() =>
                    router.push(`/${nextLocale}${pathname.slice(3)}`)
                  }
                >
                  <Languages size={16} />
                  {t("common.language")}: {currentLocaleLabel}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="profile-menu-item"
                  onSelect={() => void resetDemo()}
                >
                  <RotateCcw size={16} />
                  {t("nav.resetDemo")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="profile-menu-item profile-menu-item-danger"
                  onSelect={() => {
                    logout();
                    router.replace(`/${locale}/login`);
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

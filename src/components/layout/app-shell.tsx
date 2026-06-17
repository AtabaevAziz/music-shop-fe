"use client";

import { Languages, LogOut, Menu, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { getNextLocale, localeLabelKeyMap, Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { cn } from "@/lib/utils";
import { useMusicStore } from "@/store/music-store";
import { Role } from "@/types/music";

type NavItem = { href: string; label: string; roles?: Role[] };

const navOrder = [
  "",
  "catalog",
  "categories",
  "brands",
  "inventory",
  "orders",
  "customers",
  "employees",
  "finance",
  "settings",
  "media",
] as const;

const accessMap: Record<(typeof navOrder)[number], Role[]> = {
  "": ["admin", "store_manager", "catalog_manager", "sales_operator"],
  catalog: ["admin", "store_manager", "catalog_manager"],
  categories: ["admin", "store_manager", "catalog_manager"],
  brands: ["admin", "store_manager", "catalog_manager"],
  inventory: ["admin", "store_manager", "catalog_manager"],
  orders: ["admin", "store_manager", "sales_operator"],
  customers: ["admin", "store_manager", "sales_operator"],
  employees: ["admin", "store_manager"],
  finance: ["admin", "store_manager"],
  settings: ["admin"],
  media: ["admin", "store_manager", "catalog_manager"],
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
  const { db, session, logout, resetDemo } = useMusicStore();
  const [isNavOpen, setIsNavOpen] = useState(false);
  const sessionRole = session?.role;
  const currentLocaleLabel = t(localeLabelKeyMap[locale]);
  const nextLocale = getNextLocale(locale);

  const navMap: Record<(typeof navOrder)[number], string> = {
    "": t("nav.dashboard"),
    catalog: t("nav.catalog"),
    categories: t("nav.categories"),
    brands: t("nav.brands"),
    inventory: t("nav.inventory"),
    orders: t("nav.orders"),
    customers: t("nav.customers"),
    employees: t("nav.employees"),
    finance: t("nav.finance"),
    settings: t("nav.settings"),
    media: t("nav.media"),
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

  const currentSegment = (pathname.split("/")[2] ??
    "") as (typeof navOrder)[number];
  const isAllowed = sessionRole
    ? (accessMap[currentSegment]?.includes(sessionRole) ?? true)
    : false;
  const pageMeta: Record<
    (typeof navOrder)[number],
    { title: string; subtitle: string }
  > = {
    "": { title: t("nav.dashboard"), subtitle: t("meta.appSubtitle") },
    catalog: {
      title: t("nav.catalog"),
      subtitle: t("section.catalogSubtitle"),
    },
    categories: {
      title: t("nav.categories"),
      subtitle: t("section.categoriesSubtitle"),
    },
    brands: { title: t("nav.brands"), subtitle: t("section.brandsSubtitle") },
    inventory: {
      title: t("nav.inventory"),
      subtitle: t("section.inventorySubtitle"),
    },
    orders: { title: t("nav.orders"), subtitle: t("section.ordersSubtitle") },
    customers: {
      title: t("nav.customers"),
      subtitle: t("section.customersSubtitle"),
    },
    employees: {
      title: t("nav.employees"),
      subtitle: t("section.employeesSubtitle"),
    },
    finance: {
      title: t("nav.finance"),
      subtitle: t("section.financeSubtitle"),
    },
    settings: {
      title: t("nav.settings"),
      subtitle: t("section.settingsSubtitle"),
    },
    media: { title: t("nav.media"), subtitle: t("section.mediaSubtitle") },
  };
  const currentPage = pageMeta[currentSegment] ?? pageMeta[""];

  useEffect(() => {
    setIsNavOpen(false);
  }, [pathname]);

  if (!session) return null;

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
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Languages size={16} />
                  {currentLocaleLabel}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() =>
                    router.push(`/${nextLocale}${pathname.slice(3)}`)
                  }
                >
                  <Languages size={16} />
                  {t("common.language")}: {currentLocaleLabel}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void resetDemo()}>
                  <RotateCcw size={16} />
                  {t("nav.resetDemo")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => {
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

"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Locale } from "@/i18n";
import { dynamicLabel, formatTranslatedMessage } from "@/lib/translations";
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
  const { db, session, logout, resetDemo, flash } = useMusicStore();

  if (!session) return null;

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

  const currentSegment = (pathname.split("/")[2] ??
    "") as (typeof navOrder)[number];
  const isAllowed = accessMap[currentSegment]?.includes(session.role) ?? true;
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

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="sidebar-kicker">{t("common.brand")}</div>
          <strong className="sidebar-title">{t("meta.appName")}</strong>
          <p className="sidebar-copy muted">{t("meta.appSubtitle")}</p>
          <small className="sidebar-role">
            {dynamicLabel(t, session.role)}
          </small>
        </div>
        <div className="sidebar-body">
          <nav className="nav-list">
            {navItems
              .filter(
                (item) => !item.roles || item.roles.includes(session.role),
              )
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-link${pathname === item.href ? "active" : ""}`}
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
      </aside>
      <main className="content-area">
        <div className="topbar">
          <div className="topbar-copy">
            <strong>{currentPage.title}</strong>
            <div className="muted">{currentPage.subtitle}</div>
          </div>
          <div className="topbar-actions">
            <button
              className="button-ghost"
              onClick={() =>
                router.push(
                  `/${locale === "ru" ? "en" : "ru"}${pathname.slice(3)}`,
                )
              }
            >
              {t("common.language")}: {locale.toUpperCase()}
            </button>
            <button className="button-ghost" onClick={() => void resetDemo()}>
              {t("nav.resetDemo")}
            </button>
            <button
              className="button-danger"
              onClick={() => {
                logout();
                router.replace(`/${locale}/login`);
              }}
            >
              {t("nav.logout")}
            </button>
          </div>
        </div>
        <div className="page-scroll">
          {flash ? (
            <div className={flash.kind === "error" ? "error" : "flash"}>
              {flash.message ??
                (flash.key
                  ? formatTranslatedMessage(t, flash.key, flash.params)
                  : "")}
            </div>
          ) : null}
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

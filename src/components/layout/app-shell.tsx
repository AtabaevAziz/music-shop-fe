"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
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
  const dict = getDictionary(locale);
  const pathname = usePathname();
  const router = useRouter();
  const { db, session, logout, resetDemo, flash } = useMusicStore();

  if (!session) return null;

  const navMap: Record<(typeof navOrder)[number], string> = {
    "": dict.dashboard,
    catalog: dict.catalog,
    categories: dict.categories,
    brands: dict.brands,
    inventory: dict.inventory,
    orders: dict.orders,
    customers: dict.customers,
    employees: dict.employees,
    finance: dict.finance,
    settings: dict.settings,
    media: dict.media,
  };

  const navItems: NavItem[] = navOrder.map((segment) => ({
    href: `/${locale}${segment ? `/${segment}` : ""}`,
    label: navMap[segment],
    roles: accessMap[segment],
  }));
  const currentSegment = (pathname.split("/")[2] ??
    "") as (typeof navOrder)[number];
  const isAllowed = accessMap[currentSegment]?.includes(session.role) ?? true;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <div className="sidebar-kicker">{dict.brand}</div>
          <strong className="sidebar-title">{dict.appName}</strong>
          <p className="sidebar-copy muted">{dict.appSubtitle}</p>
          <small className="sidebar-role">
            {translateDynamicLabel(locale, session.role)}
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
          <div className="sidebar-metric-label muted">Inventory threshold</div>
          <div className="sidebar-metric-value">
            {db.settings.lowStockThreshold}
          </div>
          <div className="sidebar-metric-copy muted">
            Reorder alerts use this value across inventory and dashboard views.
          </div>
        </div>
      </aside>
      <main className="content-area">
        <div className="topbar">
          <div className="topbar-copy">
            <strong>{dict.appName}</strong>
            <div className="muted">{dict.appSubtitle}</div>
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
              {dict.language}: {locale.toUpperCase()}
            </button>
            <button
              className="button-ghost"
              onClick={() => void resetDemo(dict.demoResetDone)}
            >
              {dict.resetDemo}
            </button>
            <button
              className="button-danger"
              onClick={() => {
                logout();
                router.replace(`/${locale}/login`);
              }}
            >
              {dict.logout}
            </button>
          </div>
        </div>
        <div className="page-scroll">
          {flash ? (
            <div className={flash.kind === "error" ? "error" : "flash"}>
              {flash.message}
            </div>
          ) : null}
          {isAllowed ? (
            children
          ) : (
            <section className="table-card">
              <h2>Access restricted</h2>
              <p className="muted">
                This role can sign in, but this module is intentionally hidden
                in the demo access matrix.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}

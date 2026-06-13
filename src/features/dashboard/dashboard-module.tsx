"use client";

import Image from "next/image";

import { Badge, PageHeader } from "@/components/ui/primitives";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils";
import { useMusicStore } from "@/store/music-store";

export function DashboardModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db } = useMusicStore();

  const revenue = db.orders
    .filter((order) => order.paymentStatus !== "refunded")
    .reduce(
      (sum, order) =>
        sum +
        order.items.reduce((acc, item) => acc + item.qty * item.unitPrice, 0),
      0,
    );
  const lowStock = db.products.filter(
    (product) => product.stockQty <= db.settings.lowStockThreshold,
  );
  const activeOrders = db.orders.filter(
    (order) => !["completed", "cancelled"].includes(order.status),
  );
  const completedSales = db.orders.filter(
    (order) => order.status === "completed",
  ).length;
  const featuredProducts = db.products.slice(0, 3);
  const groupedStatuses = [
    "new",
    "confirmed",
    "packed",
    "ready_for_pickup",
    "completed",
    "cancelled",
  ].map((status) => ({
    status,
    count: db.orders.filter((order) => order.status === status).length,
  }));

  return (
    <div className="dashboard-shell">
      <section className="table-card dashboard-hero">
        <PageHeader title={dict.dashboard} subtitle={dict.appSubtitle} />
        <div className="dashboard-overview">
          <div className="card metric-card">
            <div className="muted">{dict.revenue}</div>
            <div className="kpi-value">
              {formatMoney(revenue, db.settings.currency, locale)}
            </div>
          </div>
          <div className="card metric-card">
            <div className="muted">{dict.lowStock}</div>
            <div className="kpi-value">{lowStock.length}</div>
          </div>
          <div className="card metric-card">
            <div className="muted">{dict.activeOrders}</div>
            <div className="kpi-value">{activeOrders.length}</div>
          </div>
          <div className="card metric-card">
            <div className="muted">{dict.completedSales}</div>
            <div className="kpi-value">{completedSales}</div>
          </div>
        </div>
      </section>

      <div className="dashboard-panel-grid">
        <section className="table-card dashboard-panel dashboard-panel-wide">
          <PageHeader
            title={dict.lowStock}
            subtitle={dict.dashboardLowStockSubtitle}
          />
          {lowStock.length ? (
            <table>
              <thead>
                <tr>
                  <th>{dict.product}</th>
                  <th>{dict.sku}</th>
                  <th>{dict.qty}</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((product) => (
                  <tr key={product.id}>
                    <td>{product.name}</td>
                    <td>{product.sku}</td>
                    <td>
                      <Badge tone={product.stockQty === 0 ? "danger" : "warn"}>
                        {product.stockQty}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="empty-state">{dict.noData}</div>
          )}
        </section>

        <section className="table-card dashboard-panel">
          <PageHeader
            title={dict.orderPipeline}
            subtitle={dict.dashboardPipelineSubtitle}
          />
          <div className="stats-grid dashboard-status-grid">
            {groupedStatuses.map((item) => (
              <div key={item.status} className="card">
                <div className="muted">
                  {translateDynamicLabel(locale, item.status)}
                </div>
                <div className="kpi-value">{item.count}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="table-card dashboard-panel">
          <PageHeader
            title={dict.dashboardFeaturedTitle}
            subtitle={dict.dashboardFeaturedSubtitle}
          />
          <div className="list-clean">
            {featuredProducts.map((product) => {
              const previewImage = product.primaryImage ?? product.images[0];

              return (
                <article key={product.id} className="card">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt={product.name}
                      width={720}
                      height={180}
                      className="product-thumb product-thumb-featured"
                    />
                  ) : null}
                  <strong>{product.name}</strong>
                  <div className="muted">{product.sku}</div>
                  <div className="heading-row">
                    <Badge tone="neutral">
                      {translateDynamicLabel(locale, product.status)}
                    </Badge>
                    <span>
                      {formatMoney(product.price, db.settings.currency, locale)}
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="table-card dashboard-panel dashboard-panel-wide">
          <PageHeader
            title={dict.recentActivity}
            subtitle={dict.dashboardActivitySubtitle}
          />
          <ul className="list-clean activity-feed">
            {db.activity.map((item) => (
              <li key={item.id} className="card">
                <strong>{item.title}</strong>
                <div className="muted">
                  {new Date(item.timestamp).toLocaleString(
                    locale === "ru" ? "ru-RU" : "en-US",
                  )}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

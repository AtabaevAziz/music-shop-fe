"use client";

import { useMusicStore } from "@/data/store";
import { getDictionary, Locale } from "@/lib/i18n";
import { formatMoney } from "@/lib/utils";
import { Badge, PageHeader } from "@/components/ui";

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
    <div className="hero-grid" style={{ gap: 20 }}>
      <section className="table-card" style={{ gridColumn: "1 / -1" }}>
        <PageHeader title={dict.dashboard} subtitle={dict.appSubtitle} />
        <div className="stats-grid">
          <div className="card">
            <div className="muted">{dict.revenue}</div>
            <div className="kpi-value">
              {formatMoney(revenue, db.settings.currency, locale)}
            </div>
          </div>
          <div className="card">
            <div className="muted">{dict.lowStock}</div>
            <div className="kpi-value">{lowStock.length}</div>
          </div>
          <div className="card">
            <div className="muted">{dict.activeOrders}</div>
            <div className="kpi-value">{activeOrders.length}</div>
          </div>
          <div className="card">
            <div className="muted">{dict.completedSales}</div>
            <div className="kpi-value">{completedSales}</div>
          </div>
        </div>
      </section>

      <section className="table-card">
        <PageHeader
          title={dict.lowStock}
          subtitle="Products below replenishment threshold"
        />
        {lowStock.length ? (
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Qty</th>
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

      <section className="table-card">
        <PageHeader
          title={dict.orderPipeline}
          subtitle="Operational fulfillment visibility"
        />
        <div className="stats-grid">
          {groupedStatuses.map((item) => (
            <div key={item.status} className="card">
              <div className="muted">{item.status}</div>
              <div className="kpi-value">{item.count}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="table-card">
        <PageHeader
          title={dict.recentActivity}
          subtitle="Latest browser-side demo events"
        />
        <ul className="list-clean">
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
  );
}

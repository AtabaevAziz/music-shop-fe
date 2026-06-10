"use client";

import { PageHeader, Badge, Money } from "@/components/ui";
import { useMusicStore } from "@/data/store";
import { getDictionary, Locale } from "@/lib/i18n";

export function FinanceModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db } = useMusicStore();
  const rows = db.orders.map((order) => {
    const total = order.items.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0,
    );
    const cost = order.items.reduce((sum, item) => {
      const product = db.products.find((entry) => entry.id === item.productId);
      return sum + (product?.costPrice ?? 0) * item.qty;
    }, 0);
    return { order, total, margin: total - cost };
  });

  const totalRevenue = rows.reduce((sum, row) => sum + row.total, 0);
  const totalMargin = rows.reduce((sum, row) => sum + row.margin, 0);

  return (
    <div className="hero-grid" style={{ gap: 20 }}>
      <section className="table-card" style={{ gridColumn: "1 / -1" }}>
        <PageHeader
          title={dict.financeVisibility}
          subtitle="Revenue and margin awareness for internal operations."
        />
        <div className="stats-grid">
          <div className="card">
            <div className="muted">{dict.revenue}</div>
            <div className="kpi-value">
              <Money
                value={totalRevenue}
                currency={db.settings.currency}
                locale={locale}
              />
            </div>
          </div>
          <div className="card">
            <div className="muted">Gross margin</div>
            <div className="kpi-value">
              <Money
                value={totalMargin}
                currency={db.settings.currency}
                locale={locale}
              />
            </div>
          </div>
          <div className="card">
            <div className="muted">Paid orders</div>
            <div className="kpi-value">
              {
                db.orders.filter((order) => order.paymentStatus === "paid")
                  .length
              }
            </div>
          </div>
        </div>
      </section>
      <section className="table-card" style={{ gridColumn: "1 / -1" }}>
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Total</th>
              <th>Margin</th>
              <th>{dict.paymentState}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ order, total, margin }) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>
                  <Money
                    value={total}
                    currency={db.settings.currency}
                    locale={locale}
                  />
                </td>
                <td>
                  <Money
                    value={margin}
                    currency={db.settings.currency}
                    locale={locale}
                  />
                </td>
                <td>
                  <Badge
                    tone={order.paymentStatus === "paid" ? "success" : "warn"}
                  >
                    {order.paymentStatus}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

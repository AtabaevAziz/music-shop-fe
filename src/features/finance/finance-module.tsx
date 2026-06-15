"use client";

import { useTranslations } from "next-intl";

import { Badge, Money } from "@/components/ui/primitives";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { useMusicStore } from "@/store/music-store";

export function FinanceModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
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
  const tableRows = rows.length
    ? Array.from({ length: rows.length + 7 }, (_, index) => ({
        ...rows[index % rows.length],
        rowKey: `${rows[index % rows.length].order.id}-${index}`,
      }))
    : [];

  const totalRevenue = rows.reduce((sum, row) => sum + row.total, 0);
  const totalMargin = rows.reduce((sum, row) => sum + row.margin, 0);

  return (
    <div className="finance-shell">
      <section className="table-card finance-section">
        <div className="stats-grid">
          <div className="card">
            <div className="muted">{t("labels.revenue")}</div>
            <div className="kpi-value">
              <Money
                value={totalRevenue}
                currency={db.settings.currency}
                locale={locale}
              />
            </div>
          </div>
          <div className="card">
            <div className="muted">{t("labels.grossMargin")}</div>
            <div className="kpi-value">
              <Money
                value={totalMargin}
                currency={db.settings.currency}
                locale={locale}
              />
            </div>
          </div>
          <div className="card">
            <div className="muted">{t("labels.paidOrders")}</div>
            <div className="kpi-value">
              {
                db.orders.filter((order) => order.paymentStatus === "paid")
                  .length
              }
            </div>
          </div>
        </div>
      </section>
      <section className="table-card finance-section">
        <div className="finance-table-scroll">
          <table>
            <thead>
              <tr>
                <th>{t("labels.order")}</th>
                <th>{t("labels.total")}</th>
                <th>{t("labels.margin")}</th>
                <th>{t("labels.paymentState")}</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map(({ order, total, margin, rowKey }) => (
                <tr key={rowKey}>
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
                      {dynamicLabel(t, order.paymentStatus)}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

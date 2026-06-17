"use client";

import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney } from "@/lib/utils";
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
          <Card>
            <CardContent className="p-6">
            <div className="muted">{t("labels.revenue")}</div>
            <div className="kpi-value">
              {formatMoney(totalRevenue, db.settings.currency, locale)}
            </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
            <div className="muted">{t("labels.grossMargin")}</div>
            <div className="kpi-value">
              {formatMoney(totalMargin, db.settings.currency, locale)}
            </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
            <div className="muted">{t("labels.paidOrders")}</div>
            <div className="kpi-value">
              {
                db.orders.filter((order) => order.paymentStatus === "paid")
                  .length
              }
            </div>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="table-card finance-section">
        <div className="finance-table-scroll responsive-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("labels.order")}</TableHead>
                <TableHead>{t("labels.total")}</TableHead>
                <TableHead>{t("labels.margin")}</TableHead>
                <TableHead>{t("labels.paymentState")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tableRows.map(({ order, total, margin, rowKey }) => (
                <TableRow key={rowKey}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    {formatMoney(total, db.settings.currency, locale)}
                  </TableCell>
                  <TableCell>
                    {formatMoney(margin, db.settings.currency, locale)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.paymentStatus === "paid" ? "success" : "warning"
                      }
                    >
                      {dynamicLabel(t, order.paymentStatus)}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}

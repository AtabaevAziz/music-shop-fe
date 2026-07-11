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
import { useFinanceQuery } from "@/hooks/use-finance-query";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney } from "@/lib/utils";

export function FinanceModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { data, isPending } = useFinanceQuery();

  if (isPending || !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  const rows = data.orders.map((order) => {
    const total = order.items.reduce(
      (sum, item) => sum + item.qty * item.unitPrice,
      0,
    );
    const cost = order.items.reduce((sum, item) => {
      const product = data.products.find(
        (entry) => entry.id === item.productId,
      );
      return sum + (product?.costPrice ?? 0) * item.qty;
    }, 0);
    return { order, total, margin: total - cost };
  });

  return (
    <div className="finance-shell">
      <section className="table-card finance-section">
        <div className="stats-grid">
          <Card>
            <CardContent className="p-6">
              <div className="muted">{t("labels.revenue")}</div>
              <div className="kpi-value">
                {formatMoney(
                  data.summary.revenue,
                  data.summary.currency,
                  locale,
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="muted">{t("labels.grossMargin")}</div>
              <div className="kpi-value">
                {formatMoney(
                  data.summary.grossMargin,
                  data.summary.currency,
                  locale,
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="muted">{t("labels.paidOrders")}</div>
              <div className="kpi-value">{data.summary.paidOrders}</div>
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
              {rows.map(({ order, total, margin }) => (
                <TableRow key={order.id}>
                  <TableCell>{order.id}</TableCell>
                  <TableCell>
                    {formatMoney(total, data.settings.currency, locale)}
                  </TableCell>
                  <TableCell>
                    {formatMoney(margin, data.settings.currency, locale)}
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
          {rows.length === 0 ? (
            <div className="empty-state">{t("common.noData")}</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

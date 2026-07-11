"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useClientOrdersQuery } from "@/hooks/use-orders-query";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, getIntlLocale } from "@/lib/utils";

export function ClientOrdersModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { data, isPending } = useClientOrdersQuery();

  if (isPending || !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  return (
    <section className="table-card space-y-4">
      <PageHeader
        title={t("labels.latestOrders")}
        subtitle={t("section.clientOrdersSubtitle")}
      />
      <div className="list-clean">
        {data.orders.map((order) => {
          const total = order.items.reduce(
            (sum, item) => sum + item.qty * item.unitPrice,
            0,
          );

          return (
            <Card key={order.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <strong>{order.id}</strong>
                    <div className="muted">
                      {new Date(order.updatedAt).toLocaleString(
                        getIntlLocale(locale),
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        order.paymentStatus === "paid"
                          ? "success"
                          : order.paymentStatus === "pending"
                            ? "warning"
                            : "secondary"
                      }
                    >
                      {dynamicLabel(t, order.paymentStatus)}
                    </Badge>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "success"
                          : order.status === "cancelled"
                            ? "destructive"
                            : order.status === "ready_for_pickup"
                              ? "warning"
                              : "secondary"
                      }
                    >
                      {dynamicLabel(t, order.status)}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {order.items.map((item) => {
                    const product = data.products.find(
                      (entry) => entry.id === item.productId,
                    );

                    return (
                      <div
                        key={`${order.id}-${item.productId}`}
                        className="heading-row"
                      >
                        <span>
                          {product?.name ?? item.productId} x {item.qty}
                        </span>
                        <span>
                          {formatMoney(
                            item.qty * item.unitPrice,
                            data.settings.currency,
                            locale,
                          )}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="heading-row">
                  <div className="muted">{order.notes}</div>
                  <strong>
                    {formatMoney(total, data.settings.currency, locale)}
                  </strong>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {data.orders.length === 0 ? (
          <div className="empty-state">{t("common.noData")}</div>
        ) : null}
      </div>
    </section>
  );
}

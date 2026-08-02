"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useClientOrdersQuery } from "@/hooks/use-orders-query";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, getIntlLocale } from "@/lib/utils";
import type { OrderStage } from "@/types/music";

function getStageLabelKey(stage: OrderStage) {
  switch (stage) {
    case "intake":
      return "labels.stageIntake";
    case "payment":
      return "labels.stagePayment";
    case "warehouse":
      return "labels.stageWarehouse";
    case "packing":
      return "labels.stagePacking";
    case "shipment":
      return "labels.stageShipment";
    case "exception":
      return "labels.stageException";
    case "completed":
      return "labels.stageCompleted";
    default:
      return "labels.operationsStage";
  }
}

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
          const total = order.total;

          return (
            <Card key={order.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <strong>{order.orderNumber}</strong>
                    <div className="muted">
                      {new Date(order.updatedAt).toLocaleString(
                        getIntlLocale(locale),
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={
                        order.stage === "completed"
                          ? "success"
                          : order.stage === "exception"
                            ? "destructive"
                            : order.stage === "shipment" ||
                                order.stage === "packing"
                              ? "warning"
                              : "secondary"
                      }
                    >
                      {t(getStageLabelKey(order.stage))}
                    </Badge>
                    <Badge
                      variant={
                        order.paymentStatus === "paid"
                          ? "success"
                          : order.paymentStatus === "pending"
                            ? "warning"
                            : order.paymentStatus === "failed"
                              ? "destructive"
                              : "secondary"
                      }
                    >
                      {dynamicLabel(t, order.paymentStatus)}
                    </Badge>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "success"
                          : order.status === "cancelled"
                            ? "destructive"
                            : order.status === "packed" ||
                                order.status === "shipped"
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
                          {product?.name ?? item.productName ?? item.productId}{" "}
                          x {item.quantity}
                        </span>
                        <span>
                          {formatMoney(item.totalPrice, data.currency, locale)}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="heading-row">
                  <div className="muted">
                    {order.delivery?.trackingNumber ?? order.notes}
                  </div>
                  <strong>{formatMoney(total, data.currency, locale)}</strong>
                </div>
                <div className="muted">{order.address.formatted}</div>
                {order.delivery ? (
                  <div className="muted">
                    {dynamicLabel(t, order.delivery.status)}
                  </div>
                ) : null}
                {order.timeline.length > 0 ? (
                  <div className="space-y-2">
                    <strong>{t("labels.statusHistory")}</strong>
                    <div className="space-y-2">
                      {order.timeline
                        .slice(-4)
                        .reverse()
                        .map((entry) => (
                          <div
                            key={`${order.id}-${entry.type}-${entry.happenedAt}-${entry.status}`}
                            className="heading-row text-sm"
                          >
                            <span>{dynamicLabel(t, entry.status)}</span>
                            <span className="muted">
                              {new Date(entry.happenedAt).toLocaleString(
                                getIntlLocale(locale),
                              )}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                ) : null}
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

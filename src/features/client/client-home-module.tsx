"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useClientHomeQuery } from "@/hooks/use-client-home-query";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, getIntlLocale } from "@/lib/utils";

export function ClientHomeModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { data, isPending } = useClientHomeQuery();

  if (isPending || !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  return (
    <div className="dashboard-shell">
      <section className="table-card dashboard-hero">
        <PageHeader
          title={data.customer?.name ?? t("dynamic.client")}
          subtitle={t("section.clientHomeSubtitle")}
        />
        <div className="dashboard-overview">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.activeOrders")}</div>
              <div className="kpi-value">{data.activeOrdersCount}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("nav.repairs")}</div>
              <div className="kpi-value">{data.openRepairsCount}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.readyForPickup")}</div>
              <div className="kpi-value">{data.readyCount}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.totalSpent")}</div>
              <div className="kpi-value">
                {formatMoney(data.spent, data.currency, locale)}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="dashboard-panel-grid">
        <section className="table-card dashboard-panel">
          <PageHeader
            title={t("labels.latestOrders")}
            subtitle={t("section.clientOrdersSubtitle")}
          />
          <div className="list-clean">
            {data.orders.slice(0, 3).map((order) => (
              <Card key={order.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="heading-row">
                    <strong>{order.orderNumber}</strong>
                    <Badge
                      variant={
                        order.status === "delivered"
                          ? "success"
                          : order.status === "cancelled"
                            ? "destructive"
                            : order.status === "packed" || order.status === "shipped"
                              ? "warning"
                            : "secondary"
                      }
                    >
                      {dynamicLabel(t, order.status)}
                    </Badge>
                  </div>
                  <div className="muted">
                    {new Date(order.updatedAt).toLocaleString(
                      getIntlLocale(locale),
                    )}
                  </div>
                  <div>{order.delivery?.address ?? order.notes}</div>
                </CardContent>
              </Card>
            ))}
            {data.orders.length === 0 ? (
              <div className="empty-state">{t("common.noData")}</div>
            ) : null}
          </div>
        </section>

        <section className="table-card dashboard-panel">
          <PageHeader
            title={t("labels.latestRepairs")}
            subtitle={t("section.repairsSubtitle")}
          />
          <div className="list-clean">
            {data.repairRequests.slice(0, 3).map((request) => (
              <Card key={request.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="heading-row">
                    <strong>{request.instrumentName}</strong>
                    <Badge
                      variant={
                        request.status === "completed"
                          ? "success"
                          : request.status === "cancelled"
                            ? "destructive"
                            : request.status === "ready"
                              ? "warning"
                              : "secondary"
                      }
                    >
                      {dynamicLabel(t, request.status)}
                    </Badge>
                  </div>
                  <div className="muted">{request.id}</div>
                  <div>{request.issue}</div>
                </CardContent>
              </Card>
            ))}
            {data.repairRequests.length === 0 ? (
              <div className="empty-state">{t("common.noData")}</div>
            ) : null}
          </div>
        </section>

        <section className="table-card dashboard-panel">
          <PageHeader
            title={t("dashboard.featuredTitle")}
            subtitle={t("section.clientCatalogSubtitle")}
          />
          <div className="list-clean">
            {data.featuredProducts.map((product) => {
              const previewImage = product.primaryImage ?? product.images[0];

              return (
                <Card key={product.id}>
                  <CardContent className="space-y-4 p-5">
                    {previewImage ? (
                      <div className="product-thumb-frame product-thumb-frame-featured">
                        <Image
                          src={previewImage}
                          alt={product.name}
                          width={720}
                          height={180}
                          className="product-thumb product-thumb-featured"
                        />
                      </div>
                    ) : null}
                    <strong>{product.name}</strong>
                    <div className="heading-row">
                      <Badge variant="secondary">
                        {dynamicLabel(t, product.condition)}
                      </Badge>
                      <span>
                        {formatMoney(product.price, data.currency, locale)}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="table-card dashboard-panel dashboard-panel-wide">
          <PageHeader
            title={t("labels.recentActivity")}
            subtitle={t("dashboard.activitySubtitle")}
          />
          <ul className="list-clean activity-feed">
            {data.recentActivity.map((item) => (
              <Card key={item.id}>
                <CardContent className="space-y-2 p-5">
                  <strong>
                    {"items" in item
                      ? `${t("labels.order")} ${item.id}`
                      : `${t("nav.repairs")} ${item.id}`}
                  </strong>
                  <div>{dynamicLabel(t, item.status)}</div>
                  <div className="muted">
                    {new Date(item.updatedAt).toLocaleString(
                      getIntlLocale(locale),
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            {data.recentActivity.length === 0 ? (
              <div className="empty-state">{t("common.noData")}</div>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}

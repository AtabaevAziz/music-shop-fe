"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, getIntlLocale } from "@/lib/utils";
import { useClientStore } from "@/store/music-store";

export function ClientHomeModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { customer, orders, repairRequests, products, settings } =
    useClientStore();
  const activeOrders = orders.filter(
    (order) => !["completed", "cancelled"].includes(order.status),
  );
  const activeProducts = products.filter(
    (product) => product.status === "active",
  );
  const openRepairs = repairRequests.filter(
    (request) => !["completed", "cancelled"].includes(request.status),
  );
  const readyCount =
    orders.filter((order) => order.status === "ready_for_pickup").length +
    repairRequests.filter((request) => request.status === "ready").length;
  const spent = orders.reduce(
    (sum, order) =>
      sum +
      order.items.reduce((acc, item) => acc + item.qty * item.unitPrice, 0),
    0,
  );
  const featuredProducts = activeProducts.slice(0, 3);
  const recentActivity = [...orders, ...repairRequests]
    .sort(
      (left, right) =>
        new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
    )
    .slice(0, 4);

  return (
    <div className="dashboard-shell">
      <section className="table-card dashboard-hero">
        <PageHeader
          title={customer?.name ?? t("dynamic.client")}
          subtitle={t("section.clientHomeSubtitle")}
        />
        <div className="dashboard-overview">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.activeOrders")}</div>
              <div className="kpi-value">{activeOrders.length}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("nav.repairs")}</div>
              <div className="kpi-value">{openRepairs.length}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.readyForPickup")}</div>
              <div className="kpi-value">{readyCount}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.totalSpent")}</div>
              <div className="kpi-value">
                {formatMoney(spent, settings.currency, locale)}
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
            {orders.slice(0, 3).map((order) => (
              <Card key={order.id}>
                <CardContent className="space-y-3 p-5">
                  <div className="heading-row">
                    <strong>{order.id}</strong>
                    <Badge
                      variant={
                        order.status === "completed"
                          ? "success"
                          : order.status === "cancelled"
                            ? "destructive"
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
                  <div>{order.notes}</div>
                </CardContent>
              </Card>
            ))}
            {orders.length === 0 ? (
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
            {repairRequests.slice(0, 3).map((request) => (
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
            {repairRequests.length === 0 ? (
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
            {featuredProducts.map((product) => {
              const previewImage = product.primaryImage ?? product.images[0];

              return (
                <Card key={product.id}>
                  <CardContent className="space-y-4 p-5">
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
                    <div className="heading-row">
                      <Badge variant="secondary">
                        {dynamicLabel(t, product.condition)}
                      </Badge>
                      <span>
                        {formatMoney(product.price, settings.currency, locale)}
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
            {recentActivity.map((item) => (
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
            {recentActivity.length === 0 ? (
              <div className="empty-state">{t("common.noData")}</div>
            ) : null}
          </ul>
        </section>
      </div>
    </div>
  );
}

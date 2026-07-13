"use client";

import { useTranslations } from "next-intl";

import { PageHeader } from "@/components/shared/page-header";
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
import { useDashboardQuery } from "@/hooks/use-dashboard-query";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, getIntlLocale } from "@/lib/utils";

export function DashboardModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { data, isPending } = useDashboardQuery();

  if (isPending || !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  const customerMap = Object.fromEntries(
    data.customers.map((customer) => [
      customer.id,
      customer.fullName ?? customer.name,
    ]),
  );

  return (
    <div className="dashboard-shell">
      <section className="table-card dashboard-hero">
        <PageHeader
          title={t("nav.dashboard")}
          subtitle={t("meta.appSubtitle")}
        />
        <div className="dashboard-overview">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.productsCount")}</div>
              <div className="kpi-value">{data.products.length}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.ordersCount")}</div>
              <div className="kpi-value">{data.orders.length}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.repairRequestsCount")}</div>
              <div className="kpi-value">{data.repairs.length}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.customersCount")}</div>
              <div className="kpi-value">{data.customers.length}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="dashboard-panel-grid">
        <section className="table-card dashboard-panel dashboard-panel-wide">
          <PageHeader
            title={t("labels.lowStockProducts")}
            subtitle={t("dashboard.lowStockSubtitle")}
          />
          {data.lowStock.length ? (
            <div className="responsive-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("labels.product")}</TableHead>
                    <TableHead>{t("labels.sku")}</TableHead>
                    <TableHead>{t("labels.stock")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.lowStock.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            product.stockQty === 0 ? "destructive" : "warning"
                          }
                        >
                          {product.stockQty}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="empty-state">{t("common.noData")}</div>
          )}
        </section>

        <section className="table-card dashboard-panel">
          <PageHeader
            title={t("labels.latestOrders")}
            subtitle={t("section.ordersSubtitle")}
          />
          {data.latestOrders.length ? (
            <div className="responsive-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("labels.orderNumber")}</TableHead>
                    <TableHead>{t("labels.customer")}</TableHead>
                    <TableHead>{t("labels.total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.latestOrders.map((order) => {
                    const total = order.items.reduce(
                      (sum, item) => sum + item.qty * item.unitPrice,
                      0,
                    );

                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <strong>{order.id}</strong>
                            <div className="muted">
                              {new Date(order.createdAt).toLocaleDateString(
                                getIntlLocale(locale),
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {customerMap[order.customerId] ?? order.customerId}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div>
                              {formatMoney(
                                total,
                                data.settings.currency,
                                locale,
                              )}
                            </div>
                            <Badge variant="secondary">
                              {dynamicLabel(t, order.status)}
                            </Badge>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="empty-state">{t("common.noData")}</div>
          )}
        </section>

        <section className="table-card dashboard-panel dashboard-panel-wide">
          <PageHeader
            title={t("labels.latestRepairs")}
            subtitle={t("section.repairsSubtitle")}
          />
          {data.latestRepairs.length ? (
            <div className="responsive-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("labels.requestNumber")}</TableHead>
                    <TableHead>{t("labels.customer")}</TableHead>
                    <TableHead>{t("labels.instrumentName")}</TableHead>
                    <TableHead>{t("common.status")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.latestRepairs.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <strong>{request.id}</strong>
                          <div className="muted">
                            {new Date(
                              request.receivedAt ??
                                request.createdAt ??
                                request.updatedAt,
                            ).toLocaleDateString(getIntlLocale(locale))}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customerMap[request.customerId] ?? request.customerId}
                      </TableCell>
                      <TableCell>{request.instrumentName}</TableCell>
                      <TableCell>
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
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="empty-state">{t("common.noData")}</div>
          )}
        </section>
      </div>
    </div>
  );
}

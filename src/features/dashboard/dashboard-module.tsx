"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";

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
import { dynamicLabel, formatTranslatedMessage } from "@/lib/translations";
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

  return (
    <div className="dashboard-shell">
      <section className="table-card dashboard-hero">
        <div className="dashboard-overview">
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.revenue")}</div>
              <div className="kpi-value">
                {formatMoney(data.revenue, data.settings.currency, locale)}
              </div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.lowStock")}</div>
              <div className="kpi-value">{data.lowStock.length}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.activeOrders")}</div>
              <div className="kpi-value">{data.activeOrdersCount}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.completedSales")}</div>
              <div className="kpi-value">{data.completedSalesCount}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="dashboard-panel-grid">
        <section className="table-card dashboard-panel dashboard-panel-wide">
          <PageHeader
            title={t("labels.lowStock")}
            subtitle={t("dashboard.lowStockSubtitle")}
          />
          {data.lowStock.length ? (
            <div className="responsive-table">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("labels.product")}</TableHead>
                    <TableHead>{t("labels.sku")}</TableHead>
                    <TableHead>{t("labels.qty")}</TableHead>
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
            title={t("labels.orderPipeline")}
            subtitle={t("dashboard.pipelineSubtitle")}
          />
          <div className="stats-grid dashboard-status-grid">
            {data.orderPipeline.map((item) => (
              <Card key={item.status}>
                <CardContent className="space-y-2 p-5">
                  <div className="muted">{dynamicLabel(t, item.status)}</div>
                  <div className="kpi-value">{item.count}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="table-card dashboard-panel">
          <PageHeader
            title={t("dashboard.featuredTitle")}
            subtitle={t("dashboard.featuredSubtitle")}
          />
          <div className="list-clean">
            {data.featuredProducts.map((product) => {
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
                    <div className="muted">{product.sku}</div>
                    <div className="heading-row">
                      <Badge variant="secondary">
                        {dynamicLabel(t, product.status)}
                      </Badge>
                      <span>
                        {formatMoney(
                          product.price,
                          data.settings.currency,
                          locale,
                        )}
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
            {data.activity.map((item) => (
              <Card key={item.id}>
                <CardContent className="space-y-2 p-5">
                  <strong>
                    {item.messageKey
                      ? formatTranslatedMessage(
                          t,
                          item.messageKey,
                          item.messageParams,
                        )
                      : item.title}
                  </strong>
                  <div className="muted">
                    {new Date(item.timestamp).toLocaleString(
                      getIntlLocale(locale),
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}

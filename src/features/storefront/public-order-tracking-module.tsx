"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";

import { AppField } from "@/components/shared/form-field";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAppConfigQuery } from "@/hooks/use-config-query";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, getIntlLocale } from "@/lib/utils";
import { getPublicOrder } from "@/services/public";
import type { Order, OrderStage } from "@/types/music";

type LookupFormState = {
  orderNumber: string;
  phone: string;
  email: string;
};

function getStatusVariant(status: Order["status"]) {
  if (status === "delivered") {
    return "success" as const;
  }
  if (status === "cancelled" || status === "stock_problem") {
    return "destructive" as const;
  }
  if (
    status === "packed" ||
    status === "ready_for_shipment" ||
    status === "shipped"
  ) {
    return "warning" as const;
  }
  return "secondary" as const;
}

function getTimelineVariant(
  type: Order["timeline"][number]["type"],
  status: string,
) {
  if (type === "payment") {
    if (status === "paid") {
      return "success" as const;
    }
    if (
      status === "failed" ||
      status === "cancelled" ||
      status === "refunded"
    ) {
      return "destructive" as const;
    }
    return "warning" as const;
  }

  if (type === "delivery") {
    if (status === "delivered") {
      return "success" as const;
    }
    if (status === "delivery_failed" || status === "returned") {
      return "destructive" as const;
    }
    return "warning" as const;
  }

  return getStatusVariant(status as Order["status"]);
}

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

export function PublicOrderTrackingModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { data: appConfig } = useAppConfigQuery();
  const currency = appConfig?.defaultCurrency ?? "UZS";
  const [lookup, setLookup] = useState<LookupFormState>({
    orderNumber: "",
    phone: "",
    email: "",
  });
  const [lookupError, setLookupError] = useState("");
  const trackingMutation = useMutation({
    mutationFn: getPublicOrder,
  });

  const order = trackingMutation.data ?? null;

  return (
    <div className="storefront-flow">
      <section className="storefront-section storefront-section-tight">
        <div className="storefront-section-head">
          <div className="storefront-section-title">
            <h1>{t("storefront.orderTrackingPageTitle")}</h1>
          </div>
          <div className="storefront-section-copy">
            <p>{t("storefront.orderTrackingPageText")}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card className="storefront-product-card h-fit">
          <CardContent className="grid gap-4 p-5">
            <strong>{t("storefront.trackOrderLink")}</strong>
            <p className="muted">{t("storefront.orderTrackingHint")}</p>
            <form
              className="grid gap-4"
              onSubmit={async (event) => {
                event.preventDefault();
                setLookupError("");

                if (!lookup.orderNumber.trim()) {
                  setLookupError(t("labels.validationFailed"));
                  return;
                }

                if (!lookup.phone.trim() && !lookup.email.trim()) {
                  setLookupError(t("storefront.orderTrackingVerifierRequired"));
                  return;
                }

                try {
                  await trackingMutation.mutateAsync({
                    orderNumber: lookup.orderNumber.trim(),
                    phone: lookup.phone.trim() || undefined,
                    email: lookup.email.trim() || undefined,
                  });
                } catch (error) {
                  setLookupError(
                    error instanceof Error
                      ? error.message
                      : t("common.unexpectedError"),
                  );
                }
              }}
            >
              <AppField label={t("labels.orderNumber")}>
                <Input
                  value={lookup.orderNumber}
                  placeholder="ORD-1001"
                  onChange={(event) =>
                    setLookup((current) => ({
                      ...current,
                      orderNumber: event.target.value,
                    }))
                  }
                />
              </AppField>
              <AppField label={t("labels.phone")}>
                <Input
                  value={lookup.phone}
                  onChange={(event) =>
                    setLookup((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                />
              </AppField>
              <AppField label={t("labels.emailOptional")}>
                <Input
                  type="email"
                  value={lookup.email}
                  onChange={(event) =>
                    setLookup((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                />
              </AppField>
              {lookupError ? <div className="error">{lookupError}</div> : null}
              <Button type="submit" disabled={trackingMutation.isPending}>
                {trackingMutation.isPending
                  ? t("common.loadingWorkspace")
                  : t("storefront.trackOrderAction")}
              </Button>
            </form>
          </CardContent>
        </Card>

        {order ? (
          <Card className="storefront-product-card">
            <CardContent className="grid gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <strong>{order.orderNumber}</strong>
                  <div className="muted">{order.customer.name}</div>
                  <div className="muted">{order.address.formatted}</div>
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
                  <Badge variant={getStatusVariant(order.status)}>
                    {dynamicLabel(t, order.status)}
                  </Badge>
                  <Badge
                    variant={
                      order.paymentStatus === "paid"
                        ? "success"
                        : order.paymentStatus === "failed" ||
                            order.paymentStatus === "cancelled" ||
                            order.paymentStatus === "refunded"
                          ? "destructive"
                          : "warning"
                    }
                  >
                    {dynamicLabel(t, order.paymentStatus)}
                  </Badge>
                  {order.deliveryStatus ? (
                    <Badge variant="outline">
                      {dynamicLabel(t, order.deliveryStatus)}
                    </Badge>
                  ) : null}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <Card>
                  <CardContent className="space-y-2 p-4">
                    <div className="muted">{t("labels.total")}</div>
                    <div>{formatMoney(order.total, currency, locale)}</div>
                    <div className="muted">
                      {dynamicLabel(t, order.deliveryMethod)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-2 p-4">
                    <div className="muted">{t("labels.trackingNumber")}</div>
                    <div>
                      {order.delivery?.trackingNumber ?? t("common.noData")}
                    </div>
                    <div className="muted">
                      {order.delivery?.company ?? t("common.noData")}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <strong>{t("storefront.orderSummaryTitle")}</strong>
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div
                      key={`${order.id}-${item.productId}`}
                      className="heading-row rounded-lg border border-border px-3 py-2"
                    >
                      <span>
                        {item.productName} x {item.quantity}
                      </span>
                      <span>
                        {formatMoney(item.totalPrice, currency, locale)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <strong>{t("labels.statusHistory")}</strong>
                <div className="space-y-3">
                  {[...order.timeline].reverse().map((entry) => (
                    <div
                      key={`${entry.type}-${entry.happenedAt}-${entry.status}`}
                      className="rounded-lg border border-border px-3 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge
                          variant={getTimelineVariant(entry.type, entry.status)}
                        >
                          {dynamicLabel(t, entry.status)}
                        </Badge>
                        <div className="muted">
                          {new Date(entry.happenedAt).toLocaleString(
                            getIntlLocale(locale),
                          )}
                        </div>
                      </div>
                      <div className="muted mt-2">
                        {entry.comment ?? t("common.noData")}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {order.warehouseIssue ? (
                <AppField label={t("labels.warehouseIssue")}>
                  <Textarea
                    readOnly
                    value={`${order.warehouseIssue.type}\n${order.warehouseIssue.comment ?? ""}`.trim()}
                  />
                </AppField>
              ) : null}

              <div className="flex flex-wrap gap-3">
                <Button asChild>
                  <Link href={`/${locale}/catalog`}>
                    {t("storefront.continueShopping")}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/${locale}/contacts`}>
                    {t("storefront.contactsPageTitle")}
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="storefront-empty-card">
            <CardContent className="grid gap-3 p-6 text-center">
              <strong>{t("storefront.orderTrackingEmptyTitle")}</strong>
              <p className="muted">{t("storefront.orderTrackingEmptyText")}</p>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}

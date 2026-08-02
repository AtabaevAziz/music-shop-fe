"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { AppField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminOrdersQuery } from "@/hooks/use-orders-query";
import { Locale } from "@/i18n";
import { invalidateAppQueries } from "@/lib/query-utils";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, getIntlLocale } from "@/lib/utils";
import { changeOrderPaymentStatus, changeOrderStatus } from "@/services/orders";
import type {
  ChangeOrderPaymentRequest,
  ChangeOrderStatusRequest,
} from "@/services/orders/orders-types";
import type {
  Order,
  OrderStage,
  OrderStatus,
  PaymentStatus,
} from "@/types/music";

type WorkflowFormState = {
  comment: string;
  carrier: string;
  trackingNumber: string;
  packageType: string;
  weightGrams: string;
  lengthCm: string;
  widthCm: string;
  heightCm: string;
  serialNumbers: string;
  warehouseIssueType: string;
  packagingComment: string;
  fragile: boolean;
};

type PaymentFormState = {
  paymentStatus: PaymentStatus;
  transactionId: string;
  provider: string;
  comment: string;
};

const paymentStatusOptions: PaymentStatus[] = [
  "pending",
  "processing",
  "paid",
  "failed",
  "cancelled",
  "refunded",
];

const stageOrder: OrderStage[] = [
  "intake",
  "payment",
  "warehouse",
  "packing",
  "shipment",
  "exception",
  "completed",
];

function getOrderStatusVariant(status: OrderStatus) {
  if (status === "delivered") {
    return "success" as const;
  }
  if (
    status === "cancelled" ||
    status === "stock_problem" ||
    status === "returned"
  ) {
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

function getPaymentStatusVariant(status: PaymentStatus) {
  if (status === "paid") {
    return "success" as const;
  }
  if (status === "failed" || status === "cancelled" || status === "refunded") {
    return "destructive" as const;
  }
  if (status === "pending" || status === "processing") {
    return "warning" as const;
  }
  return "secondary" as const;
}

function getStageVariant(stage: OrderStage) {
  if (stage === "completed") {
    return "success" as const;
  }
  if (stage === "exception") {
    return "destructive" as const;
  }
  if (stage === "shipment" || stage === "packing") {
    return "warning" as const;
  }
  return "secondary" as const;
}

function trimOrUndefined(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function toNumberOrUndefined(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function buildStatusPayload(
  status: OrderStatus,
  formState: WorkflowFormState,
): ChangeOrderStatusRequest {
  const carrier = trimOrUndefined(formState.carrier);

  return {
    status,
    comment: trimOrUndefined(formState.comment),
    carrier,
    deliveryCompany: carrier,
    trackingNumber: trimOrUndefined(formState.trackingNumber),
    fragile: formState.fragile,
    packageType: trimOrUndefined(formState.packageType),
    weightGrams: toNumberOrUndefined(formState.weightGrams),
    lengthCm: toNumberOrUndefined(formState.lengthCm),
    widthCm: toNumberOrUndefined(formState.widthCm),
    heightCm: toNumberOrUndefined(formState.heightCm),
    serialNumbers: trimOrUndefined(formState.serialNumbers),
    warehouseIssueType: trimOrUndefined(formState.warehouseIssueType),
    packagingComment: trimOrUndefined(formState.packagingComment),
  };
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

function getStageDescriptionKey(stage: OrderStage) {
  switch (stage) {
    case "intake":
      return "labels.stageIntakeDescription";
    case "payment":
      return "labels.stagePaymentDescription";
    case "warehouse":
      return "labels.stageWarehouseDescription";
    case "packing":
      return "labels.stagePackingDescription";
    case "shipment":
      return "labels.stageShipmentDescription";
    case "exception":
      return "labels.stageExceptionDescription";
    case "completed":
      return "labels.stageCompletedDescription";
    default:
      return "labels.workflowControlsSubtitle";
  }
}

function getTimelineVariant(
  type: Order["timeline"][number]["type"],
  status: string,
) {
  if (type === "payment") {
    return getPaymentStatusVariant(status as PaymentStatus);
  }

  if (type === "status") {
    return getOrderStatusVariant(status as OrderStatus);
  }

  if (status === "delivered") {
    return "success" as const;
  }

  if (status === "delivery_failed" || status === "returned") {
    return "destructive" as const;
  }

  return "warning" as const;
}

export function OrdersModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data, isPending } = useAdminOrdersQuery();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | OrderStatus>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | PaymentStatus>(
    "all",
  );
  const [workflowForm, setWorkflowForm] = useState<WorkflowFormState>({
    comment: "",
    carrier: "",
    trackingNumber: "",
    packageType: "",
    weightGrams: "",
    lengthCm: "",
    widthCm: "",
    heightCm: "",
    serialNumbers: "",
    warehouseIssueType: "",
    packagingComment: "",
    fragile: false,
  });
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    paymentStatus: "pending",
    transactionId: "",
    provider: "",
    comment: "",
  });
  const [actionError, setActionError] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const statusMutation = useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: ChangeOrderStatusRequest;
    }) => changeOrderStatus(orderId, payload),
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });
  const paymentMutation = useMutation({
    mutationFn: ({
      orderId,
      payload,
    }: {
      orderId: string;
      payload: ChangeOrderPaymentRequest;
    }) => changeOrderPaymentStatus(orderId, payload),
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });

  const filteredOrders = useMemo(() => {
    const orders = data?.orders ?? [];
    const normalizedSearch = search.trim().toLowerCase();

    return orders.filter((order) => {
      if (statusFilter !== "all" && order.status !== statusFilter) {
        return false;
      }

      if (paymentFilter !== "all" && order.paymentStatus !== paymentFilter) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      const searchText = [
        order.orderNumber,
        order.customer.name,
        order.customer.phone,
        order.customer.email,
        order.delivery?.trackingNumber,
        order.address.formatted,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchText.includes(normalizedSearch);
    });
  }, [data?.orders, paymentFilter, search, statusFilter]);

  const stageBuckets = useMemo(
    () =>
      stageOrder.map((stage) => ({
        stage,
        orders: filteredOrders.filter((order) => order.stage === stage),
      })),
    [filteredOrders],
  );

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ??
    filteredOrders[0] ??
    null;
  const allowedTransitions = selectedOrder?.availableTransitions ?? [];

  useEffect(() => {
    if (!selectedOrderId && filteredOrders[0]?.id) {
      setSelectedOrderId(filteredOrders[0].id);
      return;
    }

    if (
      selectedOrderId &&
      filteredOrders.length > 0 &&
      !filteredOrders.some((order) => order.id === selectedOrderId)
    ) {
      setSelectedOrderId(filteredOrders[0].id);
    }
  }, [filteredOrders, selectedOrderId]);

  useEffect(() => {
    if (!selectedOrder) {
      return;
    }

    setWorkflowForm({
      comment: "",
      carrier: selectedOrder.delivery?.company ?? "",
      trackingNumber: selectedOrder.delivery?.trackingNumber ?? "",
      packageType: selectedOrder.packaging?.packageType ?? "",
      weightGrams: selectedOrder.packaging?.weightGrams?.toString() ?? "",
      lengthCm: selectedOrder.packaging?.lengthCm?.toString() ?? "",
      widthCm: selectedOrder.packaging?.widthCm?.toString() ?? "",
      heightCm: selectedOrder.packaging?.heightCm?.toString() ?? "",
      serialNumbers: selectedOrder.packaging?.serialNumbers ?? "",
      warehouseIssueType:
        selectedOrder.warehouseIssue?.type &&
        selectedOrder.warehouseIssue.type !== "UNKNOWN"
          ? selectedOrder.warehouseIssue.type
          : "",
      packagingComment:
        selectedOrder.packaging?.comment ??
        selectedOrder.warehouseIssue?.comment ??
        "",
      fragile: selectedOrder.packaging?.fragile ?? false,
    });
    setPaymentForm({
      paymentStatus: selectedOrder.paymentStatus,
      transactionId: selectedOrder.payment?.transactionId ?? "",
      provider: "",
      comment: "",
    });
    setActionError("");
    setPaymentError("");
  }, [selectedOrder]);

  if (isPending || !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  const intakeCount = filteredOrders.filter((order) =>
    ["intake", "payment"].includes(order.stage),
  ).length;
  const warehouseCount = filteredOrders.filter(
    (order) => order.stage === "warehouse" || order.stage === "packing",
  ).length;
  const shipmentCount = filteredOrders.filter(
    (order) => order.stage === "shipment",
  ).length;
  const exceptionCount = filteredOrders.filter(
    (order) => order.stage === "exception",
  ).length;

  return (
    <div className="space-y-6">
      <section className="table-card">
        <PageHeader
          title={t("nav.orders")}
          subtitle={t("section.ordersSubtitle")}
        />
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="muted">{t("labels.stageIntake")}</div>
              <div className="text-2xl font-semibold">{intakeCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="muted">{t("labels.stageWarehouse")}</div>
              <div className="text-2xl font-semibold">{warehouseCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="muted">{t("labels.stageShipment")}</div>
              <div className="text-2xl font-semibold">{shipmentCount}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="muted">{t("labels.stageException")}</div>
              <div className="text-2xl font-semibold">{exceptionCount}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,0.9fr)]">
        <section className="table-card space-y-4">
          <PageHeader
            title={t("labels.orderOperationsBoard")}
            subtitle={t("labels.orderOperationsSubtitle")}
          />
          <div className="grid gap-3 md:grid-cols-3">
            <AppField label={t("common.search")}>
              <Input
                value={search}
                placeholder={t("storefront.searchPlaceholder")}
                onChange={(event) => setSearch(event.target.value)}
              />
            </AppField>
            <AppField label={t("labels.orderStatus")}>
              <Select
                value={statusFilter}
                onValueChange={(value) =>
                  setStatusFilter(value as "all" | OrderStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("labels.allOrders")}</SelectItem>
                  {data.orderWorkflow?.statuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {dynamicLabel(t, status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AppField>
            <AppField label={t("labels.paymentState")}>
              <Select
                value={paymentFilter}
                onValueChange={(value) =>
                  setPaymentFilter(value as "all" | PaymentStatus)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("labels.allPayments")}</SelectItem>
                  {paymentStatusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      {dynamicLabel(t, status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AppField>
          </div>

          <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
            {stageBuckets.map(({ stage, orders }) => (
              <Card key={stage}>
                <CardContent className="space-y-4 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <strong>{t(getStageLabelKey(stage))}</strong>
                      <div className="muted">
                        {t(getStageDescriptionKey(stage))}
                      </div>
                    </div>
                    <Badge variant={getStageVariant(stage)}>{orders.length}</Badge>
                  </div>
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <button
                        key={order.id}
                        type="button"
                        className={`w-full rounded-lg border px-3 py-3 text-left transition ${
                          selectedOrder?.id === order.id
                            ? "border-primary bg-muted/50"
                            : "border-border hover:bg-muted/30"
                        }`}
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="space-y-1">
                            <strong>{order.orderNumber}</strong>
                            <div className="muted">{order.customer.name}</div>
                          </div>
                          <Badge variant={getOrderStatusVariant(order.status)}>
                            {dynamicLabel(t, order.status)}
                          </Badge>
                        </div>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <Badge
                            variant={getPaymentStatusVariant(order.paymentStatus)}
                          >
                            {dynamicLabel(t, order.paymentStatus)}
                          </Badge>
                          {order.deliveryStatus ? (
                            <Badge variant="outline">
                              {dynamicLabel(t, order.deliveryStatus)}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="mt-3 heading-row text-sm">
                          <span>
                            {order.items.reduce(
                              (sum, item) => sum + item.quantity,
                              0,
                            )}{" "}
                            {t("labels.qty")}
                          </span>
                          <strong>
                            {formatMoney(order.total, data.settings.currency, locale)}
                          </strong>
                        </div>
                      </button>
                    ))}
                    {orders.length === 0 ? (
                      <div className="empty-state text-sm">{t("common.noData")}</div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="table-card space-y-4">
          <PageHeader
            title={t("common.details")}
            subtitle={selectedOrder?.orderNumber ?? t("common.noData")}
          />
          {!selectedOrder ? (
            <div className="empty-state">{t("common.noData")}</div>
          ) : (
            <div className="space-y-4">
              <Card>
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <strong>{selectedOrder.customer.name}</strong>
                      <div className="muted">{selectedOrder.address.formatted}</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getStageVariant(selectedOrder.stage)}>
                        {t(getStageLabelKey(selectedOrder.stage))}
                      </Badge>
                      <Badge variant={getOrderStatusVariant(selectedOrder.status)}>
                        {dynamicLabel(t, selectedOrder.status)}
                      </Badge>
                      <Badge
                        variant={getPaymentStatusVariant(selectedOrder.paymentStatus)}
                      >
                        {dynamicLabel(t, selectedOrder.paymentStatus)}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Card>
                      <CardContent className="space-y-2 p-4">
                        <div className="muted">{t("labels.customer")}</div>
                        <div>{selectedOrder.customer.phone}</div>
                        <div>{selectedOrder.customer.email ?? "-"}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="space-y-2 p-4">
                        <div className="muted">{t("labels.total")}</div>
                        <div>
                          {formatMoney(
                            selectedOrder.total,
                            data.settings.currency,
                            locale,
                          )}
                        </div>
                        <div className="muted">
                          {formatMoney(
                            selectedOrder.subtotal,
                            data.settings.currency,
                            locale,
                          )}{" "}
                          +{" "}
                          {formatMoney(
                            selectedOrder.deliveryCost,
                            data.settings.currency,
                            locale,
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Card>
                      <CardContent className="space-y-2 p-4">
                        <div className="muted">{t("labels.paymentMethod")}</div>
                        <div>{dynamicLabel(t, selectedOrder.paymentMethod)}</div>
                        <div className="muted">
                          {selectedOrder.payment?.transactionId ??
                            t("common.noData")}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="space-y-2 p-4">
                        <div className="muted">{t("labels.deliveryMethod")}</div>
                        <div>{dynamicLabel(t, selectedOrder.deliveryMethod)}</div>
                        <div className="muted">
                          {selectedOrder.delivery?.company ??
                            selectedOrder.delivery?.trackingNumber ??
                            t("common.noData")}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="space-y-2">
                    <strong>{t("labels.orderItems")}</strong>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div
                          key={`${selectedOrder.id}-${item.productId}`}
                          className="heading-row rounded-lg border border-border px-3 py-2"
                        >
                          <span>
                            {item.productName} x {item.quantity}
                          </span>
                          <span>
                            {formatMoney(
                              item.totalPrice,
                              data.settings.currency,
                              locale,
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedOrder.notes ? (
                    <div className="space-y-1">
                      <div className="muted">{t("labels.orderNote")}</div>
                      <p>{selectedOrder.notes}</p>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4 p-5">
                  <PageHeader
                    title={t("labels.orderOperationsTitle")}
                    subtitle={t(getStageDescriptionKey(selectedOrder.stage))}
                  />
                  <div className="grid gap-3 md:grid-cols-2">
                    <Card>
                      <CardContent className="space-y-2 p-4">
                        <div className="muted">{t("labels.operationsStage")}</div>
                        <Badge variant={getStageVariant(selectedOrder.stage)}>
                          {t(getStageLabelKey(selectedOrder.stage))}
                        </Badge>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="space-y-2 p-4">
                        <div className="muted">
                          {t("labels.availableActions")}
                        </div>
                        <div>{allowedTransitions.length}</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="space-y-2 p-4">
                        <div className="muted">{t("labels.trackingNumber")}</div>
                        <div>
                          {selectedOrder.delivery?.trackingNumber ??
                            t("common.noData")}
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="space-y-2 p-4">
                        <div className="muted">{t("labels.packageType")}</div>
                        <div>
                          {selectedOrder.packaging?.packageType ??
                            t("common.noData")}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {selectedOrder.packaging ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <Card>
                        <CardContent className="space-y-2 p-4">
                          <div className="muted">{t("labels.packageMetrics")}</div>
                          <div>
                            {selectedOrder.packaging.weightGrams
                              ? `${selectedOrder.packaging.weightGrams} g`
                              : t("common.noData")}
                          </div>
                          <div className="muted">
                            {selectedOrder.packaging.dimensions ??
                              t("common.noData")}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="space-y-2 p-4">
                          <div className="muted">{t("labels.serialNumbers")}</div>
                          <div>
                            {selectedOrder.packaging.serialNumbers ??
                              t("common.noData")}
                          </div>
                          <div className="muted">
                            {selectedOrder.packaging.fragile
                              ? t("labels.fragile")
                              : t("labels.notFragile")}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : null}

                  {selectedOrder.warehouseIssue ? (
                    <Card>
                      <CardContent className="space-y-2 p-4">
                        <div className="muted">{t("labels.warehouseIssue")}</div>
                        <div>{selectedOrder.warehouseIssue.type}</div>
                        <div className="muted">
                          {selectedOrder.warehouseIssue.comment ??
                            t("common.noData")}
                        </div>
                      </CardContent>
                    </Card>
                  ) : null}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4 p-5">
                  <PageHeader
                    title={t("labels.workflowControlsTitle")}
                    subtitle={t("labels.workflowControlsSubtitle")}
                  />
                  {actionError ? <div className="error">{actionError}</div> : null}
                  <div className="grid gap-3 md:grid-cols-2">
                    <AppField label={t("labels.carrier")}>
                      <Input
                        value={workflowForm.carrier}
                        onChange={(event) =>
                          setWorkflowForm((current) => ({
                            ...current,
                            carrier: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                    <AppField label={t("labels.trackingNumber")}>
                      <Input
                        value={workflowForm.trackingNumber}
                        onChange={(event) =>
                          setWorkflowForm((current) => ({
                            ...current,
                            trackingNumber: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                    <AppField label={t("labels.packageType")}>
                      <Input
                        value={workflowForm.packageType}
                        onChange={(event) =>
                          setWorkflowForm((current) => ({
                            ...current,
                            packageType: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                    <AppField label={t("labels.weightGrams")}>
                      <Input
                        type="number"
                        value={workflowForm.weightGrams}
                        onChange={(event) =>
                          setWorkflowForm((current) => ({
                            ...current,
                            weightGrams: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                    <AppField label={t("labels.lengthCm")}>
                      <Input
                        type="number"
                        value={workflowForm.lengthCm}
                        onChange={(event) =>
                          setWorkflowForm((current) => ({
                            ...current,
                            lengthCm: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                    <AppField label={t("labels.widthCm")}>
                      <Input
                        type="number"
                        value={workflowForm.widthCm}
                        onChange={(event) =>
                          setWorkflowForm((current) => ({
                            ...current,
                            widthCm: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                    <AppField label={t("labels.heightCm")}>
                      <Input
                        type="number"
                        value={workflowForm.heightCm}
                        onChange={(event) =>
                          setWorkflowForm((current) => ({
                            ...current,
                            heightCm: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                    <AppField label={t("labels.warehouseIssue")}>
                      <Input
                        value={workflowForm.warehouseIssueType}
                        onChange={(event) =>
                          setWorkflowForm((current) => ({
                            ...current,
                            warehouseIssueType: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                  </div>
                  <AppField label={t("labels.serialNumbers")}>
                    <Input
                      value={workflowForm.serialNumbers}
                      onChange={(event) =>
                        setWorkflowForm((current) => ({
                          ...current,
                          serialNumbers: event.target.value,
                        }))
                      }
                    />
                  </AppField>
                  <AppField label={t("labels.packagingComment")}>
                    <Textarea
                      rows={3}
                      value={workflowForm.packagingComment}
                      onChange={(event) =>
                        setWorkflowForm((current) => ({
                          ...current,
                          packagingComment: event.target.value,
                        }))
                      }
                    />
                  </AppField>
                  <AppField label={t("labels.commentOptional")}>
                    <Textarea
                      rows={3}
                      value={workflowForm.comment}
                      onChange={(event) =>
                        setWorkflowForm((current) => ({
                          ...current,
                          comment: event.target.value,
                        }))
                      }
                    />
                  </AppField>
                  <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2">
                    <span>{t("labels.fragile")}</span>
                    <Switch
                      checked={workflowForm.fragile}
                      onCheckedChange={(checked) =>
                        setWorkflowForm((current) => ({
                          ...current,
                          fragile: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {allowedTransitions.map((status) => (
                      <Button
                        key={status}
                        type="button"
                        variant="outline"
                        disabled={statusMutation.isPending}
                        onClick={async () => {
                          setActionError("");
                          try {
                            await statusMutation.mutateAsync({
                              orderId: selectedOrder.id,
                              payload: buildStatusPayload(status, workflowForm),
                            });
                          } catch (error) {
                            setActionError(
                              error instanceof Error
                                ? error.message
                                : t("common.unexpectedError"),
                            );
                          }
                        }}
                      >
                        {dynamicLabel(t, status)}
                      </Button>
                    ))}
                    {allowedTransitions.length === 0 ? (
                      <div className="muted">{t("common.noData")}</div>
                    ) : null}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-4 p-5">
                  <PageHeader
                    title={t("labels.paymentState")}
                    subtitle={dynamicLabel(t, selectedOrder.paymentStatus)}
                  />
                  {paymentError ? <div className="error">{paymentError}</div> : null}
                  <div className="grid gap-3 md:grid-cols-2">
                    <AppField label={t("labels.paymentState")}>
                      <Select
                        value={paymentForm.paymentStatus}
                        onValueChange={(value) =>
                          setPaymentForm((current) => ({
                            ...current,
                            paymentStatus: value as PaymentStatus,
                          }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentStatusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {dynamicLabel(t, status)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </AppField>
                    <AppField label={t("labels.transactionId")}>
                      <Input
                        value={paymentForm.transactionId}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            transactionId: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                    <AppField label={t("labels.provider")}>
                      <Input
                        value={paymentForm.provider}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            provider: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                    <AppField label={t("labels.commentOptional")}>
                      <Input
                        value={paymentForm.comment}
                        onChange={(event) =>
                          setPaymentForm((current) => ({
                            ...current,
                            comment: event.target.value,
                          }))
                        }
                      />
                    </AppField>
                  </div>
                  <Button
                    type="button"
                    disabled={paymentMutation.isPending}
                    onClick={async () => {
                      setPaymentError("");
                      try {
                        await paymentMutation.mutateAsync({
                          orderId: selectedOrder.id,
                          payload: {
                            paymentStatus: paymentForm.paymentStatus,
                            transactionId: trimOrUndefined(
                              paymentForm.transactionId,
                            ),
                            provider: trimOrUndefined(paymentForm.provider),
                            comment: trimOrUndefined(paymentForm.comment),
                          },
                        });
                      } catch (error) {
                        setPaymentError(
                          error instanceof Error
                            ? error.message
                            : t("common.unexpectedError"),
                        );
                      }
                    }}
                  >
                    {t("common.save")}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3 p-5">
                  <PageHeader
                    title={t("labels.statusHistory")}
                    subtitle={t("labels.orderStatusTimeline")}
                  />
                  <div className="space-y-3">
                    {[...selectedOrder.timeline].reverse().map((entry) => (
                      <div
                        key={`${entry.type}-${entry.happenedAt}-${entry.status}`}
                        className="rounded-lg border border-border px-3 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge
                              variant={getTimelineVariant(entry.type, entry.status)}
                            >
                              {dynamicLabel(t, entry.status)}
                            </Badge>
                            <span className="muted">{entry.type}</span>
                          </div>
                          <div className="muted">
                            {new Date(entry.happenedAt).toLocaleString(
                              getIntlLocale(locale),
                            )}
                          </div>
                        </div>
                        <div className="mt-2 muted">
                          {entry.comment ?? t("common.noData")}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

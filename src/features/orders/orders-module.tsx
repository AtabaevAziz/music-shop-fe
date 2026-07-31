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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import type { Order, OrderStatus, PaymentStatus } from "@/types/music";

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
  return {
    status,
    comment: trimOrUndefined(formState.comment),
    carrier: trimOrUndefined(formState.carrier),
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

  const selectedOrder =
    filteredOrders.find((order) => order.id === selectedOrderId) ??
    filteredOrders[0] ??
    null;
  const allowedTransitions = selectedOrder
    ? (data?.orderWorkflow?.transitions[selectedOrder.status] ?? [])
    : [];

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
        selectedOrder.packaging?.comment ?? selectedOrder.warehouseIssue?.comment ?? "",
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

  const activeOrders = data.orders.filter(
    (order) => !["delivered", "cancelled", "returned"].includes(order.status),
  ).length;
  const stockProblemOrders = data.orders.filter(
    (order) => order.status === "stock_problem",
  ).length;
  const readyForShipmentOrders = data.orders.filter(
    (order) => order.status === "ready_for_shipment",
  ).length;
  const paidOrders = data.orders.filter(
    (order) => order.paymentStatus === "paid",
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
              <div className="muted">{t("labels.activeOrders")}</div>
              <div className="text-2xl font-semibold">{activeOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="muted">{t("labels.paidOrders")}</div>
              <div className="text-2xl font-semibold">{paidOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="muted">{t("labels.readyForShipment")}</div>
              <div className="text-2xl font-semibold">{readyForShipmentOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="space-y-2 p-5">
              <div className="muted">{t("labels.stockProblems")}</div>
              <div className="text-2xl font-semibold">{stockProblemOrders}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(420px,0.8fr)]">
        <section className="table-card space-y-4">
          <PageHeader
            title={t("labels.orderPipeline")}
            subtitle={t("labels.workflowControlsSubtitle")}
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
          <div className="responsive-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("labels.orderNumber")}</TableHead>
                  <TableHead>{t("labels.orderDate")}</TableHead>
                  <TableHead>{t("labels.customer")}</TableHead>
                  <TableHead>{t("labels.qty")}</TableHead>
                  <TableHead>{t("labels.total")}</TableHead>
                  <TableHead>{t("labels.paymentState")}</TableHead>
                  <TableHead>{t("labels.deliveryMethod")}</TableHead>
                  <TableHead>{t("labels.orderStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow
                    key={order.id}
                    className={
                      selectedOrder?.id === order.id ? "bg-muted/40" : undefined
                    }
                    onClick={() => setSelectedOrderId(order.id)}
                  >
                    <TableCell>
                      <div className="space-y-1">
                        <strong>{order.orderNumber}</strong>
                        <div className="muted">{order.customer.phone}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString(
                        getIntlLocale(locale),
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{order.customer.name}</div>
                        <div className="muted">{order.customer.email ?? "-"}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {order.items.reduce((sum, item) => sum + item.quantity, 0)}
                    </TableCell>
                    <TableCell>
                      {formatMoney(order.total, data.settings.currency, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getPaymentStatusVariant(order.paymentStatus)}>
                        {dynamicLabel(t, order.paymentStatus)}
                      </Badge>
                    </TableCell>
                    <TableCell>{dynamicLabel(t, order.deliveryMethod)}</TableCell>
                    <TableCell>
                      <Badge variant={getOrderStatusVariant(order.status)}>
                        {dynamicLabel(t, order.status)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredOrders.length === 0 ? (
            <div className="empty-state">{t("common.noData")}</div>
          ) : null}
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
                      <Badge variant={getOrderStatusVariant(selectedOrder.status)}>
                        {dynamicLabel(t, selectedOrder.status)}
                      </Badge>
                      <Badge
                        variant={getPaymentStatusVariant(selectedOrder.paymentStatus)}
                      >
                        {dynamicLabel(t, selectedOrder.paymentStatus)}
                      </Badge>
                      {selectedOrder.deliveryStatus ? (
                        <Badge variant="outline">
                          {dynamicLabel(t, selectedOrder.deliveryStatus)}
                        </Badge>
                      ) : null}
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

                  {selectedOrder.packaging ? (
                    <div className="grid gap-3 md:grid-cols-2">
                      <Card>
                        <CardContent className="space-y-2 p-4">
                          <div className="muted">{t("labels.packageType")}</div>
                          <div>
                            {selectedOrder.packaging.packageType ??
                              t("common.noData")}
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
                    {selectedOrder.statusHistory.map((entry) => (
                      <div
                        key={`${entry.changedAt}-${entry.newStatus}`}
                        className="rounded-lg border border-border px-3 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={getOrderStatusVariant(entry.newStatus)}>
                              {dynamicLabel(t, entry.newStatus)}
                            </Badge>
                            {entry.oldStatus ? (
                              <span className="muted">
                                {dynamicLabel(t, entry.oldStatus)} →
                              </span>
                            ) : null}
                          </div>
                          <div className="muted">
                            {new Date(entry.changedAt).toLocaleString(
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

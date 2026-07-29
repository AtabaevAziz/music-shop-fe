"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAdminOrdersQuery } from "@/hooks/use-orders-query";
import { Locale } from "@/i18n";
import { invalidateAppQueries } from "@/lib/query-utils";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, getIntlLocale } from "@/lib/utils";
import { changeOrderStatus } from "@/services/orders";
import type { OrderStatus } from "@/types/music";

export function OrdersModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data, isPending } = useAdminOrdersQuery();
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");
  const workflowStatuses = data?.orderWorkflow?.statuses ?? [];
  const statusMutation = useMutation({
    mutationFn: ({
      orderId,
      status,
    }: {
      orderId: string;
      status: OrderStatus;
    }) => changeOrderStatus(orderId, { status }),
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });

  useEffect(() => {
    if (!selectedOrderId && data?.orders[0]?.id) {
      setSelectedOrderId(data.orders[0].id);
    }
  }, [data?.orders, selectedOrderId]);

  const customerMap = useMemo(
    () =>
      Object.fromEntries(
        (data?.customers ?? []).map((customer) => [
          customer.id,
          customer.fullName ?? customer.name,
        ]),
      ),
    [data?.customers],
  );
  const productMap = useMemo(
    () =>
      Object.fromEntries(
        (data?.products ?? []).map((product) => [product.id, product]),
      ),
    [data?.products],
  );
  const selectedOrder =
    data?.orders.find((order) => order.id === selectedOrderId) ??
    data?.orders[0];

  if (isPending || !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  return (
    <div className="two-columns">
      <section className="table-card">
        <PageHeader
          title={t("nav.orders")}
          subtitle={t("section.ordersSubtitle")}
        />
        <div className="responsive-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("labels.orderNumber")}</TableHead>
                <TableHead>{t("labels.customer")}</TableHead>
                <TableHead>{t("labels.orderItems")}</TableHead>
                <TableHead>{t("labels.total")}</TableHead>
                <TableHead>{t("labels.orderDate")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.details")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.orders.map((order) => {
                const itemsPreview = order.items
                  .slice(0, 2)
                  .map(
                    (item) =>
                      productMap[item.productId]?.name ??
                      item.productName ??
                      item.productId,
                  )
                  .join(", ");
                const total = order.total;

                return (
                  <TableRow key={order.id}>
                    <TableCell>{order.orderNumber}</TableCell>
                    <TableCell>
                      {order.customer.name ??
                        customerMap[order.customerId] ??
                        order.customerId}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{itemsPreview || t("common.noData")}</div>
                        <div className="muted">
                          {order.items.length} {t("labels.items")}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatMoney(total, data.settings.currency, locale)}
                    </TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString(
                        getIntlLocale(locale),
                      )}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedOrderId(order.id)}
                      >
                        {t("common.details")}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="table-card">
        <PageHeader
          title={t("common.details")}
          subtitle={
            selectedOrder ? selectedOrder.orderNumber : t("common.noData")
          }
        />
        {actionError ? <div className="error">{actionError}</div> : null}
        {selectedOrder ? (
          <div className="list-clean">
            <Card>
              <CardContent className="space-y-4 p-5">
                <div className="heading-row">
                  <Badge
                    variant={
                      selectedOrder.status === "delivered"
                        ? "success"
                        : selectedOrder.status === "cancelled"
                          ? "destructive"
                          : selectedOrder.status === "packed" ||
                              selectedOrder.status === "shipped"
                            ? "warning"
                          : "secondary"
                    }
                  >
                    {dynamicLabel(t, selectedOrder.status)}
                  </Badge>
                  <Badge variant="outline">
                    {new Date(selectedOrder.createdAt).toLocaleDateString(
                      getIntlLocale(locale),
                    )}
                  </Badge>
                </div>
                <div className="detail-grid">
                  <Card>
                    <CardContent className="space-y-2 p-5">
                      <div className="muted">{t("labels.customer")}</div>
                      <strong>
                        {selectedOrder.customer.name ??
                          customerMap[selectedOrder.customerId] ??
                          selectedOrder.customerId}
                      </strong>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="space-y-2 p-5">
                      <div className="muted">{t("labels.total")}</div>
                      <strong>{formatMoney(selectedOrder.total, data.settings.currency, locale)}</strong>
                    </CardContent>
                  </Card>
                </div>
                <div className="detail-grid">
                  <Card>
                    <CardContent className="space-y-2 p-5">
                      <div className="muted">{t("labels.paymentMethod")}</div>
                      <strong>{dynamicLabel(t, selectedOrder.paymentMethod)}</strong>
                      <div className="muted">
                        {dynamicLabel(t, selectedOrder.paymentStatus)}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="space-y-2 p-5">
                      <div className="muted">{t("labels.deliveryMethod")}</div>
                      <strong>{dynamicLabel(t, selectedOrder.deliveryMethod)}</strong>
                      <div className="muted">
                        {selectedOrder.delivery
                          ? dynamicLabel(t, selectedOrder.delivery.status)
                          : t("common.noData")}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <div className="space-y-3">
                  <strong>{t("labels.orderItems")}</strong>
                  <div className="list-clean">
                    {selectedOrder.items.map((item) => (
                      <Card key={`${selectedOrder.id}-${item.productId}`}>
                        <CardContent className="space-y-2 p-4">
                          <strong>
                            {productMap[item.productId]?.name ??
                              item.productName ??
                              item.productId}
                          </strong>
                          <div className="muted">
                            {t("labels.qty")}: {item.quantity}
                          </div>
                          <div className="muted">
                            {formatMoney(
                              item.totalPrice,
                              data.settings.currency,
                              locale,
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
                {selectedOrder.delivery?.trackingNumber ? (
                  <p>{selectedOrder.delivery.trackingNumber}</p>
                ) : selectedOrder.notes ? (
                  <p>{selectedOrder.notes}</p>
                ) : null}
                {selectedOrder.packaging ? (
                  <Card>
                    <CardContent className="space-y-2 p-5">
                      <div className="muted">Packaging</div>
                      <strong>{dynamicLabel(t, selectedOrder.packaging.status)}</strong>
                      <div className="muted">
                        {selectedOrder.packaging.fragile
                          ? "Fragile"
                          : t("common.noData")}
                      </div>
                    </CardContent>
                  </Card>
                ) : null}
                <div className="space-y-3">
                  <strong>{t("common.status")}</strong>
                  <div className="flex flex-wrap gap-2">
                    {workflowStatuses.map((status) => {
                      const allowedTransitions =
                        data.orderWorkflow?.transitions[selectedOrder.status] ??
                        [];

                      return (
                        <Button
                          key={status}
                          variant="outline"
                          size="sm"
                          disabled={
                            pendingOrderId === selectedOrder.id ||
                            selectedOrder.status === status ||
                            !allowedTransitions.includes(status)
                          }
                          onClick={async () => {
                            setActionError("");
                            setPendingOrderId(selectedOrder.id);
                            try {
                              await statusMutation.mutateAsync({
                                orderId: selectedOrder.id,
                                status,
                              });
                            } catch (error) {
                              setActionError(
                                error instanceof Error
                                  ? error.message
                                  : t("common.unexpectedError"),
                              );
                            } finally {
                              setPendingOrderId(null);
                            }
                          }}
                        >
                          {dynamicLabel(t, status)}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="empty-state">{t("common.noData")}</div>
        )}
      </section>
    </div>
  );
}

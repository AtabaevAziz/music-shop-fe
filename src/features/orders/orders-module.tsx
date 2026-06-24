"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

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
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney } from "@/lib/utils";
import { useOrdersStore } from "@/store/music-store";

const transitions = [
  "new",
  "confirmed",
  "packed",
  "ready_for_pickup",
  "completed",
  "cancelled",
] as const;

const nextTransitions = {
  new: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
} as const;

export function OrdersModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { orders, customers, settings, changeOrderStatus } = useOrdersStore();
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null);
  const [actionError, setActionError] = useState("");

  return (
    <div className="two-columns">
      <section className="table-card">
        <div className="responsive-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>{t("labels.customer")}</TableHead>
                <TableHead>{t("labels.total")}</TableHead>
                <TableHead>{t("labels.paymentState")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const customer = customers.find(
                  (item) => item.id === order.customerId,
                );
                const total = order.items.reduce(
                  (sum, item) => sum + item.qty * item.unitPrice,
                  0,
                );
                return (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{customer?.name ?? order.customerId}</TableCell>
                    <TableCell>
                      {formatMoney(total, settings.currency, locale)}
                    </TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell>
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
          title={t("labels.workflowControlsTitle")}
          subtitle={t("labels.workflowControlsSubtitle")}
        />
        {actionError ? <div className="error">{actionError}</div> : null}
        <ul className="list-clean">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-3">
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
                <p>{order.notes}</p>
                <div className="flex flex-wrap gap-2">
                  {transitions.map((status) => (
                    <Button
                      key={status}
                      variant="outline"
                      size="sm"
                      disabled={
                        pendingOrderId === order.id ||
                        order.status === status ||
                        !nextTransitions[order.status].includes(status)
                      }
                      onClick={async () => {
                        setActionError("");
                        setPendingOrderId(order.id);
                        try {
                          await changeOrderStatus(order.id, status);
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
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </ul>
      </section>
    </div>
  );
}

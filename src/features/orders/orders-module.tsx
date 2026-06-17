"use client";

import { useTranslations } from "next-intl";

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
import { useMusicStore } from "@/store/music-store";

const transitions = [
  "new",
  "confirmed",
  "packed",
  "ready_for_pickup",
  "completed",
  "cancelled",
] as const;

export function OrdersModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { db, changeOrderStatus } = useMusicStore();

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
              {db.orders.map((order) => {
                const customer = db.customers.find(
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
                      {formatMoney(total, db.settings.currency, locale)}
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
        <ul className="list-clean">
          {db.orders.map((order) => (
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
                      onClick={() => void changeOrderStatus(order.id, status)}
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

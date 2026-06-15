"use client";

import { useTranslations } from "next-intl";

import { Badge, Money, PageHeader } from "@/components/ui/primitives";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
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
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>{t("labels.customer")}</th>
              <th>{t("labels.total")}</th>
              <th>{t("labels.paymentState")}</th>
              <th>{t("common.status")}</th>
            </tr>
          </thead>
          <tbody>
            {db.orders.map((order) => {
              const customer = db.customers.find(
                (item) => item.id === order.customerId,
              );
              const total = order.items.reduce(
                (sum, item) => sum + item.qty * item.unitPrice,
                0,
              );
              return (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{customer?.name ?? order.customerId}</td>
                  <td>
                    <Money
                      value={total}
                      currency={db.settings.currency}
                      locale={locale}
                    />
                  </td>
                  <td>
                    <Badge
                      tone={
                        order.paymentStatus === "paid"
                          ? "success"
                          : order.paymentStatus === "pending"
                            ? "warn"
                            : "neutral"
                      }
                    >
                      {dynamicLabel(t, order.paymentStatus)}
                    </Badge>
                  </td>
                  <td>
                    <Badge
                      tone={
                        order.status === "completed"
                          ? "success"
                          : order.status === "cancelled"
                            ? "danger"
                            : "neutral"
                      }
                    >
                      {dynamicLabel(t, order.status)}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <section className="table-card">
        <PageHeader
          title={t("labels.workflowControlsTitle")}
          subtitle={t("labels.workflowControlsSubtitle")}
        />
        <ul className="list-clean">
          {db.orders.map((order) => (
            <li key={order.id} className="card">
              <div className="stack-row spread">
                <strong>{order.id}</strong>
                <Badge
                  tone={
                    order.status === "completed"
                      ? "success"
                      : order.status === "cancelled"
                        ? "danger"
                        : "neutral"
                  }
                >
                  {dynamicLabel(t, order.status)}
                </Badge>
              </div>
              <p>{order.notes}</p>
              <div className="stack-row">
                {transitions.map((status) => (
                  <button
                    key={status}
                    className="button-ghost"
                    onClick={() => void changeOrderStatus(order.id, status)}
                  >
                    {dynamicLabel(t, status)}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

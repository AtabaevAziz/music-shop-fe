"use client";

import { Badge, Money, PageHeader } from "@/components/ui/primitives";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
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
  const dict = getDictionary(locale);
  const { db, changeOrderStatus } = useMusicStore();

  return (
    <div className="two-columns">
      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Total</th>
              <th>{dict.paymentState}</th>
              <th>{dict.status}</th>
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
                      {translateDynamicLabel(locale, order.paymentStatus)}
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
                      {translateDynamicLabel(locale, order.status)}
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
          title="Workflow controls"
          subtitle="Simulate retail order progression."
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
                  {translateDynamicLabel(locale, order.status)}
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
                    {translateDynamicLabel(locale, status)}
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

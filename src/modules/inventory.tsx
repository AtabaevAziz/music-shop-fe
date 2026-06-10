"use client";

import { useState } from "react";
import { PageHeader, Field, Badge } from "@/components/ui";
import { useMusicStore } from "@/data/store";
import { getDictionary, Locale } from "@/lib/i18n";

export function InventoryModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, adjustStock } = useMusicStore();
  const [productId, setProductId] = useState(db.products[0]?.id ?? "");
  const [delta, setDelta] = useState("1");
  const [reason, setReason] = useState("Manual correction");

  return (
    <div className="two-columns">
      <section className="table-card">
        <PageHeader
          title={dict.inventory}
          subtitle="Current stock, replenishment risk, and movement visibility."
        />
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>SKU</th>
              <th>Available</th>
              <th>Condition</th>
            </tr>
          </thead>
          <tbody>
            {db.products.map((product) => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.sku}</td>
                <td>
                  <Badge
                    tone={
                      product.stockQty <= db.settings.lowStockThreshold
                        ? "warn"
                        : "success"
                    }
                  >
                    {product.stockQty}
                  </Badge>
                </td>
                <td>{product.condition}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="table-card">
        <PageHeader
          title="Stock adjustment"
          subtitle="Client-side inventory action persisted in localStorage."
        />
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            void adjustStock(productId, Number(delta), reason);
          }}
        >
          <Field label="Product">
            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
            >
              {db.products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Delta">
            <input
              type="number"
              value={delta}
              onChange={(event) => setDelta(event.target.value)}
            />
          </Field>
          <Field label="Reason">
            <textarea
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </Field>
          <div className="stack-row" style={{ gridColumn: "1 / -1" }}>
            <button className="button" type="submit">
              {dict.save}
            </button>
          </div>
        </form>
        <PageHeader
          title="Recent movements"
          subtitle="Latest stock operations"
        />
        <ul className="list-clean">
          {db.inventoryMovements.slice(0, 6).map((movement) => {
            const product = db.products.find(
              (item) => item.id === movement.productId,
            );
            return (
              <li key={movement.id} className="card">
                <div
                  className="stack-row"
                  style={{ justifyContent: "space-between" }}
                >
                  <strong>{product?.name ?? movement.productId}</strong>
                  <Badge tone={movement.delta > 0 ? "success" : "warn"}>
                    {movement.delta > 0 ? "+" : ""}
                    {movement.delta}
                  </Badge>
                </div>
                <div>{movement.reason}</div>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";

import { Badge, Field, PageHeader } from "@/components/ui/primitives";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
import { useMusicStore } from "@/store/music-store";

export function InventoryModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, adjustStock } = useMusicStore();
  const [productId, setProductId] = useState(db.products[0]?.id ?? "");
  const [delta, setDelta] = useState("1");
  const [reason, setReason] = useState(dict.manualCorrection);
  const selectedProduct =
    db.products.find((product) => product.id === productId) ?? db.products[0];
  const lowStockProducts = db.products.filter(
    (product) => product.stockQty <= db.settings.lowStockThreshold,
  );
  const showroomUnits = db.products.filter(
    (product) => product.condition === "showroom",
  ).length;
  const totalUnits = db.products.reduce(
    (sum, product) => sum + product.stockQty,
    0,
  );
  const recentMovementCount = db.inventoryMovements.filter((movement) => {
    const movementDate = new Date(movement.createdAt);
    const now = new Date();
    return (
      movementDate.getDate() === now.getDate() &&
      movementDate.getMonth() === now.getMonth() &&
      movementDate.getFullYear() === now.getFullYear()
    );
  }).length;

  return (
    <div className="inventory-shell">
      <section className="table-card">
        <PageHeader title={dict.inventory} subtitle={dict.inventorySubtitle} />
        <div className="inventory-overview">
          <div className="card metric-card">
            <div className="muted">{dict.stockOnHand}</div>
            <div className="kpi-value">{totalUnits}</div>
          </div>
          <div className="card metric-card">
            <div className="muted">{dict.replenishmentRisk}</div>
            <div className="kpi-value">{lowStockProducts.length}</div>
          </div>
          <div className="card metric-card">
            <div className="muted">{dict.showroomUnits}</div>
            <div className="kpi-value">{showroomUnits}</div>
          </div>
          <div className="card metric-card">
            <div className="muted">{dict.movementCount}</div>
            <div className="kpi-value">{recentMovementCount}</div>
          </div>
        </div>
      </section>

      <div className="inventory-grid">
        <section className="table-card inventory-table-section">
          <PageHeader title={dict.inventory} subtitle={dict.stockHealth} />
          <table>
            <thead>
              <tr>
                <th>{dict.product}</th>
                <th>{dict.sku}</th>
                <th>{dict.available}</th>
                <th>{dict.condition}</th>
                <th>{dict.replenishmentRisk}</th>
              </tr>
            </thead>
            <tbody>
              {db.products.map((product) => {
                const isLow = product.stockQty <= db.settings.lowStockThreshold;
                return (
                  <tr key={product.id}>
                    <td>
                      <strong>{product.name}</strong>
                    </td>
                    <td>{product.sku}</td>
                    <td>
                      <Badge tone={isLow ? "warn" : "success"}>
                        {product.stockQty}
                      </Badge>
                    </td>
                    <td>{translateDynamicLabel(locale, product.condition)}</td>
                    <td>
                      <Badge tone={isLow ? "warn" : "neutral"}>
                        {isLow
                          ? `${dict.thresholdLabel}: ${db.settings.lowStockThreshold}`
                          : dict.stockHealthy}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <div className="inventory-side">
          <section className="table-card inventory-action-section">
            <PageHeader
              title={dict.stockAdjustment}
              subtitle={dict.stockAdjustmentSubtitle}
            />
            {selectedProduct ? (
              <div className="inventory-selected-summary">
                <div className="card">
                  <strong>{selectedProduct.name}</strong>
                  <div className="muted">{selectedProduct.sku}</div>
                  <div className="stack-row" style={{ marginTop: 10 }}>
                    <Badge
                      tone={
                        selectedProduct.stockQty <=
                        db.settings.lowStockThreshold
                          ? "warn"
                          : "success"
                      }
                    >
                      {dict.currentStock}: {selectedProduct.stockQty}
                    </Badge>
                    <Badge tone="neutral">
                      {translateDynamicLabel(locale, selectedProduct.condition)}
                    </Badge>
                  </div>
                </div>
              </div>
            ) : null}
            <form
              className="inventory-form"
              onSubmit={(event) => {
                event.preventDefault();
                void adjustStock(productId, Number(delta), reason);
              }}
            >
              <Field label={dict.product}>
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
              <Field label={dict.delta}>
                <input
                  type="number"
                  value={delta}
                  onChange={(event) => setDelta(event.target.value)}
                />
              </Field>
              <Field label={dict.reason}>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </Field>
              <div className="stack-row">
                <button className="button" type="submit">
                  {dict.save}
                </button>
              </div>
            </form>
          </section>

          <section className="table-card inventory-movements-section">
            <PageHeader
              title={dict.recentMovements}
              subtitle={dict.recentMovementsSubtitle}
            />
            <ul className="list-clean inventory-movement-list">
              {db.inventoryMovements.slice(0, 8).map((movement) => {
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
                    <div className="muted">{product?.sku}</div>
                    <div>{movement.reason}</div>
                    <div className="muted">
                      {new Date(movement.createdAt).toLocaleString(
                        locale === "ru" ? "ru-RU" : "en-US",
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

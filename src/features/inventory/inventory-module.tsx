"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Badge, Field, PageHeader } from "@/components/ui/primitives";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { getIntlLocale } from "@/lib/utils";
import { useMusicStore } from "@/store/music-store";

export function InventoryModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { db, adjustStock } = useMusicStore();
  const [productId, setProductId] = useState(db.products[0]?.id ?? "");
  const [delta, setDelta] = useState("1");
  const [reason, setReason] = useState(t("labels.manualCorrection"));
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
        <div className="inventory-overview">
          <div className="card metric-card">
            <div className="muted">{t("labels.stockOnHand")}</div>
            <div className="kpi-value">{totalUnits}</div>
          </div>
          <div className="card metric-card">
            <div className="muted">{t("labels.replenishmentRisk")}</div>
            <div className="kpi-value">{lowStockProducts.length}</div>
          </div>
          <div className="card metric-card">
            <div className="muted">{t("labels.showroomUnits")}</div>
            <div className="kpi-value">{showroomUnits}</div>
          </div>
          <div className="card metric-card">
            <div className="muted">{t("labels.movementCount")}</div>
            <div className="kpi-value">{recentMovementCount}</div>
          </div>
        </div>
      </section>

      <div className="inventory-grid">
        <section className="table-card inventory-table-section">
          <PageHeader
            title={t("nav.inventory")}
            subtitle={t("labels.stockHealth")}
          />
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>{t("labels.product")}</th>
                  <th>{t("labels.sku")}</th>
                  <th>{t("labels.available")}</th>
                  <th>{t("labels.condition")}</th>
                  <th>{t("labels.replenishmentRisk")}</th>
                </tr>
              </thead>
              <tbody>
                {db.products.map((product) => {
                  const isLow =
                    product.stockQty <= db.settings.lowStockThreshold;
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
                      <td>{dynamicLabel(t, product.condition)}</td>
                      <td>
                        <Badge tone={isLow ? "warn" : "neutral"}>
                          {isLow
                            ? `${t("labels.threshold")}: ${db.settings.lowStockThreshold}`
                            : t("labels.stockHealthy")}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <div className="inventory-side">
          <section className="table-card inventory-action-section">
            <PageHeader
              title={t("labels.stockAdjustment")}
              subtitle={t("labels.stockAdjustmentSubtitle")}
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
                      {t("labels.currentStock")}: {selectedProduct.stockQty}
                    </Badge>
                    <Badge tone="neutral">
                      {dynamicLabel(t, selectedProduct.condition)}
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
              <Field label={t("labels.product")}>
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
              <Field label={t("labels.delta")}>
                <input
                  type="number"
                  value={delta}
                  onChange={(event) => setDelta(event.target.value)}
                />
              </Field>
              <Field label={t("labels.reason")}>
                <textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </Field>
              <div className="stack-row">
                <button className="button" type="submit">
                  {t("common.save")}
                </button>
              </div>
            </form>
          </section>

          <section className="table-card inventory-movements-section">
            <PageHeader
              title={t("labels.recentMovements")}
              subtitle={t("labels.recentMovementsSubtitle")}
            />
            <ul className="list-clean inventory-movement-list">
              {db.inventoryMovements.slice(0, 8).map((movement) => {
                const product = db.products.find(
                  (item) => item.id === movement.productId,
                );
                return (
                  <li key={movement.id} className="card">
                    <div className="stack-row spread">
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
                        getIntlLocale(locale),
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

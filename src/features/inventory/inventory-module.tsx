"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.stockOnHand")}</div>
              <div className="kpi-value">{totalUnits}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.replenishmentRisk")}</div>
              <div className="kpi-value">{lowStockProducts.length}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.showroomUnits")}</div>
              <div className="kpi-value">{showroomUnits}</div>
            </CardContent>
          </Card>
          <Card className="metric-card">
            <CardContent className="p-6">
              <div className="muted">{t("labels.movementCount")}</div>
              <div className="kpi-value">{recentMovementCount}</div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="inventory-grid">
        <section className="table-card inventory-table-section">
          <PageHeader
            title={t("nav.inventory")}
            subtitle={t("labels.stockHealth")}
          />
          <div className="responsive-table">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("labels.product")}</TableHead>
                  <TableHead>{t("labels.sku")}</TableHead>
                  <TableHead>{t("labels.available")}</TableHead>
                  <TableHead>{t("labels.condition")}</TableHead>
                  <TableHead>{t("labels.replenishmentRisk")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {db.products.map((product) => {
                  const isLow =
                    product.stockQty <= db.settings.lowStockThreshold;
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <strong>{product.name}</strong>
                      </TableCell>
                      <TableCell>{product.sku}</TableCell>
                      <TableCell>
                        <Badge variant={isLow ? "warning" : "success"}>
                          {product.stockQty}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {dynamicLabel(t, product.condition)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={isLow ? "warning" : "secondary"}>
                          {isLow
                            ? `${t("labels.threshold")}: ${db.settings.lowStockThreshold}`
                            : t("labels.stockHealthy")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
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
                <Card>
                  <CardContent className="space-y-2 p-6">
                    <strong>{selectedProduct.name}</strong>
                    <div className="muted">{selectedProduct.sku}</div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <Badge
                        variant={
                          selectedProduct.stockQty <=
                          db.settings.lowStockThreshold
                            ? "warning"
                            : "success"
                        }
                      >
                        {t("labels.currentStock")}: {selectedProduct.stockQty}
                      </Badge>
                      <Badge variant="secondary">
                        {dynamicLabel(t, selectedProduct.condition)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}
            <form
              className="inventory-form grid gap-4"
              onSubmit={(event) => {
                event.preventDefault();
                void adjustStock(productId, Number(delta), reason);
              }}
            >
              <AppField label={t("labels.product")}>
                <Select value={productId} onValueChange={setProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("labels.product")} />
                  </SelectTrigger>
                  <SelectContent>
                    {db.products.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </AppField>
              <AppField label={t("labels.delta")}>
                <Input
                  type="number"
                  value={delta}
                  onChange={(event) => setDelta(event.target.value)}
                />
              </AppField>
              <AppField label={t("labels.reason")}>
                <Textarea
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                />
              </AppField>
              <div className="flex gap-2">
                <Button type="submit">{t("common.save")}</Button>
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
                  <Card key={movement.id}>
                    <CardContent className="space-y-2 p-5">
                      <div className="flex items-start justify-between gap-3">
                        <strong>{product?.name ?? movement.productId}</strong>
                        <Badge
                          variant={movement.delta > 0 ? "success" : "warning"}
                        >
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
                    </CardContent>
                  </Card>
                );
              })}
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}

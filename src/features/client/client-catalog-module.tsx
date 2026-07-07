"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { z } from "zod";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney } from "@/lib/utils";
import { useClientStore } from "@/store/music-store";
import { Product } from "@/types/music";

const checkoutSchema = z.object({
  qty: z.coerce.number().int().min(1),
  notes: z.string().min(4),
});

export function ClientCatalogModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { products, settings, createClientOrder } = useClientStore();
  const [query, setQuery] = useState("");
  const [purchaseTarget, setPurchaseTarget] = useState<Product | null>(null);
  const [qty, setQty] = useState("1");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const activeProducts = useMemo(
    () => products.filter((product) => product.status === "active"),
    [products],
  );

  const filteredProducts = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return activeProducts;

    return activeProducts.filter((product) =>
      `${product.name} ${product.sku} ${product.shortDescription}`
        .toLowerCase()
        .includes(value),
    );
  }, [activeProducts, query]);

  async function submitOrder() {
    const parsed = checkoutSchema.safeParse({
      qty,
      notes,
    });

    if (!purchaseTarget || !parsed.success) {
      setFormError(t("labels.validationFailed"));
      return;
    }

    setIsSubmitting(true);
    try {
      await createClientOrder({
        items: [
          {
            productId: purchaseTarget.id,
            qty: parsed.data.qty,
            unitPrice: purchaseTarget.price,
          },
        ],
        notes: parsed.data.notes,
      });
      setFormError("");
      setPurchaseTarget(null);
      setQty("1");
      setNotes("");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t("common.unexpectedError"),
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <section className="table-card space-y-4">
        <PageHeader
          title={t("nav.catalog")}
          subtitle={t("section.clientCatalogSubtitle")}
          actions={
            <Input
              className="w-full min-w-[220px] md:w-72"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("common.search")}
            />
          }
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredProducts.map((product) => {
            const previewImage = product.primaryImage ?? product.images[0];

            return (
              <Card key={product.id} className="overflow-hidden">
                <CardContent className="space-y-4 p-5">
                  {previewImage ? (
                    <Image
                      src={previewImage}
                      alt={product.name}
                      width={720}
                      height={180}
                      className="product-thumb product-thumb-featured"
                    />
                  ) : null}
                  <div className="space-y-2">
                    <div className="heading-row">
                      <strong>{product.name}</strong>
                      <Badge
                        variant={
                          product.stockQty <= settings.lowStockThreshold
                            ? "warning"
                            : "success"
                        }
                      >
                        {t("labels.stock")}: {product.stockQty}
                      </Badge>
                    </div>
                    <div className="muted">{product.shortDescription}</div>
                    <div className="heading-row">
                      <Badge variant="secondary">
                        {dynamicLabel(t, product.condition)}
                      </Badge>
                      <span>
                        {formatMoney(product.price, settings.currency, locale)}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    disabled={product.stockQty < 1}
                    onClick={() => {
                      setFormError("");
                      setQty("1");
                      setNotes(
                        `${t("labels.orderRequestPrefix")} ${product.name}`,
                      );
                      setPurchaseTarget(product);
                    }}
                  >
                    {t("labels.buyNow")}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
          {filteredProducts.length === 0 ? (
            <div className="empty-state md:col-span-2 xl:col-span-3">
              {t("common.noData")}
            </div>
          ) : null}
        </div>
      </section>

      <Dialog
        open={purchaseTarget !== null}
        onOpenChange={(open) => {
          if (!open) {
            setPurchaseTarget(null);
            setFormError("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("labels.placeOrder")}</DialogTitle>
          </DialogHeader>
          {formError ? <div className="error">{formError}</div> : null}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium">{purchaseTarget?.name}</div>
              <div className="muted">
                {purchaseTarget
                  ? formatMoney(
                      purchaseTarget.price,
                      settings.currency,
                      locale,
                    )
                  : null}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="client-order-qty">
                {t("labels.qty")}
              </label>
              <Input
                id="client-order-qty"
                type="number"
                min="1"
                max={String(purchaseTarget?.stockQty ?? 1)}
                value={qty}
                onChange={(event) => setQty(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label
                className="text-sm font-medium"
                htmlFor="client-order-notes"
              >
                {t("labels.orderNote")}
              </label>
              <Textarea
                id="client-order-notes"
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              type="button"
              onClick={() => setPurchaseTarget(null)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="button" disabled={isSubmitting} onClick={submitOrder}>
              {isSubmitting ? t("common.saving") : t("labels.placeOrder")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

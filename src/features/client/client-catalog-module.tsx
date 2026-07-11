"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useClientCatalogQuery } from "@/hooks/use-catalog-query";
import { Locale } from "@/i18n";
import { invalidateAppQueries } from "@/lib/query-utils";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney } from "@/lib/utils";
import { createClientOrder } from "@/services/client";
import { Product } from "@/types/music";

const checkoutSchema = z.object({
  qty: z.coerce.number().int().min(1),
  notes: z.string().min(4),
});

export function ClientCatalogModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data, isPending } = useClientCatalogQuery();
  const [query, setQuery] = useState("");
  const [purchaseTarget, setPurchaseTarget] = useState<Product | null>(null);
  const [qty, setQty] = useState("1");
  const [notes, setNotes] = useState("");
  const [formError, setFormError] = useState("");
  const orderMutation = useMutation({
    mutationFn: createClientOrder,
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });

  const activeProducts = useMemo(
    () => data?.products.filter((product) => product.status === "active") ?? [],
    [data?.products],
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

  if (isPending || !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  async function submitOrder() {
    const parsed = checkoutSchema.safeParse({
      qty,
      notes,
    });

    if (!purchaseTarget || !parsed.success) {
      setFormError(t("labels.validationFailed"));
      return;
    }

    try {
      await orderMutation.mutateAsync({
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
                          product.stockQty <= data.settings.lowStockThreshold
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
                        {formatMoney(product.price, data.settings.currency, locale)}
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
                      data.settings.currency,
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
              type="button"
              disabled={orderMutation.isPending}
              onClick={() => void submitOrder()}
            >
              {orderMutation.isPending ? t("common.saving") : t("common.save")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

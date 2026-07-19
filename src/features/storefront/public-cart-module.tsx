"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppConfigQuery } from "@/hooks/use-config-query";
import { Locale } from "@/i18n";
import {
  getStorefrontCartItemsCount,
  getStorefrontCartTotal,
  useStorefrontCartStore,
} from "@/features/storefront/storefront-cart-store";
import { formatMoney } from "@/lib/utils";

export function PublicCartModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const hasHydrated = useStorefrontCartStore((state) => state.hasHydrated);
  const items = useStorefrontCartStore((state) => state.items);
  const removeProduct = useStorefrontCartStore((state) => state.removeProduct);
  const setProductQty = useStorefrontCartStore((state) => state.setProductQty);
  const clearCart = useStorefrontCartStore((state) => state.clearCart);
  const { data: appConfig } = useAppConfigQuery();
  const currency = appConfig?.defaultCurrency ?? "UZS";
  const totalItems = getStorefrontCartItemsCount(items);
  const total = getStorefrontCartTotal(items);

  if (!hasHydrated) {
    return (
      <div className="storefront-flow">
        <Card className="storefront-empty-card">
          <CardContent className="p-6">
            <div className="empty-state">{t("common.loadingWorkspace")}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="storefront-flow">
      <section className="storefront-section storefront-section-tight">
        <div className="storefront-section-head">
          <div className="storefront-section-title">
            <h1>{t("storefront.cartPageTitle")}</h1>
          </div>
          <div className="storefront-section-copy">
            <p>{t("storefront.cartPageText")}</p>
          </div>
        </div>
      </section>

      {items.length === 0 ? (
        <Card className="storefront-empty-card">
          <CardContent className="p-6">
            <div className="empty-state">{t("storefront.cartEmpty")}</div>
            <div className="mt-4 flex justify-center">
              <Button asChild>
                <Link href={`/${locale}/catalog`}>
                  {t("storefront.continueShopping")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_340px]">
          <div className="grid gap-4">
            {items.map((item) => (
              <Card key={item.productId} className="storefront-product-card">
                <CardContent className="grid gap-4 p-5 md:grid-cols-[160px_minmax(0,1fr)]">
                  {item.primaryImage ? (
                    <Image
                      src={item.primaryImage}
                      alt={item.name}
                      width={320}
                      height={240}
                      className="storefront-product-image"
                    />
                  ) : (
                    <div className="storefront-product-image storefront-product-image-placeholder">
                      {t("storefront.imageUnavailable")}
                    </div>
                  )}
                  <div className="grid gap-4">
                    <div className="grid gap-1">
                      <strong>{item.name}</strong>
                      <span className="muted">{item.brand}</span>
                      <span className="text-lg font-bold">
                        {formatMoney(item.price, currency, locale)}
                      </span>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[120px_auto_auto] sm:items-end">
                      <label className="grid gap-2 text-sm font-medium">
                        <span>{t("labels.qty")}</span>
                        <Input
                          type="number"
                          min="1"
                          max={String(item.stockQty)}
                          value={String(item.qty)}
                          onChange={(event) =>
                            setProductQty(
                              item.productId,
                              Number(event.target.value) || 1,
                            )
                          }
                        />
                      </label>
                      <div className="text-sm font-medium">
                        {formatMoney(item.qty * item.price, currency, locale)}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => removeProduct(item.productId)}
                      >
                        {t("storefront.removeFromCart")}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="storefront-product-card h-fit">
            <CardContent className="grid gap-4 p-5">
              <strong>{t("storefront.orderSummaryTitle")}</strong>
              <div className="flex items-center justify-between gap-3">
                <span className="muted">{t("storefront.cartItemsCount")}</span>
                <strong>{totalItems}</strong>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="muted">{t("labels.total")}</span>
                <strong>{formatMoney(total, currency, locale)}</strong>
              </div>
              <Button asChild>
                <Link href={`/${locale}/checkout`}>
                  {t("storefront.proceedToCheckout")}
                </Link>
              </Button>
              <Button type="button" variant="outline" onClick={() => clearCart()}>
                {t("storefront.clearCart")}
              </Button>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

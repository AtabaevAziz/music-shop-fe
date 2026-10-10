"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStorefrontCartStore } from "@/features/storefront/storefront-cart-store";
import { Locale } from "@/i18n";
import { formatMoney } from "@/lib/utils";
import { useAuthSession } from "@/providers/session-provider";
import type { StorefrontProduct } from "@/services/storefront/storefront-types";

export function StorefrontProductCard({
  product,
  currency,
  locale,
}: {
  product: StorefrontProduct;
  currency: string;
  locale: Locale;
}) {
  const t = useTranslations();
  const { session } = useAuthSession();
  const addProduct = useStorefrontCartStore((state) => state.addProduct);
  const hasHydrated = useStorefrontCartStore((state) => state.hasHydrated);
  const quantityInCart = useStorefrontCartStore(
    (state) =>
      state.items.find((item) => item.productId === product.id)?.qty ?? 0,
  );
  const activeVariants = product.variants.filter(
    (variant) => variant.status === "active",
  );
  const [selectedVariantId, setSelectedVariantId] = useState(
    activeVariants[0]?.id,
  );
  const isGuest = !session;
  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) ??
    activeVariants[0];
  const previewImage = selectedVariant?.primaryImage ?? product.primaryImage;
  const availableQty = selectedVariant?.availableQty ?? product.availableQty;
  const price = selectedVariant?.price ?? product.price;

  return (
    <Card className="storefront-product-card">
      <CardContent className="p-5">
        <div className="storefront-product-media">
          {previewImage ? (
            <Image
              src={previewImage}
              alt={product.name}
              width={720}
              height={320}
              className="storefront-product-image"
            />
          ) : (
            <div className="storefront-product-image storefront-product-image-placeholder">
              {t("storefront.imageUnavailable")}
            </div>
          )}
        </div>
        <div className="storefront-product-topline">
          <Badge variant="secondary">{product.category.name}</Badge>
          <span className="muted">{product.brand}</span>
        </div>
        <div className="storefront-product-copy">
          <strong>{product.name}</strong>
          <p>{product.shortDescription}</p>
        </div>
        {activeVariants.length > 1 ? (
          <div className="storefront-variant-picker">
            <span className="muted">{t("labels.color")}</span>
            <div className="flex flex-wrap gap-2">
              {activeVariants.map((variant) => (
                <Button
                  key={variant.id}
                  type="button"
                  size="sm"
                  variant={
                    variant.id === selectedVariant?.id ? "default" : "outline"
                  }
                  onClick={() => setSelectedVariantId(variant.id)}
                >
                  {variant.colorName}
                </Button>
              ))}
            </div>
          </div>
        ) : null}
        <div className="storefront-product-footer">
          <span>{formatMoney(price, currency, locale)}</span>
          <div className="storefront-card-actions">
            <Button asChild variant="outline">
              <Link href={`/${locale}/products/${product.id}`}>
                {t("common.details")}
              </Link>
            </Button>
            <Button
              type="button"
              disabled={isGuest || !hasHydrated || availableQty < 1}
              onClick={() => addProduct(product, 1, selectedVariant?.id)}
            >
              {hasHydrated && quantityInCart > 0
                ? `${t("labels.addToCart")} (${quantityInCart})`
                : t("labels.addToCart")}
            </Button>
            {product.repairable ? (
              <Button asChild variant="ghost">
                <Link
                  href={`/${locale}/repairs?productId=${product.id}${
                    selectedVariant?.id
                      ? `&variantId=${selectedVariant.id}`
                      : ""
                  }`}
                >
                  {t("labels.requestRepair")}
                </Link>
              </Button>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

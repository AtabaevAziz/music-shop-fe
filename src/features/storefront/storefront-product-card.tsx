"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStorefrontCartStore } from "@/features/storefront/storefront-cart-store";
import { Locale } from "@/i18n";
import { formatMoney } from "@/lib/utils";
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
  const addProduct = useStorefrontCartStore((state) => state.addProduct);
  const hasHydrated = useStorefrontCartStore((state) => state.hasHydrated);
  const quantityInCart = useStorefrontCartStore(
    (state) =>
      state.items.find((item) => item.productId === product.id)?.qty ?? 0,
  );

  return (
    <Card className="storefront-product-card">
      <CardContent className="p-5">
        <div className="storefront-product-media">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
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
        <div className="storefront-product-footer">
          <span>{formatMoney(product.price, currency, locale)}</span>
          <div className="storefront-card-actions">
            <Button asChild variant="outline">
              <Link href={`/${locale}/products/${product.id}`}>
                {t("common.details")}
              </Link>
            </Button>
            <Button
              type="button"
              disabled={!hasHydrated || product.stockQty < 1}
              onClick={() => addProduct(product)}
            >
              {hasHydrated && quantityInCart > 0
                ? `${t("labels.addToCart")} (${quantityInCart})`
                : t("labels.addToCart")}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

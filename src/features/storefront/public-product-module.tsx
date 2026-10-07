"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStorefrontCartStore } from "@/features/storefront/storefront-cart-store";
import { useAppConfigQuery } from "@/hooks/use-config-query";
import { useStorefrontProductQuery } from "@/hooks/use-storefront-query";
import { Locale } from "@/i18n";
import { hasConfiguredApiBaseUrl } from "@/lib/api-config";
import { formatMoney } from "@/lib/utils";
import { useAuthSession } from "@/providers/session-provider";

export function PublicProductModule({
  id,
  locale,
}: {
  id: string;
  locale: Locale;
}) {
  const t = useTranslations();
  const isApiConfigured = hasConfiguredApiBaseUrl();
  const { session } = useAuthSession();
  const { data: appConfig } = useAppConfigQuery();
  const { data: product, isPending, error } = useStorefrontProductQuery(id);
  const addProduct = useStorefrontCartStore((state) => state.addProduct);
  const hasHydrated = useStorefrontCartStore((state) => state.hasHydrated);
  const quantityInCart = useStorefrontCartStore((state) =>
    state.items
      .filter((item) => item.productId === id)
      .reduce((total, item) => total + item.qty, 0),
  );
  const currency = appConfig?.defaultCurrency ?? "UZS";
  const isGuest = !session;
  const [selectedVariantId, setSelectedVariantId] = useState<string>();

  if (!isApiConfigured) {
    return (
      <section className="storefront-section storefront-section-tight">
        <Card className="storefront-empty-card">
          <CardContent className="p-6">
            <div className="empty-state">{t("storefront.apiUnavailable")}</div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (isPending) {
    return (
      <section className="storefront-section storefront-section-tight">
        <Card className="storefront-empty-card">
          <CardContent className="p-6">
            <div className="empty-state">{t("common.loadingWorkspace")}</div>
          </CardContent>
        </Card>
      </section>
    );
  }

  if (!product || error) {
    return (
      <section className="storefront-section storefront-section-tight">
        <Card className="storefront-empty-card">
          <CardContent className="p-6">
            <div className="empty-state">
              {t("storefront.productUnavailable")}
            </div>
          </CardContent>
        </Card>
      </section>
    );
  }

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ??
    product.variants.find((variant) => variant.status === "active");
  const displayImage = selectedVariant?.primaryImage ?? product.primaryImage;
  const displayPrice = selectedVariant?.price ?? product.price;
  const displayAvailableQty =
    selectedVariant?.availableQty ?? product.availableQty;

  return (
    <div className="storefront-flow">
      <section className="storefront-product-hero">
        <div className="storefront-product-gallery">
          <div className="storefront-product-media storefront-product-media-detail">
            {displayImage ? (
              <Image
                src={displayImage}
                alt={product.name}
                width={960}
                height={720}
                className="storefront-product-detail-image"
              />
            ) : (
              <div className="storefront-product-detail-image storefront-product-image-placeholder">
                {t("storefront.imageUnavailable")}
              </div>
            )}
          </div>
        </div>
        <div className="storefront-product-panel">
          <div className="storefront-product-topline">
            <Badge variant="secondary">{product.category.name}</Badge>
            <span className="muted">{product.brand}</span>
          </div>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="storefront-product-price">
            {formatMoney(displayPrice, currency, locale)}
          </div>
          {product.variants.length > 1 ? (
            <div className="storefront-variant-picker">
              <span className="muted">{t("labels.color")}</span>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <Button
                    key={variant.id}
                    type="button"
                    variant={
                      variant.id === selectedVariant?.id ? "default" : "outline"
                    }
                    disabled={variant.status !== "active"}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.colorName}
                  </Button>
                ))}
              </div>
            </div>
          ) : null}
          <div className="storefront-spec-grid">
            <div>
              <span>{t("labels.availability")}</span>
              <strong>
                {displayAvailableQty > 0
                  ? t("labels.inStock")
                  : t("labels.outOfStock")}
              </strong>
            </div>
            <div>
              <span>{t("labels.condition")}</span>
              <strong>{t(`dynamic.${product.condition}`)}</strong>
            </div>
            <div>
              <span>{t("labels.brand")}</span>
              <strong>{product.brand}</strong>
            </div>
            <div>
              <span>{t("labels.category")}</span>
              <strong>{product.category.name}</strong>
            </div>
            <div>
              <span>{t("labels.stock")}</span>
              <strong>{displayAvailableQty}</strong>
            </div>
          </div>
          <div className="storefront-cta-row">
            <Button
              type="button"
              size="lg"
              disabled={isGuest || !hasHydrated || displayAvailableQty < 1}
              onClick={() => addProduct(product, 1, selectedVariant?.id)}
            >
              {hasHydrated && quantityInCart > 0
                ? `${t("labels.addToCart")} (${quantityInCart})`
                : t("labels.addToCart")}
            </Button>
            {session ? (
              <Button asChild variant="outline" size="lg">
                <Link href={`/${locale}/cart`}>{t("storefront.viewCart")}</Link>
              </Button>
            ) : null}
            <Button asChild variant="outline" size="lg">
              <Link
                href={
                  session
                    ? `/${locale}/app`
                    : `/${locale}/login?next=/${locale}/app`
                }
              >
                {session
                  ? t("storefront.clientPortalCta")
                  : t("storefront.productPrimaryCta")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/${locale}`}>
                {t("storefront.backToStorefront")}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="storefront-section storefront-section-tight">
        <div className="storefront-section-head">
          <div>
            <span className="storefront-kicker">
              {t("storefront.specsKicker")}
            </span>
            <h2>{t("storefront.specsTitle")}</h2>
          </div>
          <p>{t("storefront.specsText")}</p>
        </div>
        <div className="storefront-spec-list">
          {Object.entries(product.specs).map(([key, value]) => (
            <div key={key}>
              <span>{key}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

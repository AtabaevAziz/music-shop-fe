"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppConfigQuery } from "@/hooks/use-config-query";
import { useStorefrontProductQuery } from "@/hooks/use-storefront-query";
import { Locale } from "@/i18n";
import { hasConfiguredApiBaseUrl } from "@/lib/api-config";
import { formatMoney } from "@/lib/utils";

export function PublicProductModule({
  id,
  locale,
}: {
  id: string;
  locale: Locale;
}) {
  const t = useTranslations();
  const isApiConfigured = hasConfiguredApiBaseUrl();
  const { data: appConfig } = useAppConfigQuery();
  const { data: product, isPending, error } = useStorefrontProductQuery(id);
  const currency = appConfig?.defaultCurrency ?? "UZS";

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
            <div className="empty-state">{t("storefront.productUnavailable")}</div>
          </CardContent>
        </Card>
      </section>
    );
  }

  return (
    <div className="storefront-flow">
      <section className="storefront-product-hero">
        <div className="storefront-product-gallery">
          {product.primaryImage ? (
            <Image
              src={product.primaryImage}
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
        <div className="storefront-product-panel">
          <div className="storefront-product-topline">
            <Badge variant="secondary">{product.category.name}</Badge>
            <span className="muted">{product.brand.name}</span>
          </div>
          <h1>{product.name}</h1>
          <p>{product.description}</p>
          <div className="storefront-product-price">
            {formatMoney(product.price, currency, locale)}
          </div>
          <div className="storefront-spec-grid">
            <div>
              <span>{t("labels.availability")}</span>
              <strong>
                {product.stockQty > 0 ? t("labels.inStock") : t("labels.outOfStock")}
              </strong>
            </div>
            <div>
              <span>{t("labels.condition")}</span>
              <strong>{t(`dynamic.${product.condition}`)}</strong>
            </div>
            <div>
              <span>{t("labels.brand")}</span>
              <strong>{product.brand.name}</strong>
            </div>
            <div>
              <span>{t("labels.category")}</span>
              <strong>{product.category.name}</strong>
            </div>
          </div>
          <div className="storefront-cta-row">
            <Button asChild size="lg">
              <Link href={`/${locale}/login?next=/${locale}/app/catalog`}>
                {t("storefront.productPrimaryCta")}
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/${locale}/catalog`}>{t("storefront.backToCatalog")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="storefront-section storefront-section-tight">
        <div className="storefront-section-head">
          <div>
            <span className="storefront-kicker">{t("storefront.specsKicker")}</span>
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

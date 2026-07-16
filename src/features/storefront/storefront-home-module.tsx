"use client";

import { ArrowRight, Headphones, ShieldCheck, Truck, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAppConfigQuery } from "@/hooks/use-config-query";
import { useStorefrontProductsQuery } from "@/hooks/use-storefront-query";
import { Locale } from "@/i18n";
import { hasConfiguredApiBaseUrl } from "@/lib/api-config";
import { formatMoney } from "@/lib/utils";

const serviceIconMap = {
  selection: Headphones,
  delivery: Truck,
  warranty: ShieldCheck,
  repairs: Wrench,
} as const;

export function StorefrontHomeModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const isApiConfigured = hasConfiguredApiBaseUrl();
  const { data: appConfig } = useAppConfigQuery();
  const {
    data: products,
    error,
    isPending,
  } = useStorefrontProductsQuery();
  const featuredProducts = (products ?? []).slice(0, 4);
  const categories = Array.from(
    new Map(
      (products ?? []).map((product) => [product.category.id, product.category]),
    ).values(),
  ).slice(0, 4);
  const currency = appConfig?.defaultCurrency ?? "UZS";
  const showcaseProduct = featuredProducts[0];
  const hasCatalogError = Boolean(error);
  const isCatalogEmpty = !isPending && featuredProducts.length === 0;

  return (
    <div className="storefront-flow">
      <section className="storefront-hero">
        <div className="storefront-hero-copy">
          <Badge variant="secondary" className="storefront-badge">
            {t("storefront.badge")}
          </Badge>
          <h1>{t("storefront.heroTitle")}</h1>
          <p>{t("storefront.heroText")}</p>
          <div className="storefront-cta-row">
            <Button asChild size="lg">
              <Link href={`/${locale}/catalog`}>
                {t("storefront.primaryCta")}
                <ArrowRight size={16} />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href={`/${locale}/login`}>{t("storefront.secondaryCta")}</Link>
            </Button>
          </div>
          <div className="storefront-proof-grid">
            <div>
              <strong>450+</strong>
              <span>{t("storefront.proofProducts")}</span>
            </div>
            <div>
              <strong>3</strong>
              <span>{t("storefront.proofLocales")}</span>
            </div>
            <div>
              <strong>48h</strong>
              <span>{t("storefront.proofDispatch")}</span>
            </div>
          </div>
        </div>
        <div className="storefront-hero-panel">
          <div className="storefront-hero-card">
            <span className="storefront-kicker">{t("storefront.featuredKicker")}</span>
            {showcaseProduct?.primaryImage ? (
              <Image
                src={showcaseProduct.primaryImage}
                alt={showcaseProduct.name}
                width={720}
                height={440}
                className="storefront-hero-image"
              />
            ) : (
              <div className="storefront-hero-placeholder">
                {t(
                  !isApiConfigured
                    ? "storefront.apiUnavailable"
                    : "storefront.heroFallbackProduct",
                )}
              </div>
            )}
            <div className="storefront-hero-meta">
              <strong>
                {showcaseProduct?.name ?? t("storefront.heroFallbackProduct")}
              </strong>
              <span>
                {showcaseProduct
                  ? formatMoney(showcaseProduct.price, currency, locale)
                  : t(
                      !isApiConfigured
                        ? "storefront.apiUnavailable"
                        : isPending
                          ? "common.loadingWorkspace"
                          : "storefront.catalogUnavailable",
                    )}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="storefront-section">
        <div className="storefront-section-head">
          <div>
            <span className="storefront-kicker">{t("storefront.servicesKicker")}</span>
            <h2>{t("storefront.servicesTitle")}</h2>
          </div>
          <p>{t("storefront.servicesText")}</p>
        </div>
        <div className="storefront-services-grid">
          {(["selection", "delivery", "warranty", "repairs"] as const).map((key) => {
            const Icon = serviceIconMap[key];

            return (
              <Card key={key} className="storefront-service-card">
                <CardContent className="p-6">
                  <div className="storefront-service-icon">
                    <Icon size={18} />
                  </div>
                  <strong>{t(`storefront.serviceCards.${key}.title`)}</strong>
                  <p>{t(`storefront.serviceCards.${key}.text`)}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="storefront-section">
        <div className="storefront-section-head">
          <div>
            <span className="storefront-kicker">{t("storefront.categoriesKicker")}</span>
            <h2>{t("storefront.categoriesTitle")}</h2>
          </div>
          <p>{t("storefront.categoriesText")}</p>
        </div>
        <div className="storefront-category-grid">
          {categories.length === 0 ? (
            <div className="empty-state">
              {t(
                !isApiConfigured
                  ? "storefront.apiUnavailable"
                  : hasCatalogError
                    ? "storefront.catalogUnavailable"
                    : "storefront.noProducts",
              )}
            </div>
          ) : (
            categories.map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/catalog?category=${category.slug}`}
                className="storefront-category-card"
              >
                <span>{category.name}</span>
                <ArrowRight size={16} />
              </Link>
            ))
          )}
        </div>
      </section>

      <section className="storefront-section">
        <div className="storefront-section-head">
          <div>
            <span className="storefront-kicker">{t("storefront.catalogKicker")}</span>
            <h2>{t("storefront.catalogTitle")}</h2>
          </div>
          <p>{t("storefront.catalogText")}</p>
        </div>
        <div className="storefront-products-grid">
          {!isApiConfigured ? (
            <Card className="storefront-empty-card">
              <CardContent className="p-6">
                <div className="empty-state">{t("storefront.apiUnavailable")}</div>
              </CardContent>
            </Card>
          ) : isPending
            ? Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="storefront-product-card">
                  <CardContent className="p-5">
                    <div className="empty-state">{t("common.loadingWorkspace")}</div>
                  </CardContent>
                </Card>
              ))
            : hasCatalogError ? (
                <Card className="storefront-empty-card">
                  <CardContent className="p-6">
                    <div className="empty-state">
                      {t("storefront.catalogUnavailable")}
                    </div>
                  </CardContent>
                </Card>
              ) : isCatalogEmpty ? (
                <Card className="storefront-empty-card">
                  <CardContent className="p-6">
                    <div className="empty-state">{t("storefront.noProducts")}</div>
                  </CardContent>
                </Card>
              ) : (
                featuredProducts.map((product) => (
                  <Card key={product.id} className="storefront-product-card">
                    <CardContent className="p-5">
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
                      <div className="storefront-product-copy">
                        <span className="muted">{product.brand.name}</span>
                        <strong>{product.name}</strong>
                        <p>{product.shortDescription}</p>
                      </div>
                      <div className="storefront-product-footer">
                        <span>{formatMoney(product.price, currency, locale)}</span>
                        <Button asChild variant="outline">
                          <Link href={`/${locale}/products/${product.id}`}>
                            {t("common.details")}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
        </div>
      </section>

      <section id="repairs" className="storefront-banner">
        <div>
          <span className="storefront-kicker">{t("storefront.repairsKicker")}</span>
          <h2>{t("storefront.repairsTitle")}</h2>
          <p>{t("storefront.repairsText")}</p>
        </div>
        <Button asChild size="lg">
          <Link href={`/${locale}/login`}>{t("storefront.repairsCta")}</Link>
        </Button>
      </section>
    </div>
  );
}

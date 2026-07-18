"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppConfigQuery } from "@/hooks/use-config-query";
import { useStorefrontProductsQuery } from "@/hooks/use-storefront-query";
import { Locale } from "@/i18n";
import { hasConfiguredApiBaseUrl } from "@/lib/api-config";
import { formatMoney } from "@/lib/utils";

export function PublicCatalogModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const isApiConfigured = hasConfiguredApiBaseUrl();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "all";
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const deferredQuery = useDeferredValue(query);
  const { data: appConfig } = useAppConfigQuery();
  const {
    data: products,
    error,
    isPending,
  } = useStorefrontProductsQuery(deferredQuery);
  const categories = Array.from(
    new Map(
      (products ?? []).map((product) => [product.category.slug, product.category]),
    ).values(),
  );
  const currency = appConfig?.defaultCurrency ?? "UZS";
  const visibleProducts = (products ?? []).filter(
    (product) =>
      selectedCategory === "all" || product.category.slug === selectedCategory,
  );

  useEffect(() => {
    setSelectedCategory(categoryParam);
  }, [categoryParam]);

  function handleCategoryChange(nextCategory: string) {
    setSelectedCategory(nextCategory);

    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextCategory === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", nextCategory);
    }

    const nextQuery = nextParams.toString();
    router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`);
  }

  return (
    <div className="storefront-flow">
      <section className="storefront-section storefront-section-tight">
        <div className="storefront-section-head">
          <div>
            <span className="storefront-kicker">{t("storefront.catalogKicker")}</span>
            <h1>{t("storefront.catalogPageTitle")}</h1>
          </div>
          <p>{t("storefront.catalogPageText")}</p>
        </div>
        <div className="storefront-filter-bar">
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("storefront.searchPlaceholder")}
            className="storefront-search-input"
          />
          <div className="storefront-category-pills">
            <button
              type="button"
              className={selectedCategory === "all" ? "active" : ""}
              onClick={() => handleCategoryChange("all")}
            >
              {t("storefront.allCategories")}
            </button>
            {categories.map((category) => (
              <button
                type="button"
                key={category.id}
                className={selectedCategory === category.slug ? "active" : ""}
                onClick={() => handleCategoryChange(category.slug)}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="storefront-products-grid">
        {!isApiConfigured ? (
          <Card className="storefront-empty-card">
            <CardContent className="p-6">
              <div className="empty-state">{t("storefront.apiUnavailable")}</div>
            </CardContent>
          </Card>
        ) : isPending ? (
          <Card className="storefront-empty-card">
            <CardContent className="p-6">
              <div className="empty-state">{t("common.loadingWorkspace")}</div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="storefront-empty-card">
            <CardContent className="p-6">
              <div className="empty-state">{t("storefront.catalogUnavailable")}</div>
            </CardContent>
          </Card>
        ) : visibleProducts.length === 0 ? (
          <Card className="storefront-empty-card">
            <CardContent className="p-6">
              <div className="empty-state">{t("storefront.noProducts")}</div>
            </CardContent>
          </Card>
        ) : (
          visibleProducts.map((product) => (
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
                    <Button asChild>
                      <Link href={`/${locale}/login?next=/${locale}/app/catalog`}>
                        {t("labels.buyNow")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </div>
  );
}

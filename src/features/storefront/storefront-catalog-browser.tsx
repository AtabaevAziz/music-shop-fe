"use client";

import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDeferredValue, useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAppConfigQuery } from "@/hooks/use-config-query";
import { useStorefrontProductsQuery } from "@/hooks/use-storefront-query";
import { Locale } from "@/i18n";
import { hasConfiguredApiBaseUrl } from "@/lib/api-config";

import { StorefrontProductCard } from "./storefront-product-card";

export function StorefrontCatalogBrowser({
  locale,
  title,
  description,
  headingLevel = "h1",
  syncCategoryWithUrl = true,
}: {
  locale: Locale;
  title: string;
  description: string;
  headingLevel?: "h1" | "h2";
  syncCategoryWithUrl?: boolean;
}) {
  const t = useTranslations();
  const isApiConfigured = hasConfiguredApiBaseUrl();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") ?? "all";
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    syncCategoryWithUrl ? categoryParam : "all",
  );
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
  const HeadingTag = headingLevel;

  useEffect(() => {
    if (!syncCategoryWithUrl) {
      return;
    }

    setSelectedCategory(categoryParam);
  }, [categoryParam, syncCategoryWithUrl]);

  function handleCategoryChange(nextCategory: string) {
    setSelectedCategory(nextCategory);

    if (!syncCategoryWithUrl) {
      return;
    }

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
    <>
      <section className="storefront-section storefront-section-tight">
        <div className="storefront-section-head">
          <div className="storefront-section-title">
            <HeadingTag>{title}</HeadingTag>
          </div>
          <div className="storefront-section-copy">
            <p>{description}</p>
            <span className="storefront-guest-note">
              {t("storefront.purchaseRequiresLogin")}
            </span>
          </div>
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
            <StorefrontProductCard
              key={product.id}
              product={product}
              currency={currency}
              locale={locale}
            />
          ))
        )}
      </section>
    </>
  );
}

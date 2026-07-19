"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { startTransition, useEffect, useMemo, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { useAppConfigQuery } from "@/hooks/use-config-query";
import { useStorefrontProductsQuery } from "@/hooks/use-storefront-query";
import { Locale } from "@/i18n";
import { hasConfiguredApiBaseUrl } from "@/lib/api-config";
import type { StorefrontProduct } from "@/services/storefront/storefront-types";

import { StorefrontProductCard } from "./storefront-product-card";

type CategoryGroup = {
  id: string;
  name: string;
  slug: string;
  products: StorefrontProduct[];
};

export function PublicCategoriesModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const isApiConfigured = hasConfiguredApiBaseUrl();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<
    string | null
  >(null);
  const { data: appConfig } = useAppConfigQuery();
  const { data: products, error, isPending } = useStorefrontProductsQuery();

  const categories = useMemo(() => {
    const categoryMap = new Map<string, CategoryGroup>();

    for (const product of products ?? []) {
      const existing = categoryMap.get(product.category.slug);

      if (existing) {
        existing.products.push(product);
        continue;
      }

      categoryMap.set(product.category.slug, {
        ...product.category,
        products: [product],
      });
    }

    return Array.from(categoryMap.values())
      .map((category) => ({
        ...category,
        products: [...category.products].sort((left, right) =>
          left.name.localeCompare(right.name, locale),
        ),
      }))
      .sort((left, right) => left.name.localeCompare(right.name, locale));
  }, [locale, products]);

  const selectedCategory = useMemo(
    () =>
      categories.find((category) => category.slug === selectedCategorySlug) ??
      null,
    [categories, selectedCategorySlug],
  );
  const currency = appConfig?.defaultCurrency ?? "UZS";

  useEffect(() => {
    if (!categoryParam) {
      setSelectedCategorySlug(null);
      return;
    }

    setSelectedCategorySlug(
      categories.some((category) => category.slug === categoryParam)
        ? categoryParam
        : null,
    );
  }, [categories, categoryParam]);

  function handleCategoryToggle(slug: string) {
    const nextCategory = selectedCategorySlug === slug ? null : slug;

    setSelectedCategorySlug(nextCategory);

    const nextParams = new URLSearchParams(searchParams.toString());
    if (nextCategory) {
      nextParams.set("category", nextCategory);
    } else {
      nextParams.delete("category");
    }

    const nextQuery = nextParams.toString();
    startTransition(() => {
      router.replace(`${pathname}${nextQuery ? `?${nextQuery}` : ""}`);
    });
  }

  return (
    <div className="storefront-flow">
      <section className="storefront-section storefront-section-tight">
        <div className="storefront-section-head">
          <div className="storefront-section-title">
            <h1>{t("storefront.categoriesPageTitle")}</h1>
          </div>
          <p>{t("storefront.categoriesPageText")}</p>
        </div>

        {!isApiConfigured ? (
          <Card className="storefront-empty-card">
            <CardContent className="p-6">
              <div className="empty-state">
                {t("storefront.apiUnavailable")}
              </div>
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
              <div className="empty-state">
                {t("storefront.catalogUnavailable")}
              </div>
            </CardContent>
          </Card>
        ) : categories.length === 0 ? (
          <Card className="storefront-empty-card">
            <CardContent className="p-6">
              <div className="empty-state">{t("storefront.noProducts")}</div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="storefront-category-grid">
              {categories.map((category) => {
                const isActive = category.slug === selectedCategorySlug;

                return (
                  <button
                    key={category.id}
                    type="button"
                    aria-controls="storefront-category-products"
                    aria-pressed={isActive}
                    className={`storefront-category-card${
                      isActive ? " active" : ""
                    }`}
                    onClick={() => handleCategoryToggle(category.slug)}
                  >
                    <div className="storefront-category-card-copy">
                      <span>{category.name}</span>
                      <div className="storefront-category-card-meta">
                        <strong>{category.products.length}</strong>
                        <span>{t("labels.productsCount")}</span>
                      </div>
                    </div>
                    <ArrowRight size={16} />
                  </button>
                );
              })}
            </div>

            {!selectedCategory ? (
              <Card className="storefront-empty-card">
                <CardContent className="p-6">
                  <div className="empty-state">
                    {t("storefront.chooseCategoryPrompt")}
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </>
        )}
      </section>

      {selectedCategory ? (
        <section
          id="storefront-category-products"
          className="storefront-section"
        >
          <div className="storefront-section-head">
            <div>
              <span className="storefront-kicker">{t("nav.categories")}</span>
              <h2>
                {t("storefront.categoryProductsTitle", {
                  category: selectedCategory.name,
                })}
              </h2>
            </div>
            <div className="storefront-category-card-meta storefront-category-panel-meta">
              <strong>{selectedCategory.products.length}</strong>
              <span>{t("labels.productsCount")}</span>
            </div>
          </div>

          {selectedCategory.products.length === 0 ? (
            <Card className="storefront-empty-card">
              <CardContent className="p-6">
                <div className="empty-state">
                  {t("storefront.categoryProductsEmpty")}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="storefront-products-grid">
              {selectedCategory.products.map((product) => (
                <StorefrontProductCard
                  key={product.id}
                  product={product}
                  currency={currency}
                  locale={locale}
                />
              ))}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}

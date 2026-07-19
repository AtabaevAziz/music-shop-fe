"use client";

import { useTranslations } from "next-intl";

import { Locale } from "@/i18n";

import { StorefrontCatalogBrowser } from "./storefront-catalog-browser";

export function StorefrontHomeModule({ locale }: { locale: Locale }) {
  const t = useTranslations();

  return (
    <div className="storefront-flow">
      <StorefrontCatalogBrowser
        locale={locale}
        title={t("storefront.catalogLandingTitle")}
        description={t("storefront.catalogLandingText")}
        headingLevel="h1"
        syncCategoryWithUrl={false}
      />
    </div>
  );
}

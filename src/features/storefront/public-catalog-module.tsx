"use client";

import { useTranslations } from "next-intl";

import { Locale } from "@/i18n";

import { StorefrontCatalogBrowser } from "./storefront-catalog-browser";

export function PublicCatalogModule({ locale }: { locale: Locale }) {
  const t = useTranslations();

  return (
    <div className="storefront-flow">
      <StorefrontCatalogBrowser
        locale={locale}
        title={t("storefront.catalogPageTitle")}
        description={t("storefront.catalogPageText")}
      />
    </div>
  );
}

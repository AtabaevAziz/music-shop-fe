"use client";

import { Clock3, MapPin, Phone } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardContent } from "@/components/ui/card";

export function PublicContactsModule() {
  const t = useTranslations();

  return (
    <div className="storefront-flow">
      <section className="storefront-section storefront-section-tight">
        <div className="storefront-section-head">
          <div className="storefront-section-title">
            <h1>{t("storefront.contactsPageTitle")}</h1>
          </div>
          <div className="storefront-section-copy">
            <p>{t("storefront.contactsPageText")}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="storefront-product-card">
          <CardContent className="grid gap-3 p-5">
            <MapPin size={18} />
            <strong>{t("storefront.contactsAddressTitle")}</strong>
            <p className="muted">{t("storefront.contactsAddressText")}</p>
          </CardContent>
        </Card>
        <Card className="storefront-product-card">
          <CardContent className="grid gap-3 p-5">
            <Phone size={18} />
            <strong>{t("storefront.contactsPhoneTitle")}</strong>
            <div className="grid gap-1">
              <a href="tel:+998712000000">{t("storefront.contactsPhonePrimary")}</a>
              <a href="tel:+998909990000">{t("storefront.contactsPhoneWorkshop")}</a>
            </div>
          </CardContent>
        </Card>
        <Card className="storefront-product-card">
          <CardContent className="grid gap-3 p-5">
            <Clock3 size={18} />
            <strong>{t("storefront.contactsHoursTitle")}</strong>
            <p className="muted">{t("storefront.contactsHoursText")}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="storefront-product-card">
        <CardContent className="grid gap-3 p-5">
          <strong>{t("storefront.contactsWorkshopTitle")}</strong>
          <p className="muted">{t("storefront.contactsWorkshopText")}</p>
          <a
            href="https://maps.google.com/?q=Tashkent+music+service"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium"
          >
            {t("storefront.contactsMapLink")}
          </a>
        </CardContent>
      </Card>
    </div>
  );
}

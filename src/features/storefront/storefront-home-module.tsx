"use client";

import { ArrowRight, Headphones, ShoppingBag, Wrench } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoginScreen } from "@/features/auth/login-screen";
import { Locale } from "@/i18n";

import { PublicRepairRequestModule } from "./public-repair-request-module";
import { StorefrontCatalogBrowser } from "./storefront-catalog-browser";

type LandingPanel = "catalog" | "repair" | "auth";

export function StorefrontHomeModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const [activePanel, setActivePanel] = useState<LandingPanel | null>(null);
  const panelCopy = {
    catalog: [t("landing.catalogModalTitle"), t("landing.catalogModalText")],
    repair: [t("landing.repairModalTitle"), t("landing.repairModalText")],
    auth: [t("landing.authModalTitle"), t("landing.authModalText")],
  } as const;

  return (
    <div className="storefront-flow landing-presentation">
      <section className="storefront-hero landing-hero">
        <div className="storefront-hero-copy">
          <span className="hero-eyebrow">{t("landing.eyebrow")}</span>
          <h1>{t("landing.title")}</h1>
          <p>{t("landing.text")}</p>
          <div className="storefront-hero-actions">
            <Button type="button" onClick={() => setActivePanel("catalog")}>
              <ShoppingBag size={17} />
              {t("landing.catalogCta")}
              <ArrowRight size={16} />
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setActivePanel("repair")}
            >
              <Wrench size={17} />
              {t("landing.repairCta")}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setActivePanel("auth")}
            >
              {t("landing.authCta")}
            </Button>
          </div>
        </div>
        <Card className="storefront-hero-panel">
          <CardContent>
            <Headphones size={30} />
            <strong>{t("landing.featureTitle")}</strong>
            <p>{t("landing.featureText")}</p>
          </CardContent>
        </Card>
      </section>
      <section className="landing-service-grid" aria-label={t("landing.title")}>
        <Card>
          <CardContent>
            <ShoppingBag size={22} />
            <h2>{t("landing.serviceCatalogTitle")}</h2>
            <p>{t("landing.serviceCatalogText")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Wrench size={22} />
            <h2>{t("landing.serviceRepairTitle")}</h2>
            <p>{t("landing.serviceRepairText")}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Headphones size={22} />
            <h2>{t("landing.serviceStudioTitle")}</h2>
            <p>{t("landing.serviceStudioText")}</p>
          </CardContent>
        </Card>
      </section>
      <Dialog
        open={activePanel !== null}
        onOpenChange={(open) => !open && setActivePanel(null)}
      >
        <DialogContent className="landing-modal-content">
          {activePanel ? (
            <DialogHeader>
              <DialogTitle>{panelCopy[activePanel][0]}</DialogTitle>
              <DialogDescription>{panelCopy[activePanel][1]}</DialogDescription>
            </DialogHeader>
          ) : null}
          {activePanel === "catalog" ? (
            <StorefrontCatalogBrowser
              locale={locale}
              title={t("storefront.catalogPageTitle")}
              description={t("storefront.catalogPageText")}
              headingLevel="h2"
              syncCategoryWithUrl={false}
            />
          ) : null}
          {activePanel === "repair" ? (
            <PublicRepairRequestModule locale={locale} embedded />
          ) : null}
          {activePanel === "auth" ? (
            <LoginScreen locale={locale} embedded />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

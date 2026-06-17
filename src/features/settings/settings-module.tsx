"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { AppField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { dynamicLabel } from "@/lib/translations";
import { ModuleSection } from "@/shared/components/module-shell";
import { useMusicStore } from "@/store/music-store";
import { ProductStatus } from "@/types/music";

type SettingsDraft = {
  currency: string;
  lowStockThreshold: string;
  defaultProductStatus: ProductStatus;
  defaultMarkupPercent: string;
};

export function SettingsModule() {
  const t = useTranslations();
  const { db, saveSettings } = useMusicStore();
  const [draft, setDraft] = useState<SettingsDraft>({
    currency: db.settings.currency,
    lowStockThreshold: String(db.settings.lowStockThreshold),
    defaultProductStatus: db.settings.defaultProductStatus,
    defaultMarkupPercent: String(db.settings.defaultMarkupPercent),
  });

  return (
    <ModuleSection
      title={t("nav.settings")}
      subtitle={t("section.settingsSubtitle")}
    >
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void saveSettings({
            currency: draft.currency,
            lowStockThreshold: Number(draft.lowStockThreshold),
            defaultProductStatus: draft.defaultProductStatus as
              | "draft"
              | "active"
              | "archived",
            defaultMarkupPercent: Number(draft.defaultMarkupPercent),
          });
        }}
      >
        <AppField label={t("labels.currency")}>
          <Input
            value={draft.currency}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                currency: event.target.value,
              }))
            }
          />
        </AppField>
        <AppField label={t("labels.lowStockThreshold")}>
          <Input
            type="number"
            value={draft.lowStockThreshold}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                lowStockThreshold: event.target.value,
              }))
            }
          />
        </AppField>
        <AppField label={t("labels.defaultProductStatus")}>
          <Select
            value={draft.defaultProductStatus}
            onValueChange={(value) =>
              setDraft((current) => ({
                ...current,
                defaultProductStatus: value as ProductStatus,
              }))
            }
          >
            <SelectTrigger>
              <SelectValue placeholder={t("labels.defaultProductStatus")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">{dynamicLabel(t, "draft")}</SelectItem>
              <SelectItem value="active">{dynamicLabel(t, "active")}</SelectItem>
              <SelectItem value="archived">
                {dynamicLabel(t, "archived")}
              </SelectItem>
            </SelectContent>
          </Select>
        </AppField>
        <AppField label={t("labels.defaultMarkup")}>
          <Input
            type="number"
            value={draft.defaultMarkupPercent}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                defaultMarkupPercent: event.target.value,
              }))
            }
          />
        </AppField>
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit">
            {t("common.save")}
          </Button>
        </div>
      </form>
    </ModuleSection>
  );
}

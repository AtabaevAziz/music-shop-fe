"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { Field } from "@/components/ui/primitives";
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
        className="form-grid"
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
        <Field label={t("labels.currency")}>
          <input
            value={draft.currency}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                currency: event.target.value,
              }))
            }
          />
        </Field>
        <Field label={t("labels.lowStockThreshold")}>
          <input
            type="number"
            value={draft.lowStockThreshold}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                lowStockThreshold: event.target.value,
              }))
            }
          />
        </Field>
        <Field label={t("labels.defaultProductStatus")}>
          <select
            value={draft.defaultProductStatus}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                defaultProductStatus: event.target.value as ProductStatus,
              }))
            }
          >
            <option value="draft">{dynamicLabel(t, "draft")}</option>
            <option value="active">{dynamicLabel(t, "active")}</option>
            <option value="archived">{dynamicLabel(t, "archived")}</option>
          </select>
        </Field>
        <Field label={t("labels.defaultMarkup")}>
          <input
            type="number"
            value={draft.defaultMarkupPercent}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                defaultMarkupPercent: event.target.value,
              }))
            }
          />
        </Field>
        <div className="stack-row form-actions">
          <button className="button" type="submit">
            {t("common.save")}
          </button>
        </div>
      </form>
    </ModuleSection>
  );
}

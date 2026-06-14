"use client";

import { useState } from "react";

import { Field } from "@/components/ui/primitives";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
import { ModuleSection } from "@/shared/components/module-shell";
import { useMusicStore } from "@/store/music-store";
import { ProductStatus } from "@/types/music";

type SettingsDraft = {
  currency: string;
  lowStockThreshold: string;
  defaultProductStatus: ProductStatus;
  defaultMarkupPercent: string;
};

export function SettingsModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, saveSettings } = useMusicStore();
  const [draft, setDraft] = useState<SettingsDraft>({
    currency: db.settings.currency,
    lowStockThreshold: String(db.settings.lowStockThreshold),
    defaultProductStatus: db.settings.defaultProductStatus,
    defaultMarkupPercent: String(db.settings.defaultMarkupPercent),
  });

  return (
    <ModuleSection
      title={dict.settings}
      subtitle={dict.settingsSubtitle}
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
        <Field label={dict.currencyLabel}>
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
        <Field label={dict.lowStockThresholdLabel}>
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
        <Field label={dict.defaultProductStatusLabel}>
          <select
            value={draft.defaultProductStatus}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                defaultProductStatus: event.target.value as ProductStatus,
              }))
            }
          >
            <option value="draft">
              {translateDynamicLabel(locale, "draft")}
            </option>
            <option value="active">
              {translateDynamicLabel(locale, "active")}
            </option>
            <option value="archived">
              {translateDynamicLabel(locale, "archived")}
            </option>
          </select>
        </Field>
        <Field label={dict.defaultMarkupLabel}>
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
            {dict.save}
          </button>
        </div>
      </form>
    </ModuleSection>
  );
}

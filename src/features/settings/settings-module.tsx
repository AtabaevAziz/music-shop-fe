"use client";

import { useState } from "react";

import { Field, PageHeader } from "@/components/ui/primitives";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
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
    <section className="table-card">
      <PageHeader
        title={dict.settings}
        subtitle="Settings-driven behavior for pricing and inventory control."
      />
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
        <Field label="Currency">
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
        <Field label="Low stock threshold">
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
        <Field label="Default product status">
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
        <Field label="Default markup %">
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
        <div className="stack-row" style={{ gridColumn: "1 / -1" }}>
          <button className="button" type="submit">
            {dict.save}
          </button>
        </div>
      </form>
    </section>
  );
}

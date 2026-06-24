"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { AppField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { dynamicLabel } from "@/lib/translations";
import { ModuleSection } from "@/shared/components/module-shell";
import { useSettingsStore } from "@/store/music-store";
import { ProductStatus } from "@/types/music";

type SettingsDraft = {
  currency: string;
  lowStockThreshold: string;
  defaultProductStatus: ProductStatus;
  defaultMarkupPercent: string;
};

export function SettingsModule() {
  const t = useTranslations();
  const { settings, saveSettings } = useSettingsStore();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [draft, setDraft] = useState<SettingsDraft>({
    currency: settings.currency,
    lowStockThreshold: String(settings.lowStockThreshold),
    defaultProductStatus: settings.defaultProductStatus,
    defaultMarkupPercent: String(settings.defaultMarkupPercent),
  });

  return (
    <ModuleSection
      title={t("nav.settings")}
      subtitle={t("section.settingsSubtitle")}
    >
      {formError ? <div className="error">{formError}</div> : null}
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          setFormError("");
          setIsSaving(true);
          try {
            await saveSettings({
              currency: draft.currency,
              lowStockThreshold: Number(draft.lowStockThreshold),
              defaultProductStatus: draft.defaultProductStatus as
                | "draft"
                | "active"
                | "archived",
              defaultMarkupPercent: Number(draft.defaultMarkupPercent),
            });
          } catch (error) {
            setFormError(
              error instanceof Error
                ? error.message
                : t("common.unexpectedError"),
            );
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <AppField label={t("labels.currency")}>
          <Input
            value={draft.currency}
            disabled={isSaving}
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
            disabled={isSaving}
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
            disabled={isSaving}
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
              <SelectItem value="active">
                {dynamicLabel(t, "active")}
              </SelectItem>
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
            disabled={isSaving}
            onChange={(event) =>
              setDraft((current) => ({
                ...current,
                defaultMarkupPercent: event.target.value,
              }))
            }
          />
        </AppField>
        <div className="flex gap-2 md:col-span-2">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? t("common.saving") : t("common.save")}
          </Button>
        </div>
      </form>
    </ModuleSection>
  );
}

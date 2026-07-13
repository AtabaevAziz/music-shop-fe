"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

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
import { useSettingsQuery } from "@/hooks/use-settings-query";
import { invalidateAppQueries } from "@/lib/query-utils";
import { getDictionaryValues } from "@/lib/runtime-config";
import { dynamicLabel } from "@/lib/translations";
import { updateSettings } from "@/services/settings";
import { ModuleSection } from "@/shared/components/module-shell";
import { ProductStatus } from "@/types/music";

type SettingsDraft = {
  currency: string;
  lowStockThreshold: string;
  defaultProductStatus: ProductStatus;
  defaultMarkupPercent: string;
};

export function SettingsModule() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data, isPending } = useSettingsQuery();
  const [formError, setFormError] = useState("");
  const [draft, setDraft] = useState<SettingsDraft>({
    currency: "",
    lowStockThreshold: "",
    defaultProductStatus: "draft",
    defaultMarkupPercent: "",
  });
  const saveMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });

  useEffect(() => {
    if (!data?.settings) {
      return;
    }

    setDraft({
      currency: data.settings.currency,
      lowStockThreshold: String(data.settings.lowStockThreshold),
      defaultProductStatus: data.settings.defaultProductStatus,
      defaultMarkupPercent: String(data.settings.defaultMarkupPercent),
    });
  }, [data?.settings]);

  if (isPending || !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  const isSaving = saveMutation.isPending;
  const productStatuses = getDictionaryValues<ProductStatus>(
    data.dictionaries.productStatuses,
    ["draft", "active", "archived"] as const,
  );

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
          try {
            await saveMutation.mutateAsync({
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
              {productStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {dynamicLabel(t, status)}
                </SelectItem>
              ))}
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

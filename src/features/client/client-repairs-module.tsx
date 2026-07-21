"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { z } from "zod";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useClientRepairsQuery } from "@/hooks/use-repairs-query";
import { Locale } from "@/i18n";
import { requiredTrimmedString } from "@/lib/form-utils";
import { invalidateAppQueries } from "@/lib/query-utils";
import { dynamicLabel } from "@/lib/translations";
import { getIntlLocale } from "@/lib/utils";
import { createClientRepair } from "@/services/client";

const repairSchema = z.object({
  instrumentName: requiredTrimmedString(2),
  brand: requiredTrimmedString(2),
  issue: requiredTrimmedString(8),
  notes: requiredTrimmedString(4),
});

type RepairDraft = {
  instrumentName: string;
  brand: string;
  issue: string;
  notes: string;
};

const initialDraft: RepairDraft = {
  instrumentName: "",
  brand: "",
  issue: "",
  notes: "",
};

export function ClientRepairsModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data, isPending } = useClientRepairsQuery();
  const [draft, setDraft] = useState<RepairDraft>(initialDraft);
  const [formError, setFormError] = useState("");
  const createMutation = useMutation({
    mutationFn: createClientRepair,
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });

  if (isPending || !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  async function submit() {
    const parsed = repairSchema.safeParse(draft);
    if (!parsed.success) {
      setFormError(t("labels.validationFailed"));
      return;
    }

    try {
      await createMutation.mutateAsync(parsed.data);
      setDraft(initialDraft);
      setFormError("");
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t("common.unexpectedError"),
      );
    }
  }

  return (
    <div className="two-columns">
      <section className="table-card space-y-4">
        <PageHeader
          title={t("labels.requestRepair")}
          subtitle={t("section.repairsSubtitle")}
        />
        {formError ? <div className="error">{formError}</div> : null}
        <div className="space-y-4">
          <div className="space-y-2">
            <label
              className="text-sm font-medium"
              htmlFor="repair-instrument-name"
            >
              {t("labels.instrumentName")}
            </label>
            <Input
              id="repair-instrument-name"
              value={draft.instrumentName}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  instrumentName: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="repair-brand">
              {t("labels.brand")}
            </label>
            <Input
              id="repair-brand"
              value={draft.brand}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  brand: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="repair-issue">
              {t("labels.repairIssue")}
            </label>
            <Textarea
              id="repair-issue"
              rows={5}
              value={draft.issue}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  issue: event.target.value,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium" htmlFor="repair-notes">
              {t("labels.notes")}
            </label>
            <Textarea
              id="repair-notes"
              rows={4}
              value={draft.notes}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  notes: event.target.value,
                }))
              }
            />
          </div>
          <Button
            type="button"
            disabled={createMutation.isPending}
            onClick={() => void submit()}
          >
            {createMutation.isPending
              ? t("common.saving")
              : t("labels.requestRepair")}
          </Button>
        </div>
      </section>

      <section className="table-card space-y-4">
        <PageHeader
          title={t("labels.latestRepairs")}
          subtitle={t("section.clientRepairsHistorySubtitle")}
        />
        <div className="list-clean">
          {data.repairRequests.map((request) => (
            <Card key={request.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <strong>{request.instrumentName}</strong>
                    <div className="muted">
                      {request.brand} · {request.id}
                    </div>
                  </div>
                  <Badge
                    variant={
                      request.status === "completed"
                        ? "success"
                        : request.status === "cancelled"
                          ? "destructive"
                          : request.status === "ready"
                            ? "warning"
                            : "secondary"
                    }
                  >
                    {dynamicLabel(t, request.status)}
                  </Badge>
                </div>
                <div>{request.issue}</div>
                <div className="muted">{request.notes}</div>
                <div className="muted">
                  {new Date(request.updatedAt).toLocaleString(
                    getIntlLocale(locale),
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {data.repairRequests.length === 0 ? (
            <div className="empty-state">{t("common.noData")}</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

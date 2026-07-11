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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCustomersQuery } from "@/hooks/use-customers-query";
import { useStaffRepairsQuery } from "@/hooks/use-repairs-query";
import { Locale } from "@/i18n";
import { invalidateAppQueries } from "@/lib/query-utils";
import { dynamicLabel } from "@/lib/translations";
import { createRepair } from "@/services/repairs";

const repairSchema = z.object({
  customerId: z.string().min(1),
  instrumentName: z.string().min(2),
  brand: z.string().min(2),
  issue: z.string().min(8),
  notes: z.string().min(4),
});

type RepairDraft = {
  customerId: string;
  instrumentName: string;
  brand: string;
  issue: string;
  notes: string;
};

const initialDraft: RepairDraft = {
  customerId: "",
  instrumentName: "",
  brand: "",
  issue: "",
  notes: "",
};

export function StaffRepairsModule({ locale = "ru" }: { locale?: Locale }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data: repairsData, isPending } = useStaffRepairsQuery();
  const { data: customersData } = useCustomersQuery();
  const [draft, setDraft] = useState<RepairDraft>(initialDraft);
  const [formError, setFormError] = useState("");
  const createMutation = useMutation({
    mutationFn: createRepair,
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });

  if (isPending || !repairsData) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  const customers = customersData?.customers ?? [];

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
            <label className="text-sm font-medium">{t("labels.customer")}</label>
            <Select
              value={draft.customerId}
              onValueChange={(value) =>
                setDraft((current) => ({ ...current, customerId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder={t("common.select")} />
              </SelectTrigger>
              <SelectContent>
                {customers.map((customer) => (
                  <SelectItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t("labels.instrumentName")}</label>
            <Input
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
            <label className="text-sm font-medium">{t("labels.brand")}</label>
            <Input
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
            <label className="text-sm font-medium">{t("labels.repairIssue")}</label>
            <Textarea
              rows={4}
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
            <label className="text-sm font-medium">{t("labels.notes")}</label>
            <Textarea
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
          subtitle={t("section.repairsSubtitle")}
        />
        <div className="list-clean">
          {repairsData.repairRequests.map((request) => {
            const customer = customers.find(
              (entry) => entry.id === request.customerId,
            );
            return (
              <Card key={request.id}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <strong>{request.instrumentName}</strong>
                      <div className="muted">
                        {customer?.name ?? request.customerId} · {request.id}
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
                      locale === "en" ? "en-US" : locale === "uz" ? "uz-UZ" : "ru-RU",
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {repairsData.repairRequests.length === 0 ? (
            <div className="empty-state">{t("common.noData")}</div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

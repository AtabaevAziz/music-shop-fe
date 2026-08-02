"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pen } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { z } from "zod";

import { AppField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCustomersQuery } from "@/hooks/use-customers-query";
import { useAdminRepairsQuery } from "@/hooks/use-repairs-query";
import { Locale } from "@/i18n";
import {
  normalizeOptionalString,
  optionalTrimmedUrl,
  requiredTrimmedString,
} from "@/lib/form-utils";
import { invalidateAppQueries } from "@/lib/query-utils";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, getIntlLocale } from "@/lib/utils";
import { createRepair, updateRepair } from "@/services/repairs";
import type { RepairStatus } from "@/types/music";

const repairStatuses = [
  "new",
  "diagnostics",
  "in_progress",
  "ready",
  "completed",
  "cancelled",
] as const satisfies readonly RepairStatus[];

const repairSchema = z.object({
  customerId: z.string().min(1),
  instrumentName: requiredTrimmedString(2),
  brand: requiredTrimmedString(2),
  issue: requiredTrimmedString(8),
  notes: requiredTrimmedString(4),
  status: z.enum(repairStatuses),
  estimatedCost: z.string().optional(),
  assignedMasterName: z.string().optional(),
  receivedAt: z.string().optional(),
  photoUrl: optionalTrimmedUrl(),
});

type RepairDraft = {
  id?: string;
  customerId: string;
  instrumentName: string;
  brand: string;
  issue: string;
  notes: string;
  status: RepairStatus;
  estimatedCost: string;
  assignedMasterName: string;
  receivedAt: string;
  photoUrl: string;
};

const initialDraft: RepairDraft = {
  customerId: "",
  instrumentName: "",
  brand: "",
  issue: "",
  notes: "",
  status: "new",
  estimatedCost: "",
  assignedMasterName: "",
  receivedAt: "",
  photoUrl: "",
};

export function AdminRepairsModule({ locale = "ru" }: { locale?: Locale }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data: repairsData, isPending } = useAdminRepairsQuery();
  const { data: customersData } = useCustomersQuery();
  const [draft, setDraft] = useState<RepairDraft>(initialDraft);
  const [formError, setFormError] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const customers = customersData?.customers ?? [];
  const customerMap = useMemo(
    () =>
      Object.fromEntries(
        (customersData?.customers ?? []).map((customer) => [
          customer.id,
          customer.fullName ?? customer.name,
        ]),
      ),
    [customersData?.customers],
  );
  const saveMutation = useMutation({
    mutationFn: async (value: RepairDraft) => {
      const parsed = repairSchema.parse(value);
      const normalizedEstimatedCost = normalizeOptionalString(
        parsed.estimatedCost,
      );
      const payload = {
        customerId: parsed.customerId,
        instrumentName: parsed.instrumentName,
        brand: parsed.brand,
        issue: parsed.issue,
        notes: parsed.notes,
        status: parsed.status,
        estimatedCost: normalizedEstimatedCost
          ? Number(normalizedEstimatedCost)
          : undefined,
        assignedMasterName: normalizeOptionalString(parsed.assignedMasterName),
        receivedAt: normalizeOptionalString(parsed.receivedAt),
        photoUrl: normalizeOptionalString(parsed.photoUrl),
      };

      if (value.id) {
        await updateRepair(value.id, payload);
        return;
      }

      await createRepair(payload);
    },
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

  async function submit() {
    const parsed = repairSchema.safeParse(draft);
    if (!parsed.success) {
      setFormError(t("labels.validationFailed"));
      return;
    }

    try {
      await saveMutation.mutateAsync(draft);
      setDraft(initialDraft);
      setFormError("");
      setIsEditorOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t("common.unexpectedError"),
      );
    }
  }

  return (
    <>
      <section className="table-card">
        <PageHeader
          title={t("nav.repairs")}
          subtitle={t("section.repairsSubtitle")}
          actions={
            <Button
              type="button"
              onClick={() => {
                setDraft(initialDraft);
                setFormError("");
                setIsEditorOpen(true);
              }}
            >
              {t("common.addNew")}
            </Button>
          }
        />
        <div className="responsive-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("labels.requestNumber")}</TableHead>
                <TableHead>{t("labels.customer")}</TableHead>
                <TableHead>{t("labels.instrumentName")}</TableHead>
                <TableHead>{t("labels.repairIssue")}</TableHead>
                <TableHead>{t("labels.estimatedCost")}</TableHead>
                <TableHead>{t("labels.receivedDate")}</TableHead>
                <TableHead>{t("labels.master")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {repairsData.repairRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>
                    {customerMap[request.customerId] ?? request.customerId}
                  </TableCell>
                  <TableCell>{request.instrumentName}</TableCell>
                  <TableCell>{request.issue}</TableCell>
                  <TableCell>
                    {typeof request.estimatedCost === "number"
                      ? formatMoney(request.estimatedCost, "UZS", locale)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {new Date(
                      request.receivedAt ??
                        request.createdAt ??
                        request.updatedAt,
                    ).toLocaleDateString(getIntlLocale(locale))}
                  </TableCell>
                  <TableCell>{request.assignedMasterName ?? "-"}</TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setDraft({
                          id: request.id,
                          customerId: request.customerId,
                          instrumentName: request.instrumentName,
                          brand: request.brand,
                          issue: request.issue,
                          notes: request.notes,
                          status: request.status,
                          estimatedCost: String(request.estimatedCost ?? ""),
                          assignedMasterName: request.assignedMasterName ?? "",
                          receivedAt:
                            (request.receivedAt ?? request.createdAt)?.slice(
                              0,
                              10,
                            ) ?? "",
                          photoUrl: request.photoUrl ?? "",
                        });
                        setFormError("");
                        setIsEditorOpen(true);
                      }}
                    >
                      <Pen />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? t("common.edit") : t("labels.requestRepair")}
            </DialogTitle>
            <DialogDescription>
              {t("section.repairsSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {formError ? <div className="error">{formError}</div> : null}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <AppField label={t("labels.customer")}>
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
                      {customer.fullName ?? customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AppField>
            <AppField label={t("labels.instrumentName")}>
              <Input
                value={draft.instrumentName}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    instrumentName: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("labels.brand")}>
              <Input
                value={draft.brand}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    brand: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("common.status")}>
              <Select
                value={draft.status}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    status: value as RepairStatus,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {repairStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {dynamicLabel(t, status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AppField>
            <AppField label={t("labels.estimatedCost")}>
              <Input
                type="number"
                value={draft.estimatedCost}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    estimatedCost: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("labels.receivedDate")}>
              <Input
                type="date"
                value={draft.receivedAt}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    receivedAt: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("labels.master")}>
              <Input
                value={draft.assignedMasterName}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    assignedMasterName: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("labels.photoUrlOptional")}>
              <Input
                value={draft.photoUrl}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    photoUrl: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("labels.repairIssue")} className="md:col-span-2">
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
            </AppField>
            <AppField label={t("labels.notes")} className="md:col-span-2">
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
            </AppField>
            {draft.photoUrl ? (
              <div className="md:col-span-2">
                <a
                  href={draft.photoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm text-primary underline-offset-4 hover:underline"
                >
                  {t("labels.openPhoto")}
                </a>
              </div>
            ) : null}
            <DialogFooter className="md:col-span-2">
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? t("common.saving") : t("common.save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={saveMutation.isPending}
                onClick={() => {
                  setIsEditorOpen(false);
                  setDraft(initialDraft);
                  setFormError("");
                }}
              >
                {t("common.cancel")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

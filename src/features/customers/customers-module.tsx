"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GenericCrudModule } from "@/features/shared/generic-crud";
import { useCustomersQuery } from "@/hooks/use-customers-query";
import { normalizeEmail, normalizeRequiredString } from "@/lib/form-utils";
import { invalidateAppQueries } from "@/lib/query-utils";
import { getDictionarySelectOptions } from "@/lib/runtime-config";
import { dynamicLabel } from "@/lib/translations";
import { getIntlLocale } from "@/lib/utils";
import {
  createCustomer,
  deleteCustomer,
  updateCustomer,
} from "@/services/customers";
import { Customer } from "@/types/music";

type CustomerDraft = {
  id?: string;
  name: string;
  phone: string;
  email: string;
  tier: Customer["tier"];
  status: Customer["status"];
  notes: string;
  ordersCount: string;
  repairsCount: string;
  registeredAt: string;
  profile: string;
};

type CustomerSummary = Customer & {
  ordersCount: number;
  repairsCount: number;
  registeredAt?: string;
};

export function CustomersModule() {
  const t = useTranslations();
  const locale = useLocale();
  const queryClient = useQueryClient();
  const { data, isPending } = useCustomersQuery();
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null,
  );
  const tierOptions = getDictionarySelectOptions(
    t,
    data?.dictionaries.customerTiers,
    ["standard", "studio", "vip"] as const,
  );
  const customerSummaries = useMemo<CustomerSummary[]>(() => {
    const customers = data?.customers ?? [];
    const orders = data?.orders ?? [];
    const repairs = data?.repairs ?? [];

    return customers.map((customer) => {
      const customerOrders = orders.filter(
        (order) => order.customerId === customer.id,
      );
      const customerRepairs = repairs.filter(
        (repair) => repair.customerId === customer.id,
      );
      const registrationCandidate = [
        customer.registeredAt,
        ...customerOrders.map((order) => order.createdAt),
        ...customerRepairs.map(
          (repair) => repair.receivedAt ?? repair.createdAt ?? repair.updatedAt,
        ),
      ]
        .filter(Boolean)
        .sort()[0];

      return {
        ...customer,
        ordersCount: customer.ordersCount ?? customerOrders.length,
        repairsCount: customer.repairsCount ?? customerRepairs.length,
        registeredAt: registrationCandidate,
      };
    });
  }, [data?.customers, data?.orders, data?.repairs]);
  const selectedCustomer =
    customerSummaries.find((customer) => customer.id === selectedCustomerId) ??
    null;
  const selectedCustomerOrders = useMemo(
    () =>
      (data?.orders ?? []).filter(
        (order) => order.customerId === selectedCustomerId,
      ),
    [data?.orders, selectedCustomerId],
  );
  const selectedCustomerRepairs = useMemo(
    () =>
      (data?.repairs ?? []).filter(
        (repair) => repair.customerId === selectedCustomerId,
      ),
    [data?.repairs, selectedCustomerId],
  );
  const saveMutation = useMutation({
    mutationFn: async (draft: CustomerDraft) => {
      const payload = {
        name: normalizeRequiredString(draft.name),
        fullName: normalizeRequiredString(draft.name),
        phone: normalizeRequiredString(draft.phone),
        email: normalizeEmail(draft.email),
        tier: draft.tier,
        status: draft.status,
        notes: normalizeRequiredString(draft.notes),
      };

      if (draft.id) {
        await updateCustomer(draft.id, payload);
        return;
      }

      await createCustomer(payload);
    },
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });

  if (isPending && !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  return (
    <>
      <GenericCrudModule<CustomerSummary, CustomerDraft>
        title={t("nav.customers")}
        subtitle={t("section.customersSubtitle")}
        items={customerSummaries}
        createDraft={() => ({
          name: "",
          phone: "",
          email: "",
          tier: (tierOptions[0]?.value as Customer["tier"]) ?? "standard",
          status: "active",
          notes: "",
          ordersCount: "0",
          repairsCount: "0",
          registeredAt: "",
          profile: "",
        })}
        validateDraft={(draft) =>
          draft.name.trim().length < 2 ||
          draft.phone.trim().length < 6 ||
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email.trim())
            ? t("labels.validationFailed")
            : null
        }
        toDraft={(customer) => ({
          id: customer.id,
          name: customer.fullName ?? customer.name,
          phone: customer.phone,
          email: customer.email,
          tier: customer.tier,
          status: customer.status,
          notes: customer.notes,
          ordersCount: String(customer.ordersCount),
          repairsCount: String(customer.repairsCount),
          registeredAt: customer.registeredAt ?? "",
          profile: "",
        })}
        getSearchText={(customer) =>
          `${customer.fullName ?? customer.name} ${customer.phone} ${customer.email} ${customer.tier}`.toLowerCase()
        }
        fields={[
          { name: "name", label: t("labels.name") },
          { name: "phone", label: t("labels.phone"), type: "tel" },
          { name: "email", label: t("labels.email"), type: "email" },
          {
            name: "ordersCount",
            label: t("labels.ordersCount"),
            inForm: false,
            formatValue: (_, customer) => customer.ordersCount,
          },
          {
            name: "repairsCount",
            label: t("labels.repairRequestsCount"),
            inForm: false,
            formatValue: (_, customer) => customer.repairsCount,
          },
          {
            name: "registeredAt",
            label: t("labels.registrationDate"),
            inForm: false,
            formatValue: (_, customer) =>
              customer.registeredAt
                ? new Date(customer.registeredAt).toLocaleDateString(
                    getIntlLocale(locale as "en" | "ru" | "uz"),
                  )
                : "-",
          },
          {
            name: "profile",
            label: t("common.details"),
            inForm: false,
            formatValue: (_, customer) => (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectedCustomerId(customer.id)}
              >
                {t("common.details")}
              </Button>
            ),
          },
          {
            name: "tier",
            label: t("labels.tier"),
            type: "select",
            options: tierOptions,
            inTable: false,
          },
          {
            name: "status",
            label: t("common.status"),
            type: "select",
            options: [
              { label: dynamicLabel(t, "active"), value: "active" },
              { label: dynamicLabel(t, "inactive"), value: "inactive" },
            ],
            inTable: false,
          },
          {
            name: "notes",
            label: t("labels.notes"),
            type: "textarea",
            inTable: false,
          },
        ]}
        onSave={(draft) => saveMutation.mutateAsync(draft)}
        onDelete={(id) => deleteMutation.mutateAsync(id)}
      />

      <Dialog
        open={Boolean(selectedCustomerId)}
        onOpenChange={(open) => !open && setSelectedCustomerId(null)}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t("labels.customerProfile")}</DialogTitle>
            <DialogDescription>
              {selectedCustomer?.fullName ?? selectedCustomer?.name ?? ""}
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer ? (
            <div className="list-clean">
              <div className="detail-grid">
                <Card>
                  <CardContent className="space-y-2 p-5">
                    <div className="muted">{t("labels.phone")}</div>
                    <strong>{selectedCustomer.phone}</strong>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-2 p-5">
                    <div className="muted">{t("labels.email")}</div>
                    <strong>{selectedCustomer.email}</strong>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-2 p-5">
                    <div className="muted">{t("labels.ordersCount")}</div>
                    <strong>{selectedCustomer.ordersCount}</strong>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="space-y-2 p-5">
                    <div className="muted">
                      {t("labels.repairRequestsCount")}
                    </div>
                    <strong>{selectedCustomer.repairsCount}</strong>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="space-y-3 p-5">
                  <strong>{t("labels.latestOrders")}</strong>
                  {selectedCustomerOrders.length ? (
                    <div className="list-clean">
                      {selectedCustomerOrders.slice(0, 5).map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <span>{order.id}</span>
                          <span className="muted">
                            {new Date(order.createdAt).toLocaleDateString(
                              getIntlLocale(locale as "en" | "ru" | "uz"),
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">{t("common.noData")}</div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3 p-5">
                  <strong>{t("labels.latestRepairs")}</strong>
                  {selectedCustomerRepairs.length ? (
                    <div className="list-clean">
                      {selectedCustomerRepairs.slice(0, 5).map((repair) => (
                        <div
                          key={repair.id}
                          className="flex items-center justify-between gap-3"
                        >
                          <span>{repair.instrumentName}</span>
                          <span className="muted">
                            {dynamicLabel(t, repair.status)}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">{t("common.noData")}</div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

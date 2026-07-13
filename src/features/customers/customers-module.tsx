"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { useCustomersQuery } from "@/hooks/use-customers-query";
import { invalidateAppQueries } from "@/lib/query-utils";
import { getDictionarySelectOptions } from "@/lib/runtime-config";
import { dynamicLabel } from "@/lib/translations";
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
};

export function CustomersModule() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data, isPending } = useCustomersQuery();
  const customers = data?.customers ?? [];
  const tierOptions = getDictionarySelectOptions(
    t,
    data?.dictionaries.customerTiers,
    ["standard", "studio", "vip"] as const,
  );
  const saveMutation = useMutation({
    mutationFn: async (draft: CustomerDraft) => {
      const payload = {
        name: draft.name,
        phone: draft.phone,
        email: draft.email,
        tier: draft.tier,
        status: draft.status,
        notes: draft.notes,
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
    <GenericCrudModule<Customer, CustomerDraft>
      title={t("nav.customers")}
      subtitle={t("section.customersSubtitle")}
      items={customers}
      createDraft={() => ({
        name: "",
        phone: "",
        email: "",
        tier: (tierOptions[0]?.value as Customer["tier"]) ?? "standard",
        status: "active",
        notes: "",
      })}
      validateDraft={(draft) =>
        draft.name.trim().length < 2 ||
        draft.phone.trim().length < 6 ||
        draft.email.trim().length < 5
          ? t("labels.validationFailed")
          : null
      }
      toDraft={(customer) => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        tier: customer.tier,
        status: customer.status,
        notes: customer.notes,
      })}
      getSearchText={(customer) =>
        `${customer.name} ${customer.phone} ${customer.email} ${customer.tier}`.toLowerCase()
      }
      fields={[
        { name: "name", label: t("labels.name") },
        { name: "phone", label: t("labels.phone"), type: "tel" },
        { name: "email", label: t("labels.email"), type: "email" },
        {
          name: "tier",
          label: t("labels.tier"),
          type: "select",
          options: tierOptions,
        },
        {
          name: "status",
          label: t("common.status"),
          type: "select",
          options: [
            { label: dynamicLabel(t, "active"), value: "active" },
            { label: dynamicLabel(t, "inactive"), value: "inactive" },
          ],
        },
        { name: "notes", label: t("labels.notes"), type: "textarea" },
      ]}
      onSave={(draft) => saveMutation.mutateAsync(draft)}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
    />
  );
}

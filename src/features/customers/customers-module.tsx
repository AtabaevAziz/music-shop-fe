"use client";

import { useTranslations } from "next-intl";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { dynamicLabel } from "@/lib/translations";
import { useCustomerStore } from "@/store/music-store";
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
  const { customers, saveCustomer, deleteEntity } = useCustomerStore();

  return (
    <GenericCrudModule<Customer, CustomerDraft>
      title={t("nav.customers")}
      subtitle={t("section.customersSubtitle")}
      items={customers}
      createDraft={() => ({
        name: "",
        phone: "",
        email: "",
        tier: "standard",
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
          options: [
            { label: dynamicLabel(t, "standard"), value: "standard" },
            { label: dynamicLabel(t, "studio"), value: "studio" },
            { label: dynamicLabel(t, "vip"), value: "vip" },
          ],
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
      onSave={(draft) =>
        saveCustomer({
          id: draft.id,
          name: draft.name,
          phone: draft.phone,
          email: draft.email,
          tier: draft.tier,
          status: draft.status,
          notes: draft.notes,
        })
      }
      onDelete={(id) => deleteEntity("customers", id)}
    />
  );
}

"use client";

import { GenericCrudModule } from "@/modules/generic-crud";
import { useMusicStore } from "@/data/store";
import { Locale } from "@/lib/i18n";

export function CustomersModule({ locale }: { locale: Locale }) {
  const { db, saveCustomer, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule
      locale={locale}
      title="Customers"
      subtitle="Internal customer records with order-facing visibility."
      items={db.customers}
      fields={[
        { name: "name", label: "Name" },
        { name: "phone", label: "Phone" },
        { name: "email", label: "Email" },
        {
          name: "tier",
          label: "Tier",
          type: "select",
          options: [
            { label: "standard", value: "standard" },
            { label: "studio", value: "studio" },
            { label: "vip", value: "vip" },
          ],
        },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "active", value: "active" },
            { label: "inactive", value: "inactive" },
          ],
        },
        { name: "notes", label: "Notes", type: "textarea" },
      ]}
      onSave={(draft) =>
        saveCustomer({
          id: draft.id,
          name: draft.name ?? "",
          phone: draft.phone ?? "",
          email: draft.email ?? "",
          tier: (draft.tier as "standard" | "studio" | "vip") ?? "standard",
          status: (draft.status as "active" | "inactive") ?? "active",
          notes: draft.notes ?? "",
        })
      }
      onDelete={(id) => deleteEntity("customers", id)}
    />
  );
}

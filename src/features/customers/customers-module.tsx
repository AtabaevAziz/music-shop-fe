"use client";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
import { useMusicStore } from "@/store/music-store";

export function CustomersModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, saveCustomer, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule
      locale={locale}
      title={dict.customers}
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
            {
              label: translateDynamicLabel(locale, "standard"),
              value: "standard",
            },
            { label: translateDynamicLabel(locale, "studio"), value: "studio" },
            { label: translateDynamicLabel(locale, "vip"), value: "vip" },
          ],
        },
        {
          name: "status",
          label: dict.status,
          type: "select",
          options: [
            { label: translateDynamicLabel(locale, "active"), value: "active" },
            {
              label: translateDynamicLabel(locale, "inactive"),
              value: "inactive",
            },
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

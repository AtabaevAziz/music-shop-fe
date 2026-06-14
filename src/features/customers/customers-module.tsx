"use client";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
import { useMusicStore } from "@/store/music-store";
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

export function CustomersModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, saveCustomer, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule<Customer, CustomerDraft>
      locale={locale}
      title={dict.customers}
      subtitle={dict.customersSubtitle}
      items={db.customers}
      createDraft={() => ({
        name: "",
        phone: "",
        email: "",
        tier: "standard",
        status: "active",
        notes: "",
      })}
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
        { name: "name", label: dict.nameLabel },
        { name: "phone", label: dict.phoneLabel, type: "tel" },
        { name: "email", label: dict.emailLabel, type: "email" },
        {
          name: "tier",
          label: dict.tierLabel,
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
        { name: "notes", label: dict.notesLabel, type: "textarea" },
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

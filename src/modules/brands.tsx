"use client";

import { GenericCrudModule } from "@/modules/generic-crud";
import { useMusicStore } from "@/data/store";
import { Locale } from "@/lib/i18n";

export function BrandsModule({ locale }: { locale: Locale }) {
  const { db, saveBrand, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule
      locale={locale}
      title="Brands"
      subtitle="Reusable vendor and manufacturer records."
      items={db.brands}
      fields={[
        { name: "name", label: "Name" },
        { name: "country", label: "Country" },
        { name: "website", label: "Website" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "active", value: "active" },
            { label: "inactive", value: "inactive" },
          ],
        },
      ]}
      onSave={(draft) =>
        saveBrand({
          id: draft.id,
          name: draft.name ?? "",
          country: draft.country ?? "",
          website: draft.website ?? "",
          status: (draft.status as "active" | "inactive") ?? "active",
        })
      }
      onDelete={(id) => deleteEntity("brands", id)}
    />
  );
}

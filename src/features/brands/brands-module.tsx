"use client";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { useMusicStore } from "@/store/music-store";
import { getDictionary, Locale, translateDynamicLabel } from "@/lib/i18n";

export function BrandsModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, saveBrand, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule
      locale={locale}
      title={dict.brands}
      subtitle="Reusable vendor and manufacturer records."
      items={db.brands}
      fields={[
        { name: "name", label: "Name" },
        { name: "country", label: "Country" },
        { name: "website", label: "Website" },
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

"use client";

import { GenericCrudModule } from "@/modules/generic-crud";
import { useMusicStore } from "@/data/store";
import { Locale } from "@/lib/i18n";

export function CategoriesModule({ locale }: { locale: Locale }) {
  const { db, saveCategory, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule
      locale={locale}
      title="Categories"
      subtitle="Structured product taxonomy for the music retail catalog."
      items={db.categories}
      fields={[
        { name: "name", label: "Name" },
        { name: "slug", label: "Slug" },
        { name: "parentId", label: "Parent" },
        {
          name: "status",
          label: "Status",
          type: "select",
          options: [
            { label: "active", value: "active" },
            { label: "inactive", value: "inactive" },
          ],
        },
        { name: "description", label: "Description", type: "textarea" },
      ]}
      onSave={(draft) =>
        saveCategory({
          id: draft.id,
          name: draft.name ?? "",
          parentId: draft.parentId ?? "",
          status: (draft.status as "active" | "inactive") ?? "active",
          description: draft.description ?? "",
        })
      }
      onDelete={(id) => deleteEntity("categories", id)}
    />
  );
}

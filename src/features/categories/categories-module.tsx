"use client";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
import { useMusicStore } from "@/store/music-store";

export function CategoriesModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, saveCategory, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule
      locale={locale}
      title={dict.categories}
      subtitle="Structured product taxonomy for the music retail catalog."
      items={db.categories}
      fields={[
        { name: "name", label: "Name" },
        { name: "slug", label: "Slug" },
        { name: "parentId", label: "Parent" },
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

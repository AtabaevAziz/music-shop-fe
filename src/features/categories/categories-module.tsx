"use client";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
import { useMusicStore } from "@/store/music-store";
import { Category } from "@/types/music";

type CategoryDraft = {
  id?: string;
  name: string;
  slug?: string;
  parentId: string;
  status: Category["status"];
  description: string;
};

export function CategoriesModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, saveCategory, deleteEntity } = useMusicStore();
  const categoryNameMap = Object.fromEntries(
    db.categories.map((category) => [category.id, category.name]),
  );

  return (
    <GenericCrudModule<Category, CategoryDraft>
      locale={locale}
      title={dict.categories}
      subtitle={dict.categoriesSubtitle}
      items={db.categories}
      createDraft={() => ({
        name: "",
        slug: "",
        parentId: "",
        status: "active",
        description: "",
      })}
      toDraft={(category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId ?? "",
        status: category.status,
        description: category.description,
      })}
      getSearchText={(category) =>
        `${category.name} ${category.slug} ${category.description}`.toLowerCase()
      }
      fields={[
        { name: "name", label: dict.nameLabel },
        {
          name: "slug",
          label: dict.slugLabel,
          inForm: false,
        },
        {
          name: "parentId",
          label: dict.parentLabel,
          type: "select",
          options: db.categories.map((category) => ({
            label: category.name,
            value: category.id,
          })),
          formatValue: (value) =>
            (typeof value === "string" && categoryNameMap[value]) ||
            dict.rootLabel,
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
        { name: "description", label: dict.descriptionLabel, type: "textarea" },
      ]}
      onSave={(draft) =>
        saveCategory({
          id: draft.id,
          name: draft.name,
          parentId: draft.parentId,
          status: draft.status,
          description: draft.description,
        })
      }
      onDelete={(id) => deleteEntity("categories", id)}
    />
  );
}

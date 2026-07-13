"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { useCatalogQuery } from "@/hooks/use-catalog-query";
import { invalidateAppQueries } from "@/lib/query-utils";
import { dynamicLabel } from "@/lib/translations";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "@/services/catalog";
import { Category } from "@/types/music";

const ROOT_CATEGORY_VALUE = "__root__";

type CategoryDraft = {
  id?: string;
  name: string;
  slug?: string;
  parentId: string;
  status: Category["status"];
  description: string;
};

export function CategoriesModule() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data } = useCatalogQuery();
  const categories = data?.categories ?? [];
  const categoryNameMap = Object.fromEntries(
    categories.map((category) => [category.id, category.name]),
  );
  const saveMutation = useMutation({
    mutationFn: async (draft: CategoryDraft) => {
      const payload = {
        name: draft.name,
        parentId:
          draft.parentId && draft.parentId !== ROOT_CATEGORY_VALUE
            ? draft.parentId
            : undefined,
        status: draft.status,
        description: draft.description,
      };

      if (draft.id) {
        await updateCategory(draft.id, payload);
        return;
      }

      await createCategory(payload);
    },
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });

  return (
    <GenericCrudModule<Category, CategoryDraft>
      title={t("nav.categories")}
      subtitle={t("section.categoriesSubtitle")}
      items={categories}
      createDraft={() => ({
        name: "",
        slug: "",
        parentId: ROOT_CATEGORY_VALUE,
        status: "active",
        description: "",
      })}
      validateDraft={(draft) =>
        draft.name.trim().length < 2 || draft.description.trim().length < 4
          ? t("labels.validationFailed")
          : null
      }
      toDraft={(category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId ?? ROOT_CATEGORY_VALUE,
        status: category.status,
        description: category.description,
      })}
      getSearchText={(category) =>
        `${category.name} ${category.slug} ${category.description}`.toLowerCase()
      }
      fields={[
        { name: "name", label: t("labels.name") },
        {
          name: "slug",
          label: t("labels.slug"),
          inForm: false,
        },
        {
          name: "parentId",
          label: t("labels.parent"),
          type: "select",
          options: [
            { label: t("labels.root"), value: ROOT_CATEGORY_VALUE },
            ...categories.map((category) => ({
              label: category.name,
              value: category.id,
            })),
          ],
          formatValue: (value) =>
            (typeof value === "string" && categoryNameMap[value]) ||
            t("labels.root"),
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
        {
          name: "description",
          label: t("labels.description"),
          type: "textarea",
        },
      ]}
      onSave={(draft) => saveMutation.mutateAsync(draft)}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
    />
  );
}

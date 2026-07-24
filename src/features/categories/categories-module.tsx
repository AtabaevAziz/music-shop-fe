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
const CATEGORY_NAME_ALPHANUMERIC_PATTERN = /[\p{L}\p{N}]/u;

type CategoryDraft = {
  id?: string;
  name: string;
  slug?: string;
  parentId: string;
  image: string;
  status: Category["status"];
  description: string;
  productCount: string;
};

function validateCategoryDraft(
  draft: CategoryDraft,
  t: ReturnType<typeof useTranslations>,
) {
  const name = draft.name.trim();
  const image = draft.image.trim();
  const description = draft.description.trim();

  if (name.length < 2 || description.length < 4 || image.length === 0) {
    return t("labels.validationFailed");
  }

  if (!CATEGORY_NAME_ALPHANUMERIC_PATTERN.test(name)) {
    return t("labels.categoryNameRequiresLettersOrNumbers");
  }

  if (!image.startsWith("/") && !/^https?:\/\//.test(image)) {
    return t("labels.validationFailed");
  }

  return null;
}

export function CategoriesModule() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data } = useCatalogQuery();
  const categories = data?.categories ?? [];
  const products = data?.products ?? [];
  const categoryNameMap = Object.fromEntries(
    categories.map((category) => [category.id, category.name]),
  );
  const categoryProductCountMap = Object.fromEntries(
    categories.map((category) => [
      category.id,
      products.filter((product) => product.categoryId === category.id).length,
    ]),
  );
  const saveMutation = useMutation({
    mutationFn: async (draft: CategoryDraft) => {
      const name = draft.name.trim();
      const description = draft.description.trim();
      const payload = {
        name,
        parentId:
          draft.parentId && draft.parentId !== ROOT_CATEGORY_VALUE
            ? draft.parentId
            : undefined,
        image: draft.image.trim(),
        status: draft.status,
        description,
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
        image: "",
        status: "active",
        description: "",
        productCount: "0",
      })}
      validateDraft={(draft) => validateCategoryDraft(draft, t)}
      toDraft={(category) => ({
        id: category.id,
        name: category.name,
        slug: category.slug,
        parentId: category.parentId ?? ROOT_CATEGORY_VALUE,
        image: category.image,
        status: category.status,
        description: category.description,
        productCount: String(categoryProductCountMap[category.id] ?? 0),
      })}
      getSearchText={(category) =>
        `${category.name} ${category.slug} ${category.image} ${category.description}`.toLowerCase()
      }
      fields={[
        { name: "name", label: t("labels.name") },
        {
          name: "productCount",
          label: t("labels.productCount"),
          inForm: false,
          formatValue: (_, category) =>
            categoryProductCountMap[category.id] ?? 0,
        },
        {
          name: "slug",
          label: t("labels.slug"),
          inForm: false,
        },
        {
          name: "image",
          label: t("labels.imagePath"),
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

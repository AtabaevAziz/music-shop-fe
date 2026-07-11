"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";

import { useCatalogQuery } from "@/hooks/use-catalog-query";
import { GenericCrudModule } from "@/features/shared/generic-crud";
import { invalidateAppQueries } from "@/lib/query-utils";
import { dynamicLabel } from "@/lib/translations";
import {
  createBrand,
  deleteBrand,
  updateBrand,
} from "@/services/catalog";
import { Brand } from "@/types/music";

type BrandDraft = {
  id?: string;
  name: string;
  country: string;
  website: string;
  status: Brand["status"];
};

export function BrandsModule() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data } = useCatalogQuery();
  const brands = data?.brands ?? [];
  const saveMutation = useMutation({
    mutationFn: async (draft: BrandDraft) => {
      const payload = {
        name: draft.name,
        country: draft.country,
        website: draft.website,
        status: draft.status,
      };

      if (draft.id) {
        await updateBrand(draft.id, payload);
        return;
      }

      await createBrand(payload);
    },
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });

  return (
    <GenericCrudModule<Brand, BrandDraft>
      title={t("nav.brands")}
      subtitle={t("section.brandsSubtitle")}
      items={brands}
      createDraft={() => ({
        name: "",
        country: "",
        website: "",
        status: "active",
      })}
      validateDraft={(draft) =>
        draft.name.trim().length < 2 ||
        draft.country.trim().length < 2 ||
        draft.website.trim().length < 8
          ? t("labels.validationFailed")
          : null
      }
      toDraft={(brand) => ({
        id: brand.id,
        name: brand.name,
        country: brand.country,
        website: brand.website,
        status: brand.status,
      })}
      getSearchText={(brand) =>
        `${brand.name} ${brand.country} ${brand.website}`.toLowerCase()
      }
      fields={[
        { name: "name", label: t("labels.name") },
        { name: "country", label: t("labels.country") },
        { name: "website", label: t("labels.website"), type: "url" },
        {
          name: "status",
          label: t("common.status"),
          type: "select",
          options: [
            { label: dynamicLabel(t, "active"), value: "active" },
            { label: dynamicLabel(t, "inactive"), value: "inactive" },
          ],
        },
      ]}
      onSave={(draft) => saveMutation.mutateAsync(draft)}
      onDelete={(id) => deleteMutation.mutateAsync(id)}
    />
  );
}

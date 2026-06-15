"use client";

import { useTranslations } from "next-intl";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { dynamicLabel } from "@/lib/translations";
import { useMusicStore } from "@/store/music-store";
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
  const { db, saveBrand, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule<Brand, BrandDraft>
      title={t("nav.brands")}
      subtitle={t("section.brandsSubtitle")}
      items={db.brands}
      createDraft={() => ({
        name: "",
        country: "",
        website: "",
        status: "active",
      })}
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
      onSave={(draft) =>
        saveBrand({
          id: draft.id,
          name: draft.name,
          country: draft.country,
          website: draft.website,
          status: draft.status,
        })
      }
      onDelete={(id) => deleteEntity("brands", id)}
    />
  );
}

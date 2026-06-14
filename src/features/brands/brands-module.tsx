"use client";

import { GenericCrudModule } from "@/features/shared/generic-crud";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
import { useMusicStore } from "@/store/music-store";
import { Brand } from "@/types/music";

type BrandDraft = {
  id?: string;
  name: string;
  country: string;
  website: string;
  status: Brand["status"];
};

export function BrandsModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, saveBrand, deleteEntity } = useMusicStore();

  return (
    <GenericCrudModule<Brand, BrandDraft>
      locale={locale}
      title={dict.brands}
      subtitle="Reusable vendor and manufacturer records."
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
        { name: "name", label: "Name" },
        { name: "country", label: "Country" },
        { name: "website", label: "Website", type: "url" },
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

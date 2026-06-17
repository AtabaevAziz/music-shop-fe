"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { AppField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModuleSection } from "@/shared/components/module-shell";
import { useMusicStore } from "@/store/music-store";

export function MediaModule() {
  const t = useTranslations();
  const { db, addProductImage, setPrimaryImage } = useMusicStore();
  const [productId, setProductId] = useState(db.products[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const product = db.products.find((item) => item.id === productId);

  return (
    <div className="two-columns">
      <ModuleSection
        title={t("nav.media")}
        subtitle={t("section.mediaSubtitle")}
      >
        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!label.trim()) return;
            void addProductImage(productId, label.trim());
            setLabel("");
          }}
        >
          <AppField label={t("labels.product")}>
            <Select value={productId} onValueChange={setProductId}>
              <SelectTrigger>
                <SelectValue placeholder={t("labels.product")} />
              </SelectTrigger>
              <SelectContent>
                {db.products.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AppField>
          <AppField label={t("labels.imagePath")}>
            <Input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </AppField>
          <div className="flex gap-2">
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </ModuleSection>
      <ModuleSection>
        <PageHeader
          title={product?.name ?? t("nav.media")}
          subtitle={t("labels.productGalleryPreviewSubtitle")}
        />
        {product ? (
          <div className="media-grid">
            {product.images.map((image) => (
              <div key={image} className="media-tile">
                <div className="art-preview">
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      width={640}
                      height={480}
                      className="media-image"
                    />
                  ) : null}
                </div>
                <div className="stack-row spread">
                  <span>{image.split("/").pop()}</span>
                  {product.primaryImage === image ? (
                    <Badge variant="success">{t("labels.primary")}</Badge>
                  ) : null}
                </div>
                {product.primaryImage !== image ? (
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => void setPrimaryImage(product.id, image)}
                  >
                    {t("labels.setPrimary")}
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">{t("common.noData")}</div>
        )}
      </ModuleSection>
    </div>
  );
}

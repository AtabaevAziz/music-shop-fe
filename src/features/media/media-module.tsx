"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useState } from "react";

import { Badge, Field, PageHeader } from "@/components/ui/primitives";
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
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            if (!label.trim()) return;
            void addProductImage(productId, label.trim());
            setLabel("");
          }}
        >
          <Field label={t("labels.product")}>
            <select
              value={productId}
              onChange={(event) => setProductId(event.target.value)}
            >
              {db.products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("labels.imagePath")}>
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </Field>
          <div className="stack-row form-actions">
            <button className="button" type="submit">
              {t("common.save")}
            </button>
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
                    <Badge tone="success">{t("labels.primary")}</Badge>
                  ) : null}
                </div>
                {product.primaryImage !== image ? (
                  <button
                    className="button-ghost"
                    type="button"
                    onClick={() => void setPrimaryImage(product.id, image)}
                  >
                    {t("labels.setPrimary")}
                  </button>
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

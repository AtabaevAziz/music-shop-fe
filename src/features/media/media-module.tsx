"use client";

import Image from "next/image";
import { useState } from "react";

import { Badge, Field, PageHeader } from "@/components/ui/primitives";
import { Locale, getDictionary } from "@/lib/i18n";
import { useMusicStore } from "@/store/music-store";

export function MediaModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, addProductImage, setPrimaryImage } = useMusicStore();
  const [productId, setProductId] = useState(db.products[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const product = db.products.find((item) => item.id === productId);

  return (
    <div className="two-columns">
      <section className="table-card">
        <form
          className="form-grid"
          onSubmit={(event) => {
            event.preventDefault();
            if (!label.trim()) return;
            void addProductImage(productId, label.trim());
            setLabel("");
          }}
        >
          <Field label="Product">
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
          <Field label="Image path">
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </Field>
          <div className="stack-row form-actions">
            <button className="button" type="submit">
              {dict.save}
            </button>
          </div>
        </form>
      </section>
      <section className="table-card">
        <PageHeader
          title={product?.name ?? dict.media}
          subtitle="Product gallery preview"
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
                    <Badge tone="success">primary</Badge>
                  ) : null}
                </div>
                {product.primaryImage !== image ? (
                  <button
                    className="button-ghost"
                    type="button"
                    onClick={() => void setPrimaryImage(product.id, image)}
                  >
                    Set primary
                  </button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">{dict.noData}</div>
        )}
      </section>
    </div>
  );
}

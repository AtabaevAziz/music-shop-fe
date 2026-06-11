"use client";

import { useState } from "react";
import { PageHeader, Field, Badge } from "@/components/ui/primitives";
import { useMusicStore } from "@/store/music-store";
import { getDictionary, Locale } from "@/lib/i18n";

export function MediaModule({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const { db, addProductImage, setPrimaryImage } = useMusicStore();
  const [productId, setProductId] = useState(db.products[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const product = db.products.find((item) => item.id === productId);

  return (
    <div className="two-columns">
      <section className="table-card">
        <PageHeader
          title={dict.media}
          subtitle="Attach product images and manage primary artwork."
        />
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
          <Field label="Image label">
            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </Field>
          <div className="stack-row" style={{ gridColumn: "1 / -1" }}>
            <button className="button" type="submit">
              {dict.save}
            </button>
          </div>
        </form>
      </section>
      <section className="table-card">
        <PageHeader
          title={product?.name ?? dict.media}
          subtitle="Mock gallery preview"
        />
        {product ? (
          <div className="media-grid">
            {product.images.map((image) => (
              <div key={image} className="media-tile">
                <div className="art-preview">{image}</div>
                <div
                  className="stack-row"
                  style={{ justifyContent: "space-between" }}
                >
                  <span>{image}</span>
                  {product.primaryImage === image ? (
                    <Badge tone="success">primary</Badge>
                  ) : null}
                </div>
                {product.primaryImage !== image ? (
                  <button
                    className="button-ghost"
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

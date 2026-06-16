"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { z } from "zod";

import { Badge, Field, Modal, Money } from "@/components/ui/primitives";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { parseList } from "@/lib/utils";
import { useMusicStore } from "@/store/music-store";

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  price: z.coerce.number().min(1),
  costPrice: z.coerce.number().min(1),
  stockQty: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  brandId: z.string().min(1),
  shortDescription: z.string().min(4),
  description: z.string().min(4),
  status: z.enum(["draft", "active", "archived"]),
  condition: z.enum(["new", "used", "showroom"]),
});

type ProductDraft = Record<string, string>;

export function CatalogModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const { db, saveProduct, deleteEntity } = useMusicStore();
  const [query, setQuery] = useState("");
  const [formError, setFormError] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>({
    status: db.settings.defaultProductStatus,
    condition: "new",
  });

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return db.products;
    return db.products.filter((product) =>
      `${product.name} ${product.sku} ${product.shortDescription}`
        .toLowerCase()
        .includes(value),
    );
  }, [db.products, query]);

  const categoryMap = Object.fromEntries(
    db.categories.map((item) => [item.id, item.name]),
  );
  const brandMap = Object.fromEntries(
    db.brands.map((item) => [item.id, item.name]),
  );

  function resetDraft() {
    setDraft({
      status: db.settings.defaultProductStatus,
      condition: "new",
    });
  }

  async function submit() {
    const parsed = productSchema.safeParse(draft);
    if (!parsed.success) {
      setFormError(t("labels.validationFailed"));
      return;
    }
    const specs = Object.fromEntries(
      parseList(draft.specs ?? "").map((row) => {
        const [key, ...rest] = row.split(":");
        return [key.trim(), rest.join(":").trim()];
      }),
    );
    await saveProduct({
      id: draft.id,
      ...parsed.data,
      barcode: draft.barcode,
      specs,
      images: parseList(draft.images ?? ""),
      primaryImage: parseList(draft.images ?? "")[0],
      price: Number(draft.price),
      costPrice: Number(draft.costPrice),
      stockQty: Number(draft.stockQty),
    });
    setFormError("");
    resetDraft();
    setIsEditorOpen(false);
  }

  return (
    <>
      <section className="table-card">
        <div className="toolbar page-actions">
          <div className="stack-row">
            <input
              className="toolbar-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("common.search")}
            />
            <button
              className="button"
              type="button"
              onClick={() => {
                setFormError("");
                resetDraft();
                setIsEditorOpen(true);
              }}
            >
              {t("common.addNew")}
            </button>
          </div>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>{t("labels.preview")}</th>
                <th>{t("labels.product")}</th>
                <th>{t("labels.category")}</th>
                <th>{t("labels.brand")}</th>
                <th>{t("labels.price")}</th>
                <th>{t("labels.stock")}</th>
                <th>{t("common.status")}</th>
                <th>{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const previewImage = product.primaryImage ?? product.images[0];

                return (
                  <tr key={product.id}>
                    <td>
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt={product.name}
                          width={96}
                          height={72}
                          className="product-thumb"
                        />
                      ) : null}
                    </td>
                    <td>
                      <div className="product-cell">
                        <strong>{product.name}</strong>
                        <div className="muted">{product.shortDescription}</div>
                      </div>
                      <div className="muted">{product.sku}</div>
                    </td>
                    <td>{categoryMap[product.categoryId]}</td>
                    <td>{brandMap[product.brandId]}</td>
                    <td>
                      <Money
                        value={product.price}
                        currency={db.settings.currency}
                        locale={locale}
                      />
                    </td>
                    <td>
                      <Badge
                        tone={
                          product.stockQty <= db.settings.lowStockThreshold
                            ? "warn"
                            : "success"
                        }
                      >
                        {product.stockQty}
                      </Badge>
                    </td>
                    <td>
                      <Badge
                        tone={
                          product.status === "active"
                            ? "success"
                            : product.status === "archived"
                              ? "danger"
                              : "neutral"
                        }
                      >
                        {dynamicLabel(t, product.status)}
                      </Badge>
                    </td>
                    <td>
                      <div className="stack-row">
                        <button
                          className="button-ghost"
                          type="button"
                          onClick={() => {
                            setFormError("");
                            setDraft({
                              id: product.id,
                              name: product.name,
                              sku: product.sku,
                              barcode: product.barcode ?? "",
                              categoryId: product.categoryId,
                              brandId: product.brandId,
                              price: String(product.price),
                              costPrice: String(product.costPrice),
                              stockQty: String(product.stockQty),
                              status: product.status,
                              shortDescription: product.shortDescription,
                              description: product.description,
                              condition: product.condition,
                              images: product.images.join("\n"),
                              specs: Object.entries(product.specs)
                                .map(([key, value]) => `${key}: ${value}`)
                                .join("\n"),
                            });
                            setIsEditorOpen(true);
                          }}
                        >
                          {t("common.edit")}
                        </button>
                        <button
                          className="button-danger"
                          type="button"
                          onClick={() => setDeleteTargetId(product.id)}
                        >
                          {t("common.delete")}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {isEditorOpen ? (
        <Modal
          title={draft.id ? t("common.edit") : t("common.addNew")}
          subtitle={t("labels.productRecordSubtitle")}
          closeLabel={t("common.close")}
          onClose={() => {
            setFormError("");
            resetDraft();
            setIsEditorOpen(false);
          }}
        >
          {formError ? <div className="error">{formError}</div> : null}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
            className="form-grid"
          >
            <Field label={t("labels.name")}>
              <input
                value={draft.name ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label={t("labels.sku")}>
              <input
                value={draft.sku ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    sku: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label={t("labels.barcode")}>
              <input
                value={draft.barcode ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    barcode: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label={t("labels.category")}>
              <select
                value={draft.categoryId ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">{t("common.select")}</option>
                {db.categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("labels.brand")}>
              <select
                value={draft.brandId ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    brandId: event.target.value,
                  }))
                }
              >
                <option value="">{t("common.select")}</option>
                {db.brands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label={t("labels.condition")}>
              <select
                value={draft.condition ?? "new"}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    condition: event.target.value,
                  }))
                }
              >
                <option value="new">{dynamicLabel(t, "new")}</option>
                <option value="used">{dynamicLabel(t, "used")}</option>
                <option value="showroom">{dynamicLabel(t, "showroom")}</option>
              </select>
            </Field>
            <Field label={t("labels.price")}>
              <input
                type="number"
                value={draft.price ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label={t("labels.costPrice")}>
              <input
                type="number"
                value={draft.costPrice ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    costPrice: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label={t("labels.stockQty")}>
              <input
                type="number"
                value={draft.stockQty ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    stockQty: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label={t("common.status")}>
              <select
                value={draft.status ?? db.settings.defaultProductStatus}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                <option value="draft">{dynamicLabel(t, "draft")}</option>
                <option value="active">{dynamicLabel(t, "active")}</option>
                <option value="archived">{dynamicLabel(t, "archived")}</option>
              </select>
            </Field>
            <Field label={t("labels.shortDescription")}>
              <textarea
                value={draft.shortDescription ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    shortDescription: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label={t("labels.fullDescription")}>
              <textarea
                value={draft.description ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label={t("labels.imagesPerLine")}>
              <textarea
                value={draft.images ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    images: event.target.value,
                  }))
                }
              />
            </Field>
            <Field label={t("labels.specsKeyValue")}>
              <textarea
                value={draft.specs ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    specs: event.target.value,
                  }))
                }
              />
            </Field>
            <div className="stack-row form-actions">
              <button className="button" type="submit">
                {t("common.save")}
              </button>
              <button
                className="button-ghost"
                type="button"
                onClick={() => {
                  setFormError("");
                  resetDraft();
                  setIsEditorOpen(false);
                }}
              >
                {t("common.cancel")}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {deleteTargetId ? (
        <Modal
          title={t("common.confirmDelete")}
          subtitle={t("common.deletePrompt")}
          closeLabel={t("common.close")}
          onClose={() => setDeleteTargetId(null)}
        >
          <div className="modal-actions">
            <button
              className="button-danger"
              type="button"
              onClick={() => {
                void deleteEntity("products", deleteTargetId).then(() =>
                  setDeleteTargetId(null),
                );
              }}
            >
              {t("common.delete")}
            </button>
            <button
              className="button-ghost"
              type="button"
              onClick={() => setDeleteTargetId(null)}
            >
              {t("common.cancel")}
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

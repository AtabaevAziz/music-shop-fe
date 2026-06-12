"use client";

import { useMemo, useState } from "react";
import { z } from "zod";

import {
  Badge,
  Field,
  Modal,
  Money,
  PageHeader,
} from "@/components/ui/primitives";
import { Locale, getDictionary, translateDynamicLabel } from "@/lib/i18n";
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
  const dict = getDictionary(locale);
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
      setFormError(parsed.error.issues[0]?.message ?? "Validation failed");
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
        <PageHeader
          title={dict.catalog}
          subtitle="Product master data, pricing, descriptions, and merchandising status."
          actions={
            <div className="stack-row">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={dict.search}
                style={{
                  minWidth: 220,
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid var(--line)",
                }}
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
                {dict.addNew}
              </button>
            </div>
          }
        />
        <table>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>{dict.status}</th>
              <th>{dict.actions}</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((product) => (
              <tr key={product.id}>
                <td>
                  <img
                    src={product.primaryImage ?? product.images[0] ?? ""}
                    alt={product.name}
                    className="product-thumb"
                  />
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
                    {translateDynamicLabel(locale, product.status)}
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
                      {dict.edit}
                    </button>
                    <button
                      className="button-danger"
                      type="button"
                      onClick={() => setDeleteTargetId(product.id)}
                    >
                      {dict.delete}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {isEditorOpen ? (
        <Modal
          title={draft.id ? dict.edit : dict.addNew}
          subtitle="Product record"
          closeLabel={dict.close}
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
            <Field label="Name">
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
            <Field label="SKU">
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
            <Field label="Barcode">
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
            <Field label="Category">
              <select
                value={draft.categoryId ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    categoryId: event.target.value,
                  }))
                }
              >
                <option value="">Select</option>
                {db.categories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Brand">
              <select
                value={draft.brandId ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    brandId: event.target.value,
                  }))
                }
              >
                <option value="">Select</option>
                {db.brands.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Condition">
              <select
                value={draft.condition ?? "new"}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    condition: event.target.value,
                  }))
                }
              >
                <option value="new">
                  {translateDynamicLabel(locale, "new")}
                </option>
                <option value="used">
                  {translateDynamicLabel(locale, "used")}
                </option>
                <option value="showroom">
                  {translateDynamicLabel(locale, "showroom")}
                </option>
              </select>
            </Field>
            <Field label="Price">
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
            <Field label="Cost price">
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
            <Field label="Stock qty">
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
            <Field label={dict.status}>
              <select
                value={draft.status ?? db.settings.defaultProductStatus}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    status: event.target.value,
                  }))
                }
              >
                <option value="draft">
                  {translateDynamicLabel(locale, "draft")}
                </option>
                <option value="active">
                  {translateDynamicLabel(locale, "active")}
                </option>
                <option value="archived">
                  {translateDynamicLabel(locale, "archived")}
                </option>
              </select>
            </Field>
            <Field label="Short description">
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
            <Field label="Full description">
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
            <Field label="Images, one per line">
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
            <Field label="Specs as Key: Value">
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
            <div className="stack-row" style={{ gridColumn: "1 / -1" }}>
              <button className="button" type="submit">
                {dict.save}
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
                {dict.cancel}
              </button>
            </div>
          </form>
        </Modal>
      ) : null}

      {deleteTargetId ? (
        <Modal
          title={dict.confirmDelete}
          subtitle={dict.deletePrompt}
          closeLabel={dict.close}
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
              {dict.delete}
            </button>
            <button
              className="button-ghost"
              type="button"
              onClick={() => setDeleteTargetId(null)}
            >
              {dict.cancel}
            </button>
          </div>
        </Modal>
      ) : null}
    </>
  );
}

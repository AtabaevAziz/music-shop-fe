"use client";

import { useMemo, useState } from "react";
import { z } from "zod";
import { Field, PageHeader, Badge, Money } from "@/components/ui";
import { useMusicStore } from "@/data/store";
import { getDictionary, Locale } from "@/lib/i18n";
import { parseList } from "@/lib/utils";

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
    setDraft({ status: db.settings.defaultProductStatus, condition: "new" });
  }

  return (
    <div className="drawer-layout">
      <section className="table-card">
        <PageHeader
          title={dict.catalog}
          subtitle="Product master data, pricing, descriptions, and merchandising status."
          actions={
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
          }
        />
        <table>
          <thead>
            <tr>
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
                  <strong>{product.name}</strong>
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
                    {product.status}
                  </Badge>
                </td>
                <td>
                  <div className="stack-row">
                    <button
                      className="button-ghost"
                      onClick={() =>
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
                        })
                      }
                    >
                      {dict.edit}
                    </button>
                    <button
                      className="button-danger"
                      onClick={() => void deleteEntity("products", product.id)}
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

      <aside className="drawer">
        <PageHeader
          title={draft.id ? dict.edit : dict.addNew}
          subtitle="Product record"
        />
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
                setDraft((current) => ({ ...current, sku: event.target.value }))
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
              <option value="new">new</option>
              <option value="used">used</option>
              <option value="showroom">showroom</option>
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
              <option value="draft">draft</option>
              <option value="active">active</option>
              <option value="archived">archived</option>
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
              onClick={() =>
                setDraft({
                  status: db.settings.defaultProductStatus,
                  condition: "new",
                })
              }
            >
              {dict.cancel}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

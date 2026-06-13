"use client";

import { useMemo, useState } from "react";

import { Badge, Field, Modal, PageHeader } from "@/components/ui/primitives";
import { Locale, getDictionary } from "@/lib/i18n";

export type CrudField = {
  name: string;
  label: string;
  type?: "text" | "textarea" | "select" | "number";
  options?: { label: string; value: string }[];
};

type CrudModuleProps<T extends { id: string }> = {
  locale: Locale;
  title: string;
  subtitle: string;
  items: T[];
  fields: CrudField[];
  onSave: (payload: Record<string, string>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export function GenericCrudModule<T extends { id: string }>({
  locale,
  title,
  subtitle,
  items,
  fields,
  onSave,
  onDelete,
}: CrudModuleProps<T>) {
  const dict = getDictionary(locale);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return items;
    return items.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(value),
    );
  }, [items, query]);

  return (
    <>
      <section className="table-card">
        <PageHeader
          title={title}
          subtitle={subtitle}
          actions={
            <div className="stack-row">
              <input
                className="toolbar-search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={dict.search}
              />
              <button
                className="button"
                type="button"
                onClick={() => {
                  setDraft({});
                  setIsEditorOpen(true);
                }}
              >
                {dict.addNew}
              </button>
            </div>
          }
        />
        {filtered.length ? (
          <table>
            <thead>
              <tr>
                {fields.slice(0, 4).map((field) => (
                  <th key={field.name}>{field.label}</th>
                ))}
                <th>{dict.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  {fields.slice(0, 4).map((field) => {
                    const raw = item[field.name as keyof T];
                    const optionLabel =
                      typeof raw === "string"
                        ? field.options?.find((option) => option.value === raw)
                            ?.label
                        : undefined;
                    return (
                      <td key={field.name}>
                        {optionLabel ??
                          (typeof raw === "string" ? raw : String(raw ?? ""))}
                      </td>
                    );
                  })}
                  <td>
                    <div className="stack-row">
                      <button
                        className="button-ghost"
                        type="button"
                        onClick={() => {
                          setDraft(
                            Object.fromEntries(
                              fields
                                .map((field) => [
                                  field.name,
                                  String(item[field.name as keyof T] ?? ""),
                                ])
                                .concat([["id", item.id]]),
                            ),
                          );
                          setIsEditorOpen(true);
                        }}
                      >
                        {dict.edit}
                      </button>
                      <button
                        className="button-danger"
                        type="button"
                        onClick={() => setDeleteTargetId(item.id)}
                      >
                        {dict.delete}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">{dict.noData}</div>
        )}
      </section>

      {isEditorOpen ? (
        <Modal
          title={draft.id ? dict.edit : dict.addNew}
          subtitle={title}
          closeLabel={dict.close}
          onClose={() => {
            setDraft({});
            setIsEditorOpen(false);
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void onSave(draft).then(() => {
                setDraft({});
                setIsEditorOpen(false);
              });
            }}
            className="form-grid"
          >
            {fields.map((field) => (
              <Field key={field.name} label={field.label}>
                {field.type === "textarea" ? (
                  <textarea
                    value={draft[field.name] ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                ) : field.type === "select" ? (
                  <select
                    value={draft[field.name] ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                  >
                    <option value="">Select</option>
                    {field.options?.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type ?? "text"}
                    value={draft[field.name] ?? ""}
                    onChange={(event) =>
                      setDraft((current) => ({
                        ...current,
                        [field.name]: event.target.value,
                      }))
                    }
                  />
                )}
              </Field>
            ))}
            <div className="stack-row form-actions">
              <button className="button" type="submit">
                {dict.save}
              </button>
              <button
                className="button-ghost"
                type="button"
                onClick={() => {
                  setDraft({});
                  setIsEditorOpen(false);
                }}
              >
                {dict.cancel}
              </button>
              {draft.id ? <Badge tone="neutral">{dict.details}</Badge> : null}
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
                void onDelete(deleteTargetId).then(() =>
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

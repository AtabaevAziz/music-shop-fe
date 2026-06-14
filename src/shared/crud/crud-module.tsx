"use client";

import { ReactNode, useMemo, useState } from "react";

import { Field, Modal } from "@/components/ui/primitives";
import { Locale, getDictionary } from "@/lib/i18n";
import {
  ModuleEmptyState,
  ModuleSection,
} from "@/shared/components/module-shell";

type CrudOption = {
  label: string;
  value: string;
};

type CrudFieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "email"
  | "tel"
  | "url";

type CrudDraft = {
  id?: string;
  [key: string]: string | undefined;
};

export type CrudField<TItem, TDraft extends CrudDraft> = {
  name: Extract<keyof TDraft, string>;
  label: string;
  type?: CrudFieldType;
  options?: CrudOption[];
  placeholder?: string;
  inTable?: boolean;
  inForm?: boolean;
  getValue?: (item: TItem) => string | number | undefined | null;
  formatValue?: (
    value: string | number | undefined | null,
    item: TItem,
  ) => ReactNode;
};

type CrudModuleProps<TItem extends { id: string }, TDraft extends CrudDraft> = {
  locale: Locale;
  title: string;
  subtitle: string;
  items: TItem[];
  fields: CrudField<TItem, TDraft>[];
  createDraft: () => TDraft;
  toDraft: (item: TItem) => TDraft;
  getSearchText?: (item: TItem) => string;
  emptyMessage?: string;
  onSave: (draft: TDraft) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

function getDisplayValue<TItem, TDraft extends CrudDraft>(
  item: TItem,
  field: CrudField<TItem, TDraft>,
) {
  if (field.getValue) {
    return field.getValue(item);
  }

  const value = (item as Record<string, unknown>)[field.name];
  if (
    typeof value === "string" ||
    typeof value === "number" ||
    value === null ||
    value === undefined
  ) {
    return value;
  }

  return String(value ?? "");
}

export function CrudModule<
  TItem extends { id: string },
  TDraft extends CrudDraft,
>({
  locale,
  title,
  subtitle,
  items,
  fields,
  createDraft,
  toDraft,
  getSearchText,
  emptyMessage,
  onSave,
  onDelete,
}: CrudModuleProps<TItem, TDraft>) {
  const dict = getDictionary(locale);
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<TDraft>(() => createDraft());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const tableFields = fields.filter((field) => field.inTable !== false);
  const formFields = fields.filter((field) => field.inForm !== false);

  const filteredItems = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return items;

    return items.filter((item) => {
      const haystack = getSearchText
        ? getSearchText(item)
        : JSON.stringify(item);
      return haystack.toLowerCase().includes(value);
    });
  }, [getSearchText, items, query]);

  function resetDraft() {
    setDraft(createDraft());
  }

  function closeEditor() {
    resetDraft();
    setIsEditorOpen(false);
  }

  function updateDraftValue(
    name: Extract<keyof TDraft, string>,
    value: string,
  ) {
    setDraft(
      (current) =>
        ({
          ...current,
          [name]: value,
        }) as TDraft,
    );
  }

  function resolveDisplayValue(field: CrudField<TItem, TDraft>, item: TItem) {
    const rawValue = getDisplayValue(item, field);
    const optionLabel =
      typeof rawValue === "string"
        ? field.options?.find((option) => option.value === rawValue)?.label
        : undefined;

    if (field.formatValue) {
      return field.formatValue(rawValue, item);
    }

    return optionLabel ?? String(rawValue ?? "");
  }

  return (
    <>
      <ModuleSection
        title={title}
        subtitle={subtitle}
        actions={
          <div className="stack-row module-toolbar-actions">
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
                resetDraft();
                setIsEditorOpen(true);
              }}
            >
              {dict.addNew}
            </button>
          </div>
        }
      >
        {filteredItems.length ? (
          <table>
            <thead>
              <tr>
                {tableFields.map((field) => (
                  <th key={field.name}>{field.label}</th>
                ))}
                <th>{dict.actions}</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id}>
                  {tableFields.map((field) => (
                    <td key={field.name}>{resolveDisplayValue(field, item)}</td>
                  ))}
                  <td>
                    <div className="stack-row">
                      <button
                        className="button-ghost"
                        type="button"
                        onClick={() => {
                          setDraft(toDraft(item));
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
          <ModuleEmptyState
            title={dict.noData}
            description={emptyMessage ?? subtitle}
            action={
              <button
                className="button"
                type="button"
                onClick={() => {
                  resetDraft();
                  setIsEditorOpen(true);
                }}
              >
                {dict.addNew}
              </button>
            }
          />
        )}
      </ModuleSection>

      {isEditorOpen ? (
        <Modal
          title={draft.id ? dict.edit : dict.addNew}
          subtitle={title}
          closeLabel={dict.close}
          onClose={closeEditor}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void onSave(draft).then(() => {
                closeEditor();
              });
            }}
            className="form-grid"
          >
            {formFields.map((field) => (
              <Field key={field.name} label={field.label}>
                {field.type === "textarea" ? (
                  <textarea
                    value={draft[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      updateDraftValue(field.name, event.target.value)
                    }
                  />
                ) : field.type === "select" ? (
                  <select
                    value={draft[field.name] ?? ""}
                    onChange={(event) =>
                      updateDraftValue(field.name, event.target.value)
                    }
                  >
                    <option value="">{field.placeholder ?? field.label}</option>
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
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      updateDraftValue(field.name, event.target.value)
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
                onClick={closeEditor}
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

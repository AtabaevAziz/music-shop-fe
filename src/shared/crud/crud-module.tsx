"use client";

import { useTranslations } from "next-intl";
import { ReactNode, useMemo, useState } from "react";

import { AppField } from "@/components/shared/form-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
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
  const t = useTranslations();
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
          <div className="flex flex-wrap gap-2">
            <Input
              className="w-full min-w-[220px] md:w-72"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("common.search")}
            />
            <Button
              type="button"
              onClick={() => {
                resetDraft();
                setIsEditorOpen(true);
              }}
            >
              {t("common.addNew")}
            </Button>
          </div>
        }
      >
        {filteredItems.length ? (
          <div className="responsive-table">
            <Table>
              <TableHeader>
                <TableRow>
                  {tableFields.map((field) => (
                    <TableHead key={field.name}>{field.label}</TableHead>
                  ))}
                  <TableHead>{t("common.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((item) => (
                  <TableRow key={item.id}>
                    {tableFields.map((field) => (
                      <TableCell key={field.name}>
                        {resolveDisplayValue(field, item)}
                      </TableCell>
                    ))}
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => {
                            setDraft(toDraft(item));
                            setIsEditorOpen(true);
                          }}
                        >
                          {t("common.edit")}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          type="button"
                          onClick={() => setDeleteTargetId(item.id)}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <ModuleEmptyState
            title={t("common.noData")}
            description={emptyMessage ?? subtitle}
            action={
              <Button
                type="button"
                onClick={() => {
                  resetDraft();
                  setIsEditorOpen(true);
                }}
              >
                {t("common.addNew")}
              </Button>
            }
          />
        )}
      </ModuleSection>

      <Dialog open={isEditorOpen} onOpenChange={(open) => !open && closeEditor()}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? t("common.edit") : t("common.addNew")}
            </DialogTitle>
            <DialogDescription>{title}</DialogDescription>
          </DialogHeader>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void onSave(draft).then(() => {
                closeEditor();
              });
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            {formFields.map((field) => (
              <AppField
                key={field.name}
                label={field.label}
                className={field.type === "textarea" ? "md:col-span-2" : undefined}
              >
                {field.type === "textarea" ? (
                  <Textarea
                    value={draft[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      updateDraftValue(field.name, event.target.value)
                    }
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={draft[field.name] ?? ""}
                    onValueChange={(value) => updateDraftValue(field.name, value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder ?? field.label} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.placeholder ? (
                        <SelectItem value="__empty__" disabled>
                          {field.placeholder}
                        </SelectItem>
                      ) : null}
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type={field.type ?? "text"}
                    value={draft[field.name] ?? ""}
                    placeholder={field.placeholder}
                    onChange={(event) =>
                      updateDraftValue(field.name, event.target.value)
                    }
                  />
                )}
              </AppField>
            ))}
            <DialogFooter className="md:col-span-2">
              <Button type="submit">
                {t("common.save")}
              </Button>
              <Button variant="outline" type="button" onClick={closeEditor}>
                {t("common.cancel")}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deleteTargetId)}
        onOpenChange={(open) => !open && setDeleteTargetId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("common.confirmDelete")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("common.deletePrompt")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction
              onClick={() => {
                if (!deleteTargetId) {
                  return;
                }

                void onDelete(deleteTargetId).then(() => setDeleteTargetId(null));
              }}
            >
              {t("common.delete")}
            </AlertDialogAction>
            <AlertDialogCancel onClick={() => setDeleteTargetId(null)}>
              {t("common.cancel")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

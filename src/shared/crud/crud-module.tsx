"use client";

import { Pen, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { ReactNode, useMemo, useState } from "react";

import { AppField } from "@/components/shared/form-field";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  validateDraft?: (draft: TDraft) => string | null;
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
  validateDraft,
  onSave,
  onDelete,
}: CrudModuleProps<TItem, TDraft>) {
  const t = useTranslations();
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<TDraft>(() => createDraft());
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
    setFormError("");
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

  async function handleSave() {
    const validationMessage = validateDraft?.(draft) ?? null;
    if (validationMessage) {
      setFormError(validationMessage);
      return;
    }

    setIsSaving(true);
    setFormError("");
    try {
      await onSave(draft);
      closeEditor();
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t("common.unexpectedError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTargetId) {
      return;
    }

    setIsDeleting(true);
    try {
      await onDelete(deleteTargetId);
      setDeleteTargetId(null);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t("common.unexpectedError"),
      );
    } finally {
      setIsDeleting(false);
    }
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
                setFormError("");
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
                      <TooltipProvider delayDuration={120}>
                        <div className="flex flex-wrap gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                type="button"
                                disabled={isSaving || isDeleting}
                                aria-label={t("common.edit")}
                                onClick={() => {
                                  setFormError("");
                                  setDraft(toDraft(item));
                                  setIsEditorOpen(true);
                                }}
                              >
                                <Pen />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{t("common.edit")}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                type="button"
                                disabled={isSaving || isDeleting}
                                aria-label={t("common.delete")}
                                onClick={() => setDeleteTargetId(item.id)}
                              >
                                <Trash2 />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {t("common.delete")}
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </TooltipProvider>
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
                  setFormError("");
                  setIsEditorOpen(true);
                }}
              >
                {t("common.addNew")}
              </Button>
            }
          />
        )}
      </ModuleSection>

      <Dialog
        open={isEditorOpen}
        onOpenChange={(open) => !open && closeEditor()}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? t("common.edit") : t("common.addNew")}
            </DialogTitle>
            <DialogDescription>{title}</DialogDescription>
          </DialogHeader>
          {formError ? <div className="error">{formError}</div> : null}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void handleSave();
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            {formFields.map((field) => (
              <AppField
                key={field.name}
                label={field.label}
                className={
                  field.type === "textarea" ? "md:col-span-2" : undefined
                }
              >
                {field.type === "textarea" ? (
                  <Textarea
                    value={draft[field.name] ?? ""}
                    placeholder={field.placeholder}
                    disabled={isSaving}
                    onChange={(event) =>
                      updateDraftValue(field.name, event.target.value)
                    }
                  />
                ) : field.type === "select" ? (
                  <Select
                    value={draft[field.name] ?? ""}
                    disabled={isSaving}
                    onValueChange={(value) =>
                      updateDraftValue(field.name, value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={field.placeholder ?? field.label}
                      />
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
                    disabled={isSaving}
                    onChange={(event) =>
                      updateDraftValue(field.name, event.target.value)
                    }
                  />
                )}
              </AppField>
            ))}
            <DialogFooter className="md:col-span-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? t("common.saving") : t("common.save")}
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isSaving}
                onClick={closeEditor}
              >
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
            <AlertDialogAction onClick={() => void handleDelete()}>
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
            <AlertDialogCancel
              disabled={isDeleting}
              onClick={() => setDeleteTargetId(null)}
            >
              {t("common.cancel")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

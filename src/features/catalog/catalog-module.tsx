"use client";

import { useTranslations } from "next-intl";
import Image from "next/image";
import { useMemo, useState } from "react";
import { z } from "zod";

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
import { Badge } from "@/components/ui/badge";
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
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, parseList } from "@/lib/utils";
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
                setFormError("");
                resetDraft();
                setIsEditorOpen(true);
              }}
            >
              {t("common.addNew")}
            </Button>
          </div>
        </div>
        <div className="responsive-table">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("labels.preview")}</TableHead>
                <TableHead>{t("labels.product")}</TableHead>
                <TableHead>{t("labels.category")}</TableHead>
                <TableHead>{t("labels.brand")}</TableHead>
                <TableHead>{t("labels.price")}</TableHead>
                <TableHead>{t("labels.stock")}</TableHead>
                <TableHead>{t("common.status")}</TableHead>
                <TableHead>{t("common.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((product) => {
                const previewImage = product.primaryImage ?? product.images[0];

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt={product.name}
                          width={96}
                          height={72}
                          className="product-thumb"
                        />
                      ) : null}
                    </TableCell>
                    <TableCell>
                      <div className="product-cell">
                        <strong>{product.name}</strong>
                        <div className="muted">{product.shortDescription}</div>
                      </div>
                      <div className="muted">{product.sku}</div>
                    </TableCell>
                    <TableCell>{categoryMap[product.categoryId]}</TableCell>
                    <TableCell>{brandMap[product.brandId]}</TableCell>
                    <TableCell>
                      {formatMoney(product.price, db.settings.currency, locale)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.stockQty <= db.settings.lowStockThreshold
                            ? "warning"
                            : "success"
                        }
                      >
                        {product.stockQty}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          product.status === "active"
                            ? "success"
                            : product.status === "archived"
                              ? "destructive"
                              : "secondary"
                        }
                      >
                        {dynamicLabel(t, product.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
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
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          type="button"
                          onClick={() => setDeleteTargetId(product.id)}
                        >
                          {t("common.delete")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </section>

      <Dialog
        open={isEditorOpen}
        onOpenChange={(open) => {
          if (!open) {
            setFormError("");
            resetDraft();
            setIsEditorOpen(false);
          }
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>
              {draft.id ? t("common.edit") : t("common.addNew")}
            </DialogTitle>
            <DialogDescription>
              {t("labels.productRecordSubtitle")}
            </DialogDescription>
          </DialogHeader>
          {formError ? <div className="error">{formError}</div> : null}
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void submit();
            }}
            className="grid gap-4 md:grid-cols-2"
          >
            <AppField label={t("labels.name")}>
              <Input
                value={draft.name ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("labels.sku")}>
              <Input
                value={draft.sku ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    sku: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("labels.barcode")}>
              <Input
                value={draft.barcode ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    barcode: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("labels.category")}>
              <Select
                value={draft.categoryId ?? ""}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    categoryId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("common.select")} />
                </SelectTrigger>
                <SelectContent>
                  {db.categories.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AppField>
            <AppField label={t("labels.brand")}>
              <Select
                value={draft.brandId ?? ""}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    brandId: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder={t("common.select")} />
                </SelectTrigger>
                <SelectContent>
                  {db.brands.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </AppField>
            <AppField label={t("labels.condition")}>
              <Select
                value={draft.condition ?? "new"}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    condition: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{dynamicLabel(t, "new")}</SelectItem>
                  <SelectItem value="used">
                    {dynamicLabel(t, "used")}
                  </SelectItem>
                  <SelectItem value="showroom">
                    {dynamicLabel(t, "showroom")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </AppField>
            <AppField label={t("labels.price")}>
              <Input
                type="number"
                value={draft.price ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    price: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("labels.costPrice")}>
              <Input
                type="number"
                value={draft.costPrice ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    costPrice: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("labels.stockQty")}>
              <Input
                type="number"
                value={draft.stockQty ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    stockQty: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField label={t("common.status")}>
              <Select
                value={draft.status ?? db.settings.defaultProductStatus}
                onValueChange={(value) =>
                  setDraft((current) => ({
                    ...current,
                    status: value,
                  }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">
                    {dynamicLabel(t, "draft")}
                  </SelectItem>
                  <SelectItem value="active">
                    {dynamicLabel(t, "active")}
                  </SelectItem>
                  <SelectItem value="archived">
                    {dynamicLabel(t, "archived")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </AppField>
            <AppField
              label={t("labels.shortDescription")}
              className="md:col-span-2"
            >
              <Textarea
                value={draft.shortDescription ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    shortDescription: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField
              label={t("labels.fullDescription")}
              className="md:col-span-2"
            >
              <Textarea
                value={draft.description ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField
              label={t("labels.imagesPerLine")}
              className="md:col-span-2"
            >
              <Textarea
                value={draft.images ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    images: event.target.value,
                  }))
                }
              />
            </AppField>
            <AppField
              label={t("labels.specsKeyValue")}
              className="md:col-span-2"
            >
              <Textarea
                value={draft.specs ?? ""}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    specs: event.target.value,
                  }))
                }
              />
            </AppField>
            <DialogFooter className="md:col-span-2">
              <Button type="submit">{t("common.save")}</Button>
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setFormError("");
                  resetDraft();
                  setIsEditorOpen(false);
                }}
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
            <AlertDialogAction
              onClick={() => {
                if (!deleteTargetId) {
                  return;
                }

                void deleteEntity("products", deleteTargetId).then(() =>
                  setDeleteTargetId(null),
                );
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

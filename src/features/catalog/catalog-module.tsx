"use client";

import { Pen, Trash2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { BrandsModule } from "@/features/brands/brands-module";
import { CategoriesModule } from "@/features/categories/categories-module";
import { MediaModule } from "@/features/media/media-module";
import { Locale } from "@/i18n";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, parseList } from "@/lib/utils";
import { ModuleSection } from "@/shared/components/module-shell";
import { useCatalogStore } from "@/store/music-store";

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
  const { products, categories, brands, settings, saveProduct, deleteEntity } =
    useCatalogStore();
  const [query, setQuery] = useState("");
  const [formError, setFormError] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draft, setDraft] = useState<ProductDraft>({
    status: settings.defaultProductStatus,
    condition: "new",
  });

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return products;
    return products.filter((product) =>
      `${product.name} ${product.sku} ${product.shortDescription}`
        .toLowerCase()
        .includes(value),
    );
  }, [products, query]);

  const categoryMap = Object.fromEntries(
    categories.map((item) => [item.id, item.name]),
  );
  const brandMap = Object.fromEntries(
    brands.map((item) => [item.id, item.name]),
  );

  function resetDraft() {
    setDraft({
      status: settings.defaultProductStatus,
      condition: "new",
    });
  }

  async function submit() {
    const parsed = productSchema.safeParse(draft);
    if (!parsed.success) {
      setFormError(t("labels.validationFailed"));
      return;
    }
    setIsSaving(true);
    const specs = Object.fromEntries(
      parseList(draft.specs ?? "").map((row) => {
        const [key, ...rest] = row.split(":");
        return [key.trim(), rest.join(":").trim()];
      }),
    );
    try {
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
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t("common.unexpectedError"),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Tabs defaultValue="products" className="space-y-4">
        <ModuleSection>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="products">{t("labels.product")}</TabsTrigger>
            <TabsTrigger value="categories">{t("nav.categories")}</TabsTrigger>
            <TabsTrigger value="brands">{t("nav.brands")}</TabsTrigger>
            <TabsTrigger value="media">{t("nav.media")}</TabsTrigger>
          </TabsList>
        </ModuleSection>

        <TabsContent value="products" className="mt-0">
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
                    const previewImage =
                      product.primaryImage ?? product.images[0];

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
                            <div className="muted">
                              {product.shortDescription}
                            </div>
                          </div>
                          <div className="muted">{product.sku}</div>
                        </TableCell>
                        <TableCell>{categoryMap[product.categoryId]}</TableCell>
                        <TableCell>{brandMap[product.brandId]}</TableCell>
                        <TableCell>
                          {formatMoney(
                            product.price,
                            settings.currency,
                            locale,
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              product.stockQty <= settings.lowStockThreshold
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
                                        shortDescription:
                                          product.shortDescription,
                                        description: product.description,
                                        condition: product.condition,
                                        images: product.images.join("\n"),
                                        specs: Object.entries(product.specs)
                                          .map(
                                            ([key, value]) =>
                                              `${key}: ${value}`,
                                          )
                                          .join("\n"),
                                      });
                                      setIsEditorOpen(true);
                                    }}
                                  >
                                    <Pen />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {t("common.edit")}
                                </TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="icon"
                                    type="button"
                                    disabled={isSaving || isDeleting}
                                    aria-label={t("common.delete")}
                                    onClick={() =>
                                      setDeleteTargetId(product.id)
                                    }
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
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </section>
        </TabsContent>

        <TabsContent value="categories" className="mt-0">
          <CategoriesModule />
        </TabsContent>

        <TabsContent value="brands" className="mt-0">
          <BrandsModule />
        </TabsContent>

        <TabsContent value="media" className="mt-0">
          <MediaModule />
        </TabsContent>
      </Tabs>

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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                  {categories.map((item) => (
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
                disabled={isSaving}
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
                  {brands.map((item) => (
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                value={draft.status ?? settings.defaultProductStatus}
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
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
                disabled={isSaving}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    specs: event.target.value,
                  }))
                }
              />
            </AppField>
            <DialogFooter className="md:col-span-2">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? t("common.saving") : t("common.save")}
              </Button>
              <Button
                variant="outline"
                type="button"
                disabled={isSaving}
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
              onClick={async () => {
                if (!deleteTargetId) {
                  return;
                }
                setFormError("");
                setIsDeleting(true);
                try {
                  await deleteEntity("products", deleteTargetId);
                  setDeleteTargetId(null);
                } catch (error) {
                  setFormError(
                    error instanceof Error
                      ? error.message
                      : t("common.unexpectedError"),
                  );
                } finally {
                  setIsDeleting(false);
                }
              }}
            >
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

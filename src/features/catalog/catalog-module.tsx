"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pen, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

import { AppField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
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
import { CategoriesModule } from "@/features/categories/categories-module";
import { useCatalogQuery } from "@/hooks/use-catalog-query";
import { Locale } from "@/i18n";
import { normalizeProductBrand } from "@/lib/product-brand";
import { invalidateAppQueries } from "@/lib/query-utils";
import {
  getDictionarySelectOptions,
  getDictionaryValues,
} from "@/lib/runtime-config";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney, parseList } from "@/lib/utils";
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/services/catalog";
import { ModuleSection } from "@/shared/components/module-shell";
import { Condition, ProductStatus } from "@/types/music";

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(3),
  price: z.coerce.number().min(1),
  costPrice: z.coerce.number().min(1),
  stockQty: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  brand: z.string().min(2),
  shortDescription: z.string().min(4),
  description: z.string().min(4),
  status: z.string().min(1),
  condition: z.string().min(1),
});

type ProductDraft = Record<string, string>;

const ALL_CATEGORIES_VALUE = "__all_categories__";
const ALL_BRANDS_VALUE = "__all_brands__";

export function CatalogModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data, isPending } = useCatalogQuery();
  const products = useMemo(() => data?.products ?? [], [data?.products]);
  const categories = data?.categories ?? [];
  const productStatuses = getDictionaryValues<ProductStatus>(
    data?.dictionaries.productStatuses,
    ["draft", "active", "archived"] as const,
  );
  const conditionOptions = getDictionarySelectOptions(
    t,
    data?.dictionaries.conditions,
    ["new", "used", "showroom"] as const,
  );
  const conditionValues = conditionOptions.map(
    (option) => option.value,
  ) as Condition[];
  const settings = data?.settings ?? {
    currency: "UZS",
    lowStockThreshold: 0,
    defaultProductStatus: "draft" as const,
    defaultMarkupPercent: 0,
  };
  const saveMutation = useMutation({
    mutationFn: async (
      input: Parameters<typeof createProduct>[0] & { id?: string },
    ) => {
      if (input.id) {
        const { id, ...payload } = input;
        await updateProduct(id, payload);
        return;
      }

      await createProduct(input);
    },
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(ALL_CATEGORIES_VALUE);
  const [brandFilter, setBrandFilter] = useState(ALL_BRANDS_VALUE);
  const [formError, setFormError] = useState("");
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [draft, setDraft] = useState<ProductDraft>({
    status: "draft",
    condition: conditionValues[0] ?? "new",
    primaryImage: "",
  });

  const categoryMap = Object.fromEntries(
    categories.map((item) => [item.id, item.name]),
  );
  const availableBrands = useMemo(
    () =>
      Array.from(
        new Set(
          products
            .map((product) => normalizeProductBrand(product.brand))
            .filter((brand) => brand.length > 0),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [products],
  );
  const draftImages = useMemo(() => parseList(draft.images ?? ""), [draft.images]);

  useEffect(() => {
    if (!isEditorOpen) {
      return;
    }

    const nextPrimaryImage = draftImages.includes(draft.primaryImage ?? "")
      ? draft.primaryImage ?? ""
      : (draftImages[0] ?? "");

    if ((draft.primaryImage ?? "") !== nextPrimaryImage) {
      setDraft((current) => ({
        ...current,
        primaryImage: nextPrimaryImage,
      }));
    }
  }, [draft.primaryImage, draftImages, isEditorOpen]);

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase();

    return products.filter((product) => {
      const matchesQuery =
        !value ||
        `${product.name} ${product.sku} ${product.shortDescription} ${normalizeProductBrand(product.brand)}`
          .toLowerCase()
          .includes(value);
      const matchesCategory =
        categoryFilter === ALL_CATEGORIES_VALUE ||
        product.categoryId === categoryFilter;
      const matchesBrand =
        brandFilter === ALL_BRANDS_VALUE ||
        normalizeProductBrand(product.brand) === brandFilter;

      return matchesQuery && matchesCategory && matchesBrand;
    });
  }, [brandFilter, categoryFilter, products, query]);

  function resetDraft() {
    setDraft({
      status: settings.defaultProductStatus,
      condition: conditionValues[0] ?? "new",
      primaryImage: "",
    });
  }

  function openCreateDialog() {
    setFormError("");
    resetDraft();
    setIsEditorOpen(true);
  }

  function openEditDialog(productId: string) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    setFormError("");
    setDraft({
      id: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode ?? "",
      categoryId: product.categoryId,
      brand: normalizeProductBrand(product.brand),
      price: String(product.price),
      costPrice: String(product.costPrice),
      stockQty: String(product.stockQty),
      status: product.status,
      shortDescription: product.shortDescription,
      description: product.description,
      condition: product.condition,
      primaryImage: product.primaryImage ?? product.images[0] ?? "",
      images: product.images.join("\n"),
      specs: Object.entries(product.specs)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n"),
    });
    setIsEditorOpen(true);
  }

  async function submit() {
    const parsed = productSchema.safeParse(draft);
    const images = parseList(draft.images ?? "");

    if (!parsed.success || images.length === 0) {
      setFormError(t("labels.validationFailed"));
      return;
    }

    if (
      !productStatuses.includes(parsed.data.status as ProductStatus) ||
      !conditionValues.includes(parsed.data.condition as Condition)
    ) {
      setFormError(t("labels.validationFailed"));
      return;
    }

    const specs = Object.fromEntries(
      parseList(draft.specs ?? "").map((row) => {
        const [key, ...rest] = row.split(":");
        return [key.trim(), rest.join(":").trim()];
      }),
    );
    const primaryImage = images.includes(draft.primaryImage ?? "")
      ? draft.primaryImage
      : images[0];

    try {
      await saveMutation.mutateAsync({
        id: draft.id,
        ...parsed.data,
        brand: parsed.data.brand.trim(),
        barcode: draft.barcode,
        specs,
        images,
        primaryImage,
        status: parsed.data.status as ProductStatus,
        condition: parsed.data.condition as Condition,
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
    }
  }

  const isSaving = saveMutation.isPending;
  const isDeleting = deleteMutation.isPending;

  if (isPending || !data) {
    return (
      <section className="table-card">
        <div className="empty-state">{t("common.loadingWorkspace")}</div>
      </section>
    );
  }

  return (
    <>
      <Tabs defaultValue="products" className="space-y-4">
        <ModuleSection>
          <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
            <TabsTrigger value="products">{t("labels.product")}</TabsTrigger>
            <TabsTrigger value="categories">{t("nav.categories")}</TabsTrigger>
          </TabsList>
        </ModuleSection>

        <TabsContent value="products" className="mt-0">
          <section className="table-card">
            <PageHeader
              title={t("labels.product")}
              subtitle={t("section.catalogSubtitle")}
              actions={
                <>
                  <Input
                    className="w-full min-w-[220px] md:w-72"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={t("common.search")}
                  />
                  <Select
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full min-w-[220px] md:w-64">
                      <SelectValue placeholder={t("labels.category")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_CATEGORIES_VALUE}>
                        {t("common.select")} {t("labels.category")}
                      </SelectItem>
                      {categories.map((item) => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={brandFilter} onValueChange={setBrandFilter}>
                    <SelectTrigger className="w-full min-w-[220px] md:w-64">
                      <SelectValue placeholder={t("labels.brand")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ALL_BRANDS_VALUE}>
                        {t("common.select")} {t("labels.brand")}
                      </SelectItem>
                      {availableBrands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={openCreateDialog}>
                    {t("common.addNew")}
                  </Button>
                </>
              }
            />
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
                    <TableHead>{t("labels.availability")}</TableHead>
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
                        <TableCell>
                          {normalizeProductBrand(product.brand)}
                        </TableCell>
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
                              product.stockQty > 0 ? "success" : "destructive"
                            }
                          >
                            {product.stockQty > 0
                              ? t("labels.inStock")
                              : t("labels.outOfStock")}
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
                                    onClick={() => openEditDialog(product.id)}
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
              <Input
                value={draft.brand ?? ""}
                disabled={isSaving}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    brand: event.target.value,
                  }))
                }
              />
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
                  {conditionOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
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
                  {productStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {dynamicLabel(t, status)}
                    </SelectItem>
                  ))}
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
            {draftImages.length > 0 ? (
              <div className="media-grid md:col-span-2">
                {draftImages.map((image) => {
                  const isPrimary = (draft.primaryImage ?? "") === image;

                  return (
                    <div key={image} className="media-tile">
                      <div className="art-preview">
                        <Image
                          src={image}
                          alt={draft.name ?? image}
                          width={640}
                          height={480}
                          className="media-image"
                        />
                      </div>
                      <div className="stack-row spread">
                        <span>{image.split("/").pop()}</span>
                        {isPrimary ? (
                          <Badge variant="success">{t("labels.primary")}</Badge>
                        ) : null}
                      </div>
                      {!isPrimary ? (
                        <Button
                          variant="outline"
                          type="button"
                          disabled={isSaving}
                          onClick={() =>
                            setDraft((current) => ({
                              ...current,
                              primaryImage: image,
                            }))
                          }
                        >
                          {t("labels.setPrimary")}
                        </Button>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            ) : null}
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
                try {
                  await deleteMutation.mutateAsync(deleteTargetId);
                  setDeleteTargetId(null);
                } catch (error) {
                  setFormError(
                    error instanceof Error
                      ? error.message
                      : t("common.unexpectedError"),
                  );
                }
              }}
            >
              {isDeleting ? t("common.deleting") : t("common.delete")}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isDeleting}>
              {t("common.cancel")}
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

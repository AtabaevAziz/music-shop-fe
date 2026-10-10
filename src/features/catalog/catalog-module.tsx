"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pen, Plus, Trash2 } from "lucide-react";
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
import {
  normalizeOptionalString,
  requiredTrimmedString,
} from "@/lib/form-utils";
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
import type { ProductVariantRequest } from "@/services/products/products-types";
import { ModuleSection } from "@/shared/components/module-shell";
import { Condition, ProductStatus } from "@/types/music";

const productSchema = z.object({
  name: requiredTrimmedString(2),
  sku: requiredTrimmedString(3),
  price: z.coerce.number().min(1),
  costPrice: z.coerce.number().min(1),
  stockQty: z.coerce.number().min(0),
  categoryId: z.string().min(1),
  brand: requiredTrimmedString(2),
  shortDescription: requiredTrimmedString(4),
  description: requiredTrimmedString(4),
  status: z.string().min(1),
  condition: z.string().min(1),
});

type ProductDraft = Record<string, string>;

type VariantDraft = {
  colorKey: string;
  colorName: string;
  sku: string;
  barcode: string;
  price: string;
  costPrice: string;
  stockQty: string;
  minStockQty: string;
  status: ProductStatus;
  images: string;
  primaryImage: string;
};

function emptyVariantDraft(): VariantDraft {
  return {
    colorKey: "",
    colorName: "",
    sku: "",
    barcode: "",
    price: "",
    costPrice: "",
    stockQty: "0",
    minStockQty: "",
    status: "draft",
    images: "",
    primaryImage: "",
  };
}

function parseVariantDrafts(value: string): VariantDraft[] {
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((item) => {
      const value = item as Record<string, unknown>;
      return {
        colorKey: String(value.colorKey ?? ""),
        colorName: String(value.colorName ?? ""),
        sku: String(value.sku ?? ""),
        barcode: String(value.barcode ?? ""),
        price: String(value.price ?? ""),
        costPrice: String(value.costPrice ?? ""),
        stockQty: String(value.stockQty ?? "0"),
        minStockQty: String(value.minStockQty ?? ""),
        status: String(value.status ?? "draft") as ProductStatus,
        images: Array.isArray(value.images)
          ? value.images.map(String).join("\n")
          : "",
        primaryImage: String(value.primaryImage ?? ""),
      };
    });
  } catch {
    return [];
  }
}

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
  const [variantRows, setVariantRows] = useState<VariantDraft[]>([]);
  const [draft, setDraft] = useState<ProductDraft>({
    status: "draft",
    condition: conditionValues[0] ?? "new",
    primaryImage: "",
    variants: "[]",
  });
  setVariantRows([]);

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
  const draftImages = useMemo(
    () => parseList(draft.images ?? ""),
    [draft.images],
  );

  useEffect(() => {
    if (!isEditorOpen) {
      return;
    }

    const nextPrimaryImage = draftImages.includes(draft.primaryImage ?? "")
      ? (draft.primaryImage ?? "")
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
      variants: "[]",
      repairable: "false",
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
      repairable: String(product.repairable),
      primaryImage: product.primaryImage ?? product.images[0] ?? "",
      images: product.images.join("\n"),
      specs: Object.entries(product.specs)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n"),
      variants: JSON.stringify(product.variants ?? [], null, 2),
    });
    setVariantRows(parseVariantDrafts(JSON.stringify(product.variants ?? [])));
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
    const colorKeys = new Set<string>();
    const skus = new Set<string>();
    let variants: ProductVariantRequest[] = [];
    try {
      variants = variantRows.map((variant) => {
        const colorKey = variant.colorKey.trim().toLowerCase();
        const sku = variant.sku.trim();
        const images = parseList(variant.images);
        if (
          !colorKey ||
          !variant.colorName.trim() ||
          !sku ||
          images.length === 0
        ) {
          throw new Error(t("labels.validationFailed"));
        }
        if (colorKeys.has(colorKey) || skus.has(sku)) {
          throw new Error(t("labels.validationFailed"));
        }
        colorKeys.add(colorKey);
        skus.add(sku);
        return {
          colorKey,
          colorName: variant.colorName.trim(),
          sku,
          barcode: normalizeOptionalString(variant.barcode),
          price: Number(variant.price),
          costPrice: Number(variant.costPrice),
          stockQty: Number(variant.stockQty),
          minStockQty: variant.minStockQty
            ? Number(variant.minStockQty)
            : undefined,
          status: variant.status,
          images,
          primaryImage: images.includes(variant.primaryImage)
            ? variant.primaryImage
            : images[0],
        };
      });
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : t("labels.validationFailed"),
      );
      return;
    }

    try {
      await saveMutation.mutateAsync({
        id: draft.id,
        ...parsed.data,
        barcode: normalizeOptionalString(draft.barcode),
        specs,
        images,
        primaryImage,
        status: parsed.data.status as ProductStatus,
        condition: parsed.data.condition as Condition,
        repairable: draft.repairable === "true",
        price: Number(draft.price),
        costPrice: Number(draft.costPrice),
        stockQty: Number(draft.stockQty),
        variants,
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
                    <TableHead>{t("labels.variants")}</TableHead>
                    <TableHead>{t("labels.price")}</TableHead>
                    <TableHead>{t("labels.stock")}</TableHead>
                    <TableHead>{t("labels.repairable")}</TableHead>
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
                            <div className="product-thumb-frame">
                              <Image
                                src={previewImage}
                                alt={product.name}
                                width={96}
                                height={72}
                                className="product-thumb"
                              />
                            </div>
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
                        <TableCell>{product.variants?.length ?? 0}</TableCell>
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
                            variant={product.repairable ? "success" : "outline"}
                          >
                            {product.repairable
                              ? t("common.yes")
                              : t("common.no")}
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
            <label className="surface flex items-center gap-3 rounded-xl p-4 text-sm font-medium md:col-span-2">
              <input
                type="checkbox"
                checked={draft.repairable === "true"}
                disabled={isSaving}
                onChange={(event) =>
                  setDraft((current) => ({
                    ...current,
                    repairable: String(event.target.checked),
                  }))
                }
              />
              {t("labels.repairable")}
            </label>
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
            <section className="surface grid gap-4 rounded-xl p-4 md:col-span-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <strong>{t("labels.variants")}</strong>
                  <div className="muted">{t("labels.variantEditorHelp")}</div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSaving}
                  onClick={() =>
                    setVariantRows((current) => [
                      ...current,
                      emptyVariantDraft(),
                    ])
                  }
                >
                  <Plus size={16} />
                  {t("common.addNew")}
                </Button>
              </div>
              {variantRows.map((variant, index) => (
                <div
                  key={`${variant.colorKey}-${index}`}
                  className="grid gap-3 rounded-xl border p-4 md:grid-cols-2"
                >
                  <AppField label={t("labels.colorKey")}>
                    <Input
                      value={variant.colorKey}
                      disabled={isSaving}
                      onChange={(event) =>
                        setVariantRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, colorKey: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </AppField>
                  <AppField label={t("labels.color")}>
                    <Input
                      value={variant.colorName}
                      disabled={isSaving}
                      onChange={(event) =>
                        setVariantRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, colorName: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </AppField>
                  <AppField label={t("labels.sku")}>
                    <Input
                      value={variant.sku}
                      disabled={isSaving}
                      onChange={(event) =>
                        setVariantRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, sku: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </AppField>
                  <AppField label={t("labels.barcode")}>
                    <Input
                      value={variant.barcode}
                      disabled={isSaving}
                      onChange={(event) =>
                        setVariantRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, barcode: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </AppField>
                  <AppField label={t("labels.price")}>
                    <Input
                      type="number"
                      min="1"
                      value={variant.price}
                      disabled={isSaving}
                      onChange={(event) =>
                        setVariantRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, price: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </AppField>
                  <AppField label={t("labels.costPrice")}>
                    <Input
                      type="number"
                      min="1"
                      value={variant.costPrice}
                      disabled={isSaving}
                      onChange={(event) =>
                        setVariantRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, costPrice: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </AppField>
                  <AppField label={t("labels.stockQty")}>
                    <Input
                      type="number"
                      min="0"
                      value={variant.stockQty}
                      disabled={isSaving}
                      onChange={(event) =>
                        setVariantRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, stockQty: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </AppField>
                  <AppField label={t("labels.minStockQty")}>
                    <Input
                      type="number"
                      min="0"
                      value={variant.minStockQty}
                      disabled={isSaving}
                      onChange={(event) =>
                        setVariantRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, minStockQty: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </AppField>
                  <AppField label={t("common.status")}>
                    <Select
                      value={variant.status}
                      disabled={isSaving}
                      onValueChange={(value) =>
                        setVariantRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, status: value as ProductStatus }
                              : item,
                          ),
                        )
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
                    label={t("labels.imagesPerLine")}
                    className="md:col-span-2"
                  >
                    <Textarea
                      value={variant.images}
                      disabled={isSaving}
                      onChange={(event) =>
                        setVariantRows((current) =>
                          current.map((item, itemIndex) =>
                            itemIndex === index
                              ? { ...item, images: event.target.value }
                              : item,
                          ),
                        )
                      }
                    />
                  </AppField>
                  <div className="flex items-end justify-between gap-3 md:col-span-2">
                    <AppField
                      label={t("labels.primary")}
                      className="min-w-0 flex-1"
                    >
                      <Input
                        value={variant.primaryImage}
                        disabled={isSaving}
                        onChange={(event) =>
                          setVariantRows((current) =>
                            current.map((item, itemIndex) =>
                              itemIndex === index
                                ? { ...item, primaryImage: event.target.value }
                                : item,
                            ),
                          )
                        }
                      />
                    </AppField>
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      disabled={isSaving}
                      aria-label={t("common.delete")}
                      onClick={() =>
                        setVariantRows((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
              {variantRows.length === 0 ? (
                <div className="empty-state">{t("labels.noVariants")}</div>
              ) : null}
            </section>
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

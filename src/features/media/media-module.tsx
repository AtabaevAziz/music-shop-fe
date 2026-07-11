"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useEffect, useState } from "react";

import { AppField } from "@/components/shared/form-field";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMediaQuery } from "@/hooks/use-media-query";
import { invalidateAppQueries } from "@/lib/query-utils";
import { attachProductImage, setProductPrimaryImage } from "@/services/catalog";
import { ModuleSection } from "@/shared/components/module-shell";

export function MediaModule() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { data } = useMediaQuery();
  const products = data?.products ?? [];
  const [productId, setProductId] = useState("");
  const [label, setLabel] = useState("");
  const [formError, setFormError] = useState("");
  const addImageMutation = useMutation({
    mutationFn: async ({ productId, label }: { productId: string; label: string }) =>
      attachProductImage(productId, { image: label }),
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });
  const promoteImageMutation = useMutation({
    mutationFn: async ({
      productId,
      label,
    }: {
      productId: string;
      label: string;
    }) => setProductPrimaryImage(productId, { image: label }),
    onSuccess: async () => {
      await invalidateAppQueries(queryClient);
    },
  });
  const product = products.find((item) => item.id === productId);

  useEffect(() => {
    if (!productId && products[0]?.id) {
      setProductId(products[0].id);
    }
  }, [productId, products]);

  return (
    <div className="two-columns">
      <ModuleSection
        title={t("nav.media")}
        subtitle={t("section.mediaSubtitle")}
      >
        <form
          className="grid gap-4"
          onSubmit={async (event) => {
            event.preventDefault();
            setFormError("");
            try {
              await addImageMutation.mutateAsync({
                productId,
                label: label.trim(),
              });
              setLabel("");
            } catch (error) {
              setFormError(
                error instanceof Error
                  ? error.message
                  : t("common.unexpectedError"),
              );
            }
          }}
        >
          {formError ? <div className="error">{formError}</div> : null}
          <AppField label={t("labels.product")}>
            <Select
              value={productId}
              disabled={
                addImageMutation.isPending || promoteImageMutation.isPending
              }
              onValueChange={setProductId}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("labels.product")} />
              </SelectTrigger>
              <SelectContent>
                {products.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AppField>
          <AppField label={t("labels.imagePath")}>
            <Input
              value={label}
              disabled={addImageMutation.isPending}
              onChange={(event) => setLabel(event.target.value)}
            />
          </AppField>
          <div className="flex gap-2">
            <Button type="submit" disabled={addImageMutation.isPending}>
              {addImageMutation.isPending
                ? t("common.saving")
                : t("common.save")}
            </Button>
          </div>
        </form>
      </ModuleSection>
      <ModuleSection>
        <PageHeader
          title={product?.name ?? t("nav.media")}
          subtitle={t("labels.productGalleryPreviewSubtitle")}
        />
        {product ? (
          <div className="media-grid">
            {product.images.map((image) => (
              <div key={image} className="media-tile">
                <div className="art-preview">
                  {image ? (
                    <Image
                      src={image}
                      alt={product.name}
                      width={640}
                      height={480}
                      className="media-image"
                    />
                  ) : null}
                </div>
                <div className="stack-row spread">
                  <span>{image.split("/").pop()}</span>
                  {product.primaryImage === image ? (
                    <Badge variant="success">{t("labels.primary")}</Badge>
                  ) : null}
                </div>
                {product.primaryImage !== image ? (
                  <Button
                    variant="outline"
                    type="button"
                    disabled={promoteImageMutation.isPending}
                    onClick={async () => {
                      setFormError("");
                      try {
                        await promoteImageMutation.mutateAsync({
                          productId: product.id,
                          label: image,
                        });
                      } catch (error) {
                        setFormError(
                          error instanceof Error
                            ? error.message
                            : t("common.unexpectedError"),
                        );
                      }
                    }}
                  >
                    {t("labels.setPrimary")}
                  </Button>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">{t("common.noData")}</div>
        )}
      </ModuleSection>
    </div>
  );
}

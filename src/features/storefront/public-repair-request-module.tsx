"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useStorefrontProductsQuery } from "@/hooks/use-storefront-query";
import { Locale } from "@/i18n";
import {
  normalizeRequiredString,
  optionalTrimmedEmail,
  optionalTrimmedUrl,
  requiredTrimmedString,
} from "@/lib/form-utils";
import { createPublicRepair } from "@/services/public";

const repairSchema = z.object({
  customerName: requiredTrimmedString(2),
  phone: requiredTrimmedString(6),
  email: optionalTrimmedEmail(),
  instrumentType: requiredTrimmedString(2),
  instrumentModel: requiredTrimmedString(2),
  issueDescription: requiredTrimmedString(8),
  photoUrl: optionalTrimmedUrl(),
});

type RepairFormValues = z.infer<typeof repairSchema>;

export function PublicRepairRequestModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const searchParams = useSearchParams();
  const { data: products } = useStorefrontProductsQuery();
  const [repairRequestId, setRepairRequestId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const repairableProducts = useMemo(
    () => (products ?? []).filter((product) => product.repairable),
    [products],
  );
  const form = useForm<RepairFormValues>({
    resolver: zodResolver(repairSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      instrumentType: "",
      instrumentModel: "",
      issueDescription: "",
      photoUrl: "",
    },
  });
  const selectedProduct = repairableProducts.find(
    (product) => product.id === selectedProductId,
  );

  useEffect(() => {
    const productId = searchParams.get("productId") ?? "";
    const variantId = searchParams.get("variantId") ?? "";
    const product = repairableProducts.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    setSelectedProductId(product.id);
    setSelectedVariantId(variantId || product.variants[0]?.id || "");
    form.setValue("instrumentType", product.category.name);
    form.setValue("instrumentModel", product.name);
  }, [form, repairableProducts, searchParams]);
  const repairMutation = useMutation({
    mutationFn: createPublicRepair,
    onSuccess: (repairRequest) => {
      setRepairRequestId(repairRequest.id);
      form.reset();
      setSelectedProductId("");
      setSelectedVariantId("");
    },
  });

  async function submit(values: RepairFormValues) {
    await repairMutation.mutateAsync({
      productId: selectedProductId || undefined,
      variantId: selectedVariantId || undefined,
      customerName: normalizeRequiredString(values.customerName),
      phone: normalizeRequiredString(values.phone),
      email: values.email,
      instrumentType: normalizeRequiredString(values.instrumentType),
      instrumentModel: normalizeRequiredString(values.instrumentModel),
      issueDescription: normalizeRequiredString(values.issueDescription),
      photoUrl: values.photoUrl,
    });
  }

  return (
    <div className="storefront-flow">
      <section className="storefront-section storefront-section-tight">
        <div className="storefront-section-head">
          <div className="storefront-section-title">
            <h1>{t("storefront.repairPageTitle")}</h1>
          </div>
          <div className="storefront-section-copy">
            <p>{t("storefront.repairPageText")}</p>
          </div>
        </div>
      </section>

      {repairRequestId ? (
        <Card className="storefront-empty-card">
          <CardContent className="grid gap-4 p-6 text-center">
            <strong>{t("storefront.repairRequestPlacedTitle")}</strong>
            <p className="muted">
              {t("storefront.repairRequestPlacedText", {
                repairId: repairRequestId,
              })}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button type="button" onClick={() => setRepairRequestId(null)}>
                {t("labels.requestRepair")}
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${locale}/catalog`}>
                  {t("storefront.continueShopping")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="storefront-product-card">
          <CardContent className="p-5">
            <Form {...form}>
              <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("labels.name")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("labels.phone")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("labels.emailOptional")}</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <label className="text-sm font-medium">
                      {t("labels.repairProductOptional")}
                    </label>
                    <Select
                      value={selectedProductId || "__manual__"}
                      onValueChange={(value) => {
                        if (value === "__manual__") {
                          setSelectedProductId("");
                          setSelectedVariantId("");
                          return;
                        }
                        const product = repairableProducts.find(
                          (item) => item.id === value,
                        );
                        setSelectedProductId(value);
                        setSelectedVariantId(product?.variants[0]?.id ?? "");
                        if (product) {
                          form.setValue(
                            "instrumentType",
                            product.category.name,
                          );
                          form.setValue("instrumentModel", product.name);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t("common.select")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__manual__">
                          {t("labels.manualInstrument")}
                        </SelectItem>
                        {repairableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {selectedProduct && selectedProduct.variants.length > 1 ? (
                    <div className="grid gap-2">
                      <label className="text-sm font-medium">
                        {t("labels.color")}
                      </label>
                      <Select
                        value={
                          selectedVariantId || selectedProduct.variants[0]?.id
                        }
                        onValueChange={setSelectedVariantId}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {selectedProduct.variants.map((variant) => (
                            <SelectItem key={variant.id} value={variant.id}>
                              {variant.colorName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ) : null}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="instrumentType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("labels.instrumentType")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instrumentModel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("labels.instrumentModel")}</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="issueDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("labels.repairIssue")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="photoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("labels.photoUrlOptional")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {repairMutation.error ? (
                  <div className="error">
                    {repairMutation.error instanceof Error
                      ? repairMutation.error.message
                      : t("common.unexpectedError")}
                  </div>
                ) : null}

                <Button type="submit" disabled={repairMutation.isPending}>
                  {repairMutation.isPending
                    ? t("common.saving")
                    : t("labels.requestRepair")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Badge } from "@/components/ui/badge";
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
import {
  getStorefrontCartItemsCount,
  getStorefrontCartTotal,
  useStorefrontCartStore,
} from "@/features/storefront/storefront-cart-store";
import { useAppConfigQuery } from "@/hooks/use-config-query";
import { Locale } from "@/i18n";
import {
  normalizeOptionalString,
  normalizeRequiredString,
  optionalTrimmedEmail,
  optionalTrimmedString,
  requiredTrimmedString,
} from "@/lib/form-utils";
import { dynamicLabel } from "@/lib/translations";
import { formatMoney } from "@/lib/utils";
import { createPublicOrder } from "@/services/public";
import type { Order } from "@/types/music";

const checkoutSchema = z.object({
  firstName: requiredTrimmedString(2),
  lastName: requiredTrimmedString(2),
  phone: requiredTrimmedString(6),
  email: optionalTrimmedEmail(),
  country: requiredTrimmedString(2),
  region: requiredTrimmedString(2),
  city: requiredTrimmedString(2),
  street: requiredTrimmedString(2),
  house: requiredTrimmedString(1),
  apartment: optionalTrimmedString(),
  postalCode: requiredTrimmedString(3),
  paymentMethod: z.enum(["cash", "online"]),
  deliveryMethod: z.enum(["pickup", "courier", "delivery_company", "post"]),
  deliveryCompany: optionalTrimmedString(),
  comment: optionalTrimmedString(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

type FieldSpec = {
  name: keyof CheckoutFormValues;
  label: string;
};

export function PublicCheckoutModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const hasHydrated = useStorefrontCartStore((state) => state.hasHydrated);
  const items = useStorefrontCartStore((state) => state.items);
  const clearCart = useStorefrontCartStore((state) => state.clearCart);
  const { data: appConfig } = useAppConfigQuery();
  const currency = appConfig?.defaultCurrency ?? "UZS";
  const totalItems = getStorefrontCartItemsCount(items);
  const total = getStorefrontCartTotal(items);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      country: "",
      region: "",
      city: "",
      street: "",
      house: "",
      apartment: "",
      postalCode: "",
      paymentMethod: "cash",
      deliveryMethod: "pickup",
      deliveryCompany: "",
      comment: "",
    },
  });
  const orderMutation = useMutation({
    mutationFn: createPublicOrder,
    onSuccess: (order) => {
      clearCart();
      setPlacedOrder(order);
      form.reset();
    },
  });

  const identityFields: FieldSpec[] = [
    { name: "firstName", label: t("labels.firstName") },
    { name: "lastName", label: t("labels.lastName") },
    { name: "phone", label: t("labels.phone") },
    { name: "email", label: t("labels.emailOptional") },
  ];
  const addressFields: FieldSpec[] = [
    { name: "country", label: t("labels.country") },
    { name: "region", label: t("labels.region") },
    { name: "city", label: t("labels.city") },
    { name: "street", label: t("labels.street") },
    { name: "house", label: t("labels.house") },
    { name: "apartment", label: t("labels.apartment") },
    { name: "postalCode", label: t("labels.postalCode") },
  ];

  if (!hasHydrated) {
    return (
      <div className="storefront-flow">
        <Card className="storefront-empty-card">
          <CardContent className="p-6">
            <div className="empty-state">{t("common.loadingWorkspace")}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  async function submit(values: CheckoutFormValues) {
    await orderMutation.mutateAsync({
      firstName: normalizeRequiredString(values.firstName),
      lastName: normalizeRequiredString(values.lastName),
      phone: normalizeRequiredString(values.phone),
      email: values.email,
      country: normalizeRequiredString(values.country),
      region: normalizeRequiredString(values.region),
      city: normalizeRequiredString(values.city),
      street: normalizeRequiredString(values.street),
      house: normalizeRequiredString(values.house),
      apartment: normalizeOptionalString(values.apartment),
      postalCode: normalizeRequiredString(values.postalCode),
      paymentMethod: values.paymentMethod,
      deliveryMethod: values.deliveryMethod,
      deliveryCompany: normalizeOptionalString(values.deliveryCompany),
      comment: normalizeOptionalString(values.comment),
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
      })),
    });
  }

  if (placedOrder) {
    return (
      <div className="storefront-flow">
        <Card className="storefront-empty-card">
          <CardContent className="grid gap-4 p-6 text-center">
            <strong>{t("storefront.orderPlacedTitle")}</strong>
            <p className="muted">
              {t("storefront.orderPlacedText", {
                orderId: placedOrder.orderNumber,
              })}
            </p>
            <div className="grid gap-2 text-left">
              <div>
                <strong>{placedOrder.customer.name}</strong>
              </div>
              <div className="muted">{placedOrder.address.formatted}</div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  {dynamicLabel(t, placedOrder.status)}
                </Badge>
                <Badge
                  variant={
                    placedOrder.paymentStatus === "paid"
                      ? "success"
                      : placedOrder.paymentStatus === "failed" ||
                          placedOrder.paymentStatus === "cancelled" ||
                          placedOrder.paymentStatus === "refunded"
                        ? "destructive"
                        : "warning"
                  }
                >
                  {dynamicLabel(t, placedOrder.paymentStatus)}
                </Badge>
                <Badge variant="outline">
                  {dynamicLabel(t, placedOrder.deliveryMethod)}
                </Badge>
              </div>
              <div className="muted">
                {formatMoney(placedOrder.total, currency, locale)}
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href={`/${locale}/orders`}>
                  {t("storefront.trackOrderLink")}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/${locale}/catalog`}>
                  {t("storefront.continueShopping")}
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link href={`/${locale}/contacts`}>
                  {t("storefront.contactsPageTitle")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="storefront-flow">
        <Card className="storefront-empty-card">
          <CardContent className="grid gap-4 p-6 text-center">
            <div className="empty-state">{t("storefront.checkoutEmpty")}</div>
            <div className="flex justify-center">
              <Button asChild>
                <Link href={`/${locale}/catalog`}>
                  {t("storefront.continueShopping")}
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="storefront-flow">
      <section className="storefront-section storefront-section-tight">
        <div className="storefront-section-head">
          <div className="storefront-section-title">
            <h1>{t("storefront.checkoutPageTitle")}</h1>
          </div>
          <div className="storefront-section-copy">
            <p>{t("storefront.checkoutPageText")}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_340px]">
        <Card className="storefront-product-card">
          <CardContent className="p-5">
            <Form {...form}>
              <form className="grid gap-4" onSubmit={form.handleSubmit(submit)}>
                <div className="grid gap-4 md:grid-cols-2">
                  {identityFields.map((fieldSpec) => (
                    <FormField
                      key={fieldSpec.name}
                      control={form.control}
                      name={fieldSpec.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{fieldSpec.label}</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type={
                                fieldSpec.name === "email" ? "email" : "text"
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {addressFields.map((fieldSpec) => (
                    <FormField
                      key={fieldSpec.name}
                      control={form.control}
                      name={fieldSpec.name}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{fieldSpec.label}</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  ))}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("labels.paymentMethod")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="cash">
                              {t("labels.paymentCash")}
                            </SelectItem>
                            <SelectItem value="online">
                              {t("labels.paymentOnline")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="deliveryMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("labels.deliveryMethod")}</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pickup">
                              {t("dynamic.pickup")}
                            </SelectItem>
                            <SelectItem value="courier">
                              {t("dynamic.courier")}
                            </SelectItem>
                            <SelectItem value="delivery_company">
                              {t("dynamic.delivery_company")}
                            </SelectItem>
                            <SelectItem value="post">
                              {t("dynamic.post")}
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="deliveryCompany"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("labels.deliveryCompany")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="comment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("labels.commentOptional")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {orderMutation.error ? (
                  <div className="error">
                    {orderMutation.error instanceof Error
                      ? orderMutation.error.message
                      : t("common.unexpectedError")}
                  </div>
                ) : null}

                <Button type="submit" disabled={orderMutation.isPending}>
                  {orderMutation.isPending
                    ? t("common.saving")
                    : t("labels.placeOrder")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="storefront-product-card h-fit">
          <CardContent className="grid gap-4 p-5">
            <strong>{t("storefront.orderSummaryTitle")}</strong>
            <div className="grid gap-3">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between gap-3"
                >
                  <span className="muted">
                    {item.name} x {item.qty}
                  </span>
                  <strong>
                    {formatMoney(item.price * item.qty, currency, locale)}
                  </strong>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="muted">{t("storefront.cartItemsCount")}</span>
              <strong>{totalItems}</strong>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="muted">{t("labels.total")}</span>
              <strong>{formatMoney(total, currency, locale)}</strong>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

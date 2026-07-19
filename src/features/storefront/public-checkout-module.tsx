"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import Link from "next/link";
import { useState } from "react";
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
import { useAppConfigQuery } from "@/hooks/use-config-query";
import { Locale } from "@/i18n";
import { formatMoney } from "@/lib/utils";
import { createPublicOrder } from "@/services/public";
import {
  getStorefrontCartItemsCount,
  getStorefrontCartTotal,
  useStorefrontCartStore,
} from "@/features/storefront/storefront-cart-store";

const checkoutSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(4),
  paymentMethod: z.enum(["cash", "card", "transfer"]),
  comment: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

export function PublicCheckoutModule({ locale }: { locale: Locale }) {
  const t = useTranslations();
  const hasHydrated = useStorefrontCartStore((state) => state.hasHydrated);
  const items = useStorefrontCartStore((state) => state.items);
  const clearCart = useStorefrontCartStore((state) => state.clearCart);
  const { data: appConfig } = useAppConfigQuery();
  const currency = appConfig?.defaultCurrency ?? "UZS";
  const totalItems = getStorefrontCartItemsCount(items);
  const total = getStorefrontCartTotal(items);
  const [placedOrderId, setPlacedOrderId] = useState<string | null>(null);
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      phone: "",
      email: "",
      address: "",
      paymentMethod: "cash",
      comment: "",
    },
  });
  const orderMutation = useMutation({
    mutationFn: createPublicOrder,
    onSuccess: (order) => {
      clearCart();
      setPlacedOrderId(order.id);
      form.reset();
    },
  });

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
      customerName: values.customerName,
      phone: values.phone,
      email: values.email || undefined,
      address: values.address,
      paymentMethod: values.paymentMethod,
      comment: values.comment?.trim() || undefined,
      items: items.map((item) => ({
        productId: item.productId,
        qty: item.qty,
        unitPrice: item.price,
      })),
    });
  }

  if (placedOrderId) {
    return (
      <div className="storefront-flow">
        <Card className="storefront-empty-card">
          <CardContent className="grid gap-4 p-6 text-center">
            <strong>{t("storefront.orderPlacedTitle")}</strong>
            <p className="muted">
              {t("storefront.orderPlacedText", { orderId: placedOrderId })}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link href={`/${locale}/catalog`}>
                  {t("storefront.continueShopping")}
                </Link>
              </Button>
              <Button asChild variant="outline">
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

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("labels.address")}</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

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
                          <SelectItem value="card">
                            {t("labels.paymentCard")}
                          </SelectItem>
                          <SelectItem value="transfer">
                            {t("labels.paymentTransfer")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
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

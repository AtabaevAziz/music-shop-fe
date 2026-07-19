"use client";

import { useEffect } from "react";

import { useStorefrontCartStore } from "@/features/storefront/storefront-cart-store";
import { useStorefrontProductsQuery } from "@/hooks/use-storefront-query";

export function useStorefrontCartSync() {
  const hasHydrated = useStorefrontCartStore((state) => state.hasHydrated);
  const syncProducts = useStorefrontCartStore((state) => state.syncProducts);
  const { data: products } = useStorefrontProductsQuery();

  useEffect(() => {
    if (!hasHydrated || !products) {
      return;
    }

    syncProducts(products);
  }, [hasHydrated, products, syncProducts]);
}

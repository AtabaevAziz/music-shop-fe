"use client";

import { useQuery } from "@tanstack/react-query";

import { hasConfiguredApiBaseUrl } from "@/lib/api-config";
import { queryKeys } from "@/lib/query-keys";
import {
  getStorefrontProduct,
  getStorefrontProducts,
} from "@/services/storefront";

export function useStorefrontProductsQuery(search?: string) {
  return useQuery({
    enabled: hasConfiguredApiBaseUrl(),
    queryKey: [...queryKeys.storefrontCatalog, search ?? "all"],
    queryFn: () => getStorefrontProducts(search),
  });
}

export function useStorefrontProductQuery(id: string) {
  return useQuery({
    enabled: hasConfiguredApiBaseUrl() && Boolean(id),
    queryKey: [...queryKeys.storefrontProduct, id],
    queryFn: () => getStorefrontProduct(id),
  });
}

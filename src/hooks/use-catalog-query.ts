"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import {
  getBrands,
  getCategories,
  getProducts,
} from "@/services/catalog";
import { getClientProducts } from "@/services/client";
import { getSettings } from "@/services/settings";

export function useCatalogQuery() {
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: async () => {
      const [products, categories, brands, settings] = await Promise.all([
        getProducts(),
        getCategories(),
        getBrands(),
        getSettings(),
      ]);

      return {
        products,
        categories,
        brands,
        settings,
      };
    },
  });
}

export function useClientCatalogQuery() {
  return useQuery({
    queryKey: queryKeys.clientCatalog,
    queryFn: async () => {
      const [products, settings] = await Promise.all([
        getClientProducts(),
        getSettings(),
      ]);

      return {
        products,
        settings,
      };
    },
  });
}

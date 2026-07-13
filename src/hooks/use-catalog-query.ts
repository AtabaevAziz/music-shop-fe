"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getBrands, getCategories, getProducts } from "@/services/catalog";
import { getClientProducts } from "@/services/client";
import { getAppConfig, getDictionaries } from "@/services/config";
import { getSettings } from "@/services/settings";

export function useCatalogQuery() {
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: async () => {
      const [products, categories, brands, settings, dictionaries] =
        await Promise.all([
          getProducts(),
          getCategories(),
          getBrands(),
          getSettings(),
          getDictionaries(),
        ]);

      return {
        products,
        categories,
        brands,
        settings,
        dictionaries,
      };
    },
  });
}

export function useClientCatalogQuery() {
  return useQuery({
    queryKey: queryKeys.clientCatalog,
    queryFn: async () => {
      const [products, appConfig] = await Promise.all([
        getClientProducts(),
        getAppConfig(),
      ]);

      return {
        products,
        currency: appConfig.defaultCurrency,
      };
    },
  });
}

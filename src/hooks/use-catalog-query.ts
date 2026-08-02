"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getCategories, getProducts } from "@/services/catalog";
import { getClientMe, getClientProducts } from "@/services/client";
import { getAppConfig, getDictionaries } from "@/services/config";
import { getSettings } from "@/services/settings";

export function useCatalogQuery() {
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: async () => {
      const [products, categories, settings, dictionaries] = await Promise.all([
        getProducts(),
        getCategories(),
        getSettings(),
        getDictionaries(),
      ]);

      return {
        products,
        categories,
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
      const [products, customer, appConfig] = await Promise.all([
        getClientProducts(),
        getClientMe(),
        getAppConfig(),
      ]);

      return {
        customer,
        products,
        currency: appConfig.defaultCurrency,
      };
    },
  });
}

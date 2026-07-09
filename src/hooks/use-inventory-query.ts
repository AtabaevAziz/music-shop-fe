"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getProducts } from "@/services/catalog";
import { getInventoryMovements } from "@/services/inventory";
import { getSettings } from "@/services/settings";

export function useInventoryQuery() {
  return useQuery({
    queryKey: queryKeys.inventoryPage,
    queryFn: async () => {
      const [products, inventoryMovements, settings] = await Promise.all([
        getProducts(),
        getInventoryMovements(),
        getSettings(),
      ]);

      return {
        products,
        inventoryMovements,
        settings,
      };
    },
  });
}

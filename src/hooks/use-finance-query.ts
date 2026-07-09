"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getProducts } from "@/services/catalog";
import { getFinanceSummary } from "@/services/finance";
import { getOrders } from "@/services/orders";
import { getSettings } from "@/services/settings";

export function useFinanceQuery() {
  return useQuery({
    queryKey: queryKeys.financePage,
    queryFn: async () => {
      const [summary, orders, products, settings] = await Promise.all([
        getFinanceSummary(),
        getOrders(),
        getProducts(),
        getSettings(),
      ]);

      return {
        summary,
        orders,
        products,
        settings,
      };
    },
  });
}

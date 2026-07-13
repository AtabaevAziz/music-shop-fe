"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getProducts } from "@/services/catalog";
import { getClientOrders } from "@/services/client";
import { getClientProducts } from "@/services/client";
import { getAppConfig } from "@/services/config";
import { getWorkflows } from "@/services/config";
import { getCustomers } from "@/services/customers";
import { getOrders } from "@/services/orders";
import { getSettings } from "@/services/settings";

export function useStaffOrdersQuery() {
  return useQuery({
    queryKey: queryKeys.staffOrdersPage,
    queryFn: async () => {
      const [orders, customers, products, settings, workflows] =
        await Promise.all([
          getOrders(),
          getCustomers(),
          getProducts(),
          getSettings(),
          getWorkflows(),
        ]);

      return {
        orders,
        customers,
        products,
        settings,
        orderWorkflow: workflows.orders ?? null,
      };
    },
  });
}

export function useClientOrdersQuery() {
  return useQuery({
    queryKey: queryKeys.clientOrdersPage,
    queryFn: async () => {
      const [orders, products, appConfig] = await Promise.all([
        getClientOrders(),
        getClientProducts(),
        getAppConfig(),
      ]);

      return {
        orders,
        products,
        currency: appConfig.defaultCurrency,
      };
    },
  });
}

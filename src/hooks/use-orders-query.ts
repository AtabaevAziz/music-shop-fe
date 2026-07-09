"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getClientOrders } from "@/services/client";
import { getCustomers } from "@/services/customers";
import { getOrders } from "@/services/orders";
import { getProducts } from "@/services/catalog";
import { getSettings } from "@/services/settings";
import { getWorkflows } from "@/services/config";

export function useStaffOrdersQuery() {
  return useQuery({
    queryKey: queryKeys.staffOrdersPage,
    queryFn: async () => {
      const [orders, customers, settings, workflows] = await Promise.all([
        getOrders(),
        getCustomers(),
        getSettings(),
        getWorkflows(),
      ]);

      return {
        orders,
        customers,
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
      const [orders, products, settings] = await Promise.all([
        getClientOrders(),
        getProducts(),
        getSettings(),
      ]);

      return {
        orders,
        products,
        settings,
      };
    },
  });
}

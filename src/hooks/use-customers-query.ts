"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getDictionaries } from "@/services/config";
import { getCustomers } from "@/services/customers";
import { getOrders } from "@/services/orders";
import { getRepairs } from "@/services/repairs";

export function useCustomersQuery() {
  return useQuery({
    queryKey: queryKeys.customersPage,
    queryFn: async () => {
      const [customers, orders, repairs, dictionaries] = await Promise.all([
        getCustomers(),
        getOrders(),
        getRepairs(),
        getDictionaries(),
      ]);

      return {
        customers,
        orders,
        repairs,
        dictionaries,
      };
    },
  });
}

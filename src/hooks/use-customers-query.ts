"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getDictionaries } from "@/services/config";
import { getCustomers } from "@/services/customers";

export function useCustomersQuery() {
  return useQuery({
    queryKey: queryKeys.customersPage,
    queryFn: async () => {
      const [customers, dictionaries] = await Promise.all([
        getCustomers(),
        getDictionaries(),
      ]);

      return {
        customers,
        dictionaries,
      };
    },
  });
}

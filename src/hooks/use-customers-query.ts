"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getCustomers } from "@/services/customers";

export function useCustomersQuery() {
  return useQuery({
    queryKey: queryKeys.customersPage,
    queryFn: async () => ({
      customers: await getCustomers(),
    }),
  });
}

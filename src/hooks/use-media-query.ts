"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getProducts } from "@/services/catalog";

export function useMediaQuery() {
  return useQuery({
    queryKey: queryKeys.mediaPage,
    queryFn: async () => ({
      products: await getProducts(),
    }),
  });
}

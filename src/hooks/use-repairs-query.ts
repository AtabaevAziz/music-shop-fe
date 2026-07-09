"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getClientRepairs } from "@/services/client";
import { getRepairs } from "@/services/repairs";

export function useClientRepairsQuery() {
  return useQuery({
    queryKey: queryKeys.clientRepairsPage,
    queryFn: async () => ({
      repairRequests: await getClientRepairs(),
    }),
  });
}

export function useStaffRepairsQuery() {
  return useQuery({
    queryKey: queryKeys.repairs,
    queryFn: async () => ({
      repairRequests: await getRepairs(),
    }),
  });
}

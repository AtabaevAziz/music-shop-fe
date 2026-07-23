"use client";

import { useQuery } from "@tanstack/react-query";

import { queryKeys } from "@/lib/query-keys";
import { getSession } from "@/services/auth";

export function useSessionQuery(options?: { enabled?: boolean }) {
  return useQuery({
    enabled: options?.enabled ?? true,
    queryKey: queryKeys.session,
    queryFn: getSession,
    retry: false,
  });
}

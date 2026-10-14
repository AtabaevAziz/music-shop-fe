"use client";

import { useQueries } from "@tanstack/react-query";

import { hasConfiguredApiBaseUrl } from "@/lib/api-config";
import { queryKeys } from "@/lib/query-keys";
import { getAppConfig } from "@/services/config";

export function RuntimeConfigBootstrap() {
  const isApiConfigured = hasConfiguredApiBaseUrl();

  useQueries({
    queries: [
      {
        enabled: isApiConfigured,
        queryKey: queryKeys.appConfig,
        queryFn: getAppConfig,
      },
    ],
  });

  return null;
}

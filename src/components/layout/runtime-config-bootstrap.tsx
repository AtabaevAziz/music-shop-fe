"use client";

import { useQueries } from "@tanstack/react-query";

import { hasConfiguredApiBaseUrl } from "@/lib/api-config";
import { queryKeys } from "@/lib/query-keys";
import {
  getAppConfig,
  getAuthConfig,
  getDictionaries,
  getNavigationConfig,
  getPermissions,
  getWorkflows,
} from "@/services/config";

export function RuntimeConfigBootstrap() {
  const isApiConfigured = hasConfiguredApiBaseUrl();

  useQueries({
    queries: [
      {
        enabled: isApiConfigured,
        queryKey: queryKeys.appConfig,
        queryFn: getAppConfig,
      },
      {
        enabled: isApiConfigured,
        queryKey: queryKeys.authConfig,
        queryFn: getAuthConfig,
      },
      {
        enabled: isApiConfigured,
        queryKey: queryKeys.navigation,
        queryFn: getNavigationConfig,
      },
      {
        enabled: isApiConfigured,
        queryKey: queryKeys.permissions,
        queryFn: getPermissions,
      },
      {
        enabled: isApiConfigured,
        queryKey: queryKeys.workflows,
        queryFn: getWorkflows,
      },
      {
        enabled: isApiConfigured,
        queryKey: queryKeys.dictionaries,
        queryFn: getDictionaries,
      },
    ],
  });

  return null;
}

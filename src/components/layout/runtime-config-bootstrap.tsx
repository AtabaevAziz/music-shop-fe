"use client";

import { useQueries } from "@tanstack/react-query";

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
  useQueries({
    queries: [
      {
        queryKey: queryKeys.appConfig,
        queryFn: getAppConfig,
      },
      {
        queryKey: queryKeys.authConfig,
        queryFn: getAuthConfig,
      },
      {
        queryKey: queryKeys.navigation,
        queryFn: getNavigationConfig,
      },
      {
        queryKey: queryKeys.permissions,
        queryFn: getPermissions,
      },
      {
        queryKey: queryKeys.workflows,
        queryFn: getWorkflows,
      },
      {
        queryKey: queryKeys.dictionaries,
        queryFn: getDictionaries,
      },
    ],
  });

  return null;
}

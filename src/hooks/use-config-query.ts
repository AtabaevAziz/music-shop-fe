"use client";

import { useQuery } from "@tanstack/react-query";

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

export function useAppConfigQuery() {
  return useQuery({
    enabled: hasConfiguredApiBaseUrl(),
    queryKey: queryKeys.appConfig,
    queryFn: getAppConfig,
  });
}

export function useAuthConfigQuery() {
  return useQuery({
    enabled: hasConfiguredApiBaseUrl(),
    queryKey: queryKeys.authConfig,
    queryFn: getAuthConfig,
  });
}

export function useNavigationQuery() {
  return useQuery({
    enabled: hasConfiguredApiBaseUrl(),
    queryKey: queryKeys.navigation,
    queryFn: getNavigationConfig,
  });
}

export function usePermissionsQuery() {
  return useQuery({
    enabled: hasConfiguredApiBaseUrl(),
    queryKey: queryKeys.permissions,
    queryFn: getPermissions,
  });
}

export function useWorkflowsQuery() {
  return useQuery({
    enabled: hasConfiguredApiBaseUrl(),
    queryKey: queryKeys.workflows,
    queryFn: getWorkflows,
  });
}

export function useDictionariesQuery() {
  return useQuery({
    enabled: hasConfiguredApiBaseUrl(),
    queryKey: queryKeys.dictionaries,
    queryFn: getDictionaries,
  });
}

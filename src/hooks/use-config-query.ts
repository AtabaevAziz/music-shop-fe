"use client";

import { useQuery } from "@tanstack/react-query";

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
    queryKey: queryKeys.appConfig,
    queryFn: getAppConfig,
  });
}

export function useAuthConfigQuery() {
  return useQuery({
    queryKey: queryKeys.authConfig,
    queryFn: getAuthConfig,
  });
}

export function useNavigationQuery() {
  return useQuery({
    queryKey: queryKeys.navigation,
    queryFn: getNavigationConfig,
  });
}

export function usePermissionsQuery() {
  return useQuery({
    queryKey: queryKeys.permissions,
    queryFn: getPermissions,
  });
}

export function useWorkflowsQuery() {
  return useQuery({
    queryKey: queryKeys.workflows,
    queryFn: getWorkflows,
  });
}

export function useDictionariesQuery() {
  return useQuery({
    queryKey: queryKeys.dictionaries,
    queryFn: getDictionaries,
  });
}

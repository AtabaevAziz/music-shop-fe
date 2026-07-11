import { api } from "@/lib/api-client";
import {
  fromApiAppConfig,
  fromApiAuthConfig,
  fromApiDictionariesConfig,
  fromApiNavigationItems,
  fromApiPermissionMatrix,
  fromApiWorkflowsConfig,
} from "@/services/config/config-mapper";
import type {
  ApiAppConfigResponse,
  ApiAuthConfigResponse,
  ApiDictionariesResponse,
  ApiNavigationResponse,
  ApiPermissionsResponse,
  ApiWorkflowsResponse,
} from "@/services/config/config-types";

export async function getAppConfig() {
  const response = await api.get<ApiAppConfigResponse>("config/app");
  return fromApiAppConfig(response.appConfig);
}

export async function getAuthConfig() {
  const response = await api.get<ApiAuthConfigResponse>("config/auth");
  return fromApiAuthConfig(response.authConfig);
}

export async function getNavigationConfig() {
  const response = await api.get<ApiNavigationResponse>("config/navigation");
  return fromApiNavigationItems(response.items);
}

export async function getPermissions() {
  const response = await api.get<ApiPermissionsResponse>("config/permissions");
  return fromApiPermissionMatrix(response.permissions);
}

export async function getWorkflows() {
  const response = await api.get<ApiWorkflowsResponse>("config/workflows");
  return fromApiWorkflowsConfig(response.workflows);
}

export async function getDictionaries() {
  const response = await api.get<ApiDictionariesResponse>(
    "config/dictionaries",
  );
  return fromApiDictionariesConfig(response.dictionaries ?? response);
}

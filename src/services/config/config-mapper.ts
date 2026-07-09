import type {
  ApiAppConfig,
  ApiAuthConfig,
  ApiDictionariesConfig,
  ApiNavigationItem,
  ApiPermissionMatrix,
  ApiWorkflowsConfig,
} from "@/services/config/config-types";

export function fromApiAppConfig(config: ApiAppConfig) {
  return config;
}

export function fromApiAuthConfig(config: ApiAuthConfig) {
  return config;
}

export function fromApiNavigationItems(items: ApiNavigationItem[]) {
  return items;
}

export function fromApiPermissionMatrix(matrix: ApiPermissionMatrix) {
  return matrix;
}

export function fromApiWorkflowsConfig(config: ApiWorkflowsConfig) {
  return config;
}

export function fromApiDictionariesConfig(config: ApiDictionariesConfig) {
  return config;
}

import type { Locale } from "@/i18n";
import type {
  Condition,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  RepairStatus,
  Role,
} from "@/types/music";

export type ApiAppConfig = {
  defaultLocale: Locale;
  supportedLocales: Locale[];
  defaultCurrency: string;
  features: Record<string, boolean>;
};

export type ApiAuthProviderConfig = {
  id: string;
  type: "password" | "oauth" | "magic_link" | string;
  principalType: "role" | "email" | "username" | string;
};

export type ApiAuthConfig = {
  providers: ApiAuthProviderConfig[];
  allowClientLogin: boolean;
  allowAdminLogin: boolean;
};

export type ApiNavigationItem = {
  id: string;
  path: string;
  titleKey: string;
  subtitleKey?: string;
  roles: Role[];
  children?: ApiNavigationItem[];
};

export type ApiPermissionMatrix = Partial<Record<Role, string[]>>;

export type ApiWorkflowDefinition<TStatus extends string = string> = {
  statuses: TStatus[];
  transitions: Record<TStatus, TStatus[]>;
};

export type ApiWorkflowsConfig = {
  orders?: ApiWorkflowDefinition<OrderStatus>;
  repairs?: ApiWorkflowDefinition<RepairStatus>;
};

export type ApiDictionaryOption<TValue extends string = string> = {
  value: TValue;
  labelKey?: string;
  description?: string;
};

export type ApiDictionariesConfig = {
  customerTiers?: ApiDictionaryOption<"standard" | "studio" | "vip">[];
  productStatuses?: ApiDictionaryOption<ProductStatus>[];
  repairStatuses?: ApiDictionaryOption<RepairStatus>[];
  paymentStatuses?: ApiDictionaryOption<PaymentStatus>[];
  conditions?: ApiDictionaryOption<Condition>[];
  roles?: ApiDictionaryOption<Role>[];
};

export type ApiAppConfigResponse = {
  appConfig: ApiAppConfig;
};

export type ApiAuthConfigResponse = {
  authConfig: ApiAuthConfig;
};

export type ApiNavigationResponse = {
  items: ApiNavigationItem[];
};

export type ApiPermissionsResponse = {
  permissions: ApiPermissionMatrix;
};

export type ApiWorkflowsResponse = {
  workflows: ApiWorkflowsConfig;
};

export type ApiDictionariesResponse = {
  dictionaries?: ApiDictionariesConfig;
} & Partial<ApiDictionariesConfig>;

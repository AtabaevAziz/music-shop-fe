import { api } from "@/lib/api-client";
import { fromApiFinanceSummary } from "@/services/finance/finance-mapper";
import type { ApiFinanceSummary } from "@/services/finance/finance-types";

export async function getFinanceSummary() {
  const response = await api.get<ApiFinanceSummary>("finance/summary");
  return fromApiFinanceSummary(response);
}

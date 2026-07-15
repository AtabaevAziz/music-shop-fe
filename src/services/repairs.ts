import { api, unwrapEntityPayload, unwrapListPayload } from "@/lib/api-client";
import { fromApiRepairRequest } from "@/services/repairs/repairs-mapper";
import type {
  ApiRepairRequest,
  ApiRepairResponse,
  CreateRepairRequest,
  RepairsListQuery,
  UpdateRepairRequest,
} from "@/services/repairs/repairs-types";

export async function getRepairs(query: RepairsListQuery = {}) {
  const response = await api.get<
    { items: ApiRepairRequest[] } | ApiRepairRequest[]
  >("repairs", { params: query });
  return unwrapListPayload(response).map(fromApiRepairRequest);
}

export async function createRepair(input: CreateRepairRequest) {
  const response = await api.post<ApiRepairResponse>("repairs", input);
  return fromApiRepairRequest(response.repairRequest);
}

export async function updateRepair(id: string, input: UpdateRepairRequest) {
  const response = await api.put<ApiRepairRequest | ApiRepairResponse>(
    `repairs/${id}`,
    input,
  );
  return fromApiRepairRequest(
    unwrapEntityPayload<ApiRepairRequest, "repairRequest">(
      response,
      "repairRequest",
    ),
  );
}

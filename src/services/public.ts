import { api } from "@/lib/api-client";
import { fromApiOrder } from "@/services/orders/orders-mapper";
import { fromApiRepairRequest } from "@/services/repairs/repairs-mapper";
import type {
  ApiPublicOrderResponse,
  ApiPublicRepairResponse,
  CreatePublicOrderRequest,
  CreatePublicRepairRequest,
} from "@/services/public/public-types";

export async function createPublicOrder(input: CreatePublicOrderRequest) {
  const response = await api.post<ApiPublicOrderResponse>("public/orders", input);
  return fromApiOrder(response.order);
}

export async function createPublicRepair(input: CreatePublicRepairRequest) {
  const response = await api.post<ApiPublicRepairResponse>(
    "public/repairs",
    input,
  );
  return fromApiRepairRequest(response.repairRequest);
}

import { api } from "@/lib/api-client";
import type {
  ApiPublicOrderResponse,
  ApiPublicRepairResponse,
  CreatePublicOrderRequest,
  CreatePublicRepairRequest,
  GetPublicOrderRequest,
} from "@/services/public/public-types";

export async function createPublicOrder(input: CreatePublicOrderRequest) {
  const response = await api.post<ApiPublicOrderResponse>(
    "public/orders",
    input,
  );
  return response.order;
}

export async function getPublicOrder(input: GetPublicOrderRequest) {
  const response = await api.get<ApiPublicOrderResponse>(
    `public/orders/${input.orderNumber}`,
    {
      params: {
        token: input.token,
      },
    },
  );
  return response.order;
}

export async function createPublicRepair(input: CreatePublicRepairRequest) {
  const response = await api.post<ApiPublicRepairResponse>(
    "public/repairs",
    input,
  );
  return response.repairRequest;
}

import { api } from "@/lib/api-client";
import { fromApiOrder } from "@/services/orders/orders-mapper";
import type {
  ApiPublicOrderResponse,
  ApiPublicRepairResponse,
  CreatePublicOrderRequest,
  CreatePublicRepairRequest,
  GetPublicOrderRequest,
} from "@/services/public/public-types";
import { fromApiRepairRequest } from "@/services/repairs/repairs-mapper";

export async function createPublicOrder(input: CreatePublicOrderRequest) {
  const response = await api.post<ApiPublicOrderResponse>(
    "public/orders",
    input,
  );
  return fromApiOrder(response.order);
}

export async function getPublicOrder(input: GetPublicOrderRequest) {
  const response = await api.get<ApiPublicOrderResponse>(
    `public/orders/${input.orderNumber}`,
    {
      params: {
        phone: input.phone,
        email: input.email,
      },
    },
  );
  return fromApiOrder(response.order);
}

export async function createPublicRepair(input: CreatePublicRepairRequest) {
  const response = await api.post<ApiPublicRepairResponse>(
    "public/repairs",
    input,
  );
  return fromApiRepairRequest(response.repairRequest);
}

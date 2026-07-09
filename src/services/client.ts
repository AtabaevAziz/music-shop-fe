import { api, unwrapListPayload } from "@/lib/api-client";
import {
  fromApiClientCustomer,
  fromApiClientOrder,
  fromApiClientProduct,
  fromApiClientRepairRequest,
} from "@/services/client/client-mapper";
import type {
  ApiClientMeResponse,
  ApiClientOrder,
  ApiClientOrderResponse,
  ApiClientProduct,
  ApiClientRepairRequest,
  ApiClientRepairResponse,
  CreateClientOrderRequest,
  CreateClientRepairRequest,
} from "@/services/client/client-types";

export async function getClientMe() {
  const response = await api.get<ApiClientMeResponse>("client/me");
  return fromApiClientCustomer(response.customer);
}

export async function getClientProducts() {
  const response = await api.get<{ items: ApiClientProduct[] } | ApiClientProduct[]>(
    "client/products",
  );
  return unwrapListPayload(response).map(fromApiClientProduct);
}

export async function getClientOrders() {
  const response = await api.get<{ items: ApiClientOrder[] } | ApiClientOrder[]>(
    "client/orders",
  );
  return unwrapListPayload(response).map(fromApiClientOrder);
}

export async function createClientOrder(input: CreateClientOrderRequest) {
  const response = await api.post<ApiClientOrderResponse>("client/orders", input);
  return fromApiClientOrder(response.order);
}

export async function getClientRepairs() {
  const response = await api.get<
    { items: ApiClientRepairRequest[] } | ApiClientRepairRequest[]
  >("client/repairs");
  return unwrapListPayload(response).map(fromApiClientRepairRequest);
}

export async function createClientRepair(input: CreateClientRepairRequest) {
  const response = await api.post<ApiClientRepairResponse>(
    "client/repairs",
    input,
  );
  return fromApiClientRepairRequest(response.repairRequest);
}

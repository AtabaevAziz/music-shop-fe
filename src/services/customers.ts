import { api, unwrapEntityPayload, unwrapListPayload } from "@/lib/api-client";
import { fromApiCustomer } from "@/services/customers/customers-mapper";
import type {
  ApiCustomer,
  ApiCustomerResponse,
  CreateCustomerRequest,
  UpdateCustomerRequest,
} from "@/services/customers/customers-types";

export async function getCustomers() {
  const response = await api.get<{ items: ApiCustomer[] } | ApiCustomer[]>(
    "customers",
  );
  return unwrapListPayload(response).map(fromApiCustomer);
}

export async function createCustomer(input: CreateCustomerRequest) {
  const response = await api.post<ApiCustomerResponse>("customers", input);
  return fromApiCustomer(response.customer);
}

export async function updateCustomer(id: string, input: UpdateCustomerRequest) {
  const response = await api.put<ApiCustomer | ApiCustomerResponse>(
    `customers/${id}`,
    input,
  );
  return fromApiCustomer(
    unwrapEntityPayload<ApiCustomer, "customer">(response, "customer"),
  );
}

export async function deleteCustomer(id: string) {
  await api.delete<void>(`customers/${id}`);
}

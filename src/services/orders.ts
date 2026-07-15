import { api, unwrapEntityPayload, unwrapListPayload } from "@/lib/api-client";
import {
  fromApiOrder,
  fromApiOrderStatusUpdate,
} from "@/services/orders/orders-mapper";
import type {
  ApiOrder,
  ApiOrderResponse,
  ApiOrderStatusResponse,
  ChangeOrderStatusRequest,
  OrdersListQuery,
} from "@/services/orders/orders-types";

export async function getOrders(query: OrdersListQuery = {}) {
  const response = await api.get<{ items: ApiOrder[] } | ApiOrder[]>("orders", {
    params: query,
  });
  return unwrapListPayload(response).map(fromApiOrder);
}

export async function getOrderById(orderId: string) {
  const response = await api.get<ApiOrder | ApiOrderResponse>(
    `orders/${orderId}`,
  );
  return fromApiOrder(
    unwrapEntityPayload<ApiOrder, "order">(response, "order"),
  );
}

export async function changeOrderStatus(
  orderId: string,
  input: ChangeOrderStatusRequest,
) {
  const response = await api.post<ApiOrderStatusResponse>(
    `orders/${orderId}/status`,
    input,
  );
  return fromApiOrderStatusUpdate(response.order);
}

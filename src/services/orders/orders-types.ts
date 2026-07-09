import type { Order, OrderStatus, PaymentStatus } from "@/types/music";

export type OrdersListQuery = {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  customerId?: string;
  limit?: number;
};

export type ApiOrder = Order;

export type ApiOrderStatusUpdate = Pick<Order, "id" | "status" | "updatedAt">;

export type ChangeOrderStatusRequest = {
  status: OrderStatus;
};

export type ApiOrderResponse = {
  order: ApiOrder;
};

export type ApiOrderStatusResponse = {
  order: ApiOrderStatusUpdate;
};

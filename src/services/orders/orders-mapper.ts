import type {
  ApiOrder,
  ApiOrderStatusUpdate,
} from "@/services/orders/orders-types";
import type { Order } from "@/types/music";

export function fromApiOrder(order: ApiOrder): Order {
  return order;
}

export function fromApiOrderStatusUpdate(update: ApiOrderStatusUpdate) {
  return update;
}

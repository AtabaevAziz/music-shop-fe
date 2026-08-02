import type {
  Order,
  OrderStatus,
  PaymentStatus,
} from "@/types/music";

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
  comment?: string;
  carrier?: string;
  deliveryCompany?: string;
  trackingNumber?: string;
  fragile?: boolean;
  packageType?: string;
  weightGrams?: number;
  lengthCm?: number;
  widthCm?: number;
  heightCm?: number;
  serialNumbers?: string;
  warehouseIssueType?: string;
  packagingComment?: string;
};

export type ChangeOrderPaymentRequest = {
  paymentStatus: PaymentStatus;
  transactionId?: string;
  provider?: string;
  comment?: string;
};

export type ApiOrderResponse = {
  order: ApiOrder;
};

export type ApiOrderStatusResponse = {
  order: ApiOrderStatusUpdate;
};

export type ApiOrderPaymentStatusResponse = {
  order: ApiOrder;
};

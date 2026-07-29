import type {
  Customer,
  Order,
  OrderItem,
  Product,
  RepairRequest,
} from "@/types/music";

export type ApiClientCustomer = Customer;

export type ApiClientProduct = Product;

export type ApiClientOrder = Order;

export type ApiClientRepairRequest = RepairRequest;

export type ApiClientMeResponse = {
  customer: ApiClientCustomer | null;
};

export type CreateClientOrderRequest = {
  items: OrderItem[];
  address: string;
  paymentMethod: "cash" | "online";
  deliveryMethod: "pickup" | "courier" | "delivery_company" | "post";
  deliveryCompany?: string;
  notes?: string;
};

export type CreateClientRepairRequest = {
  instrumentName: string;
  brand: string;
  issue: string;
  notes: string;
};

export type ApiClientOrderResponse = {
  order: ApiClientOrder;
};

export type ApiClientRepairResponse = {
  repairRequest: ApiClientRepairRequest;
};

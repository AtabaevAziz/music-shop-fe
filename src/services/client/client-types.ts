import type {
  Customer,
  Order,
  OrderItem,
  Product,
  RepairRequest,
} from "@/types/music";

export type ApiClientCustomer = Customer;

export type ApiClientProduct = Omit<Product, "brand"> & {
  brand?: string | { name?: string | null } | null;
  brandId?: string | null;
};

export type ApiClientOrder = Order;

export type ApiClientRepairRequest = RepairRequest;

export type ApiClientMeResponse = {
  customer: ApiClientCustomer | null;
};

export type CreateClientOrderRequest = {
  items: OrderItem[];
  notes: string;
};

export type CreateClientRepairRequest = Omit<
  RepairRequest,
  "id" | "customerId" | "status" | "createdAt" | "updatedAt"
>;

export type ApiClientOrderResponse = {
  order: ApiClientOrder;
};

export type ApiClientRepairResponse = {
  repairRequest: ApiClientRepairRequest;
};

export type Role = "admin" | "client";
export type PaymentMethod = "cash" | "online";
export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";
export type DeliveryMethod =
  | "pickup"
  | "courier"
  | "delivery_company"
  | "post";
export type DeliveryStatus =
  | "not_ready"
  | "ready_for_shipment"
  | "shipped"
  | "in_transit"
  | "delivered"
  | "delivery_failed"
  | "returned";
export type PackagingStatus = "not_started" | "in_progress" | "packed";
export type OrderStatus =
  | "new"
  | "awaiting_payment"
  | "paid"
  | "confirmed"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled";
export type OrderTerminalStatus = OrderStatus | "returned";
export type RepairStatus =
  | "new"
  | "diagnostics"
  | "in_progress"
  | "ready"
  | "completed"
  | "cancelled";
export type ProductStatus = "draft" | "active" | "archived";
export type Condition = "new" | "used" | "showroom";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  image: string;
  status: "active" | "inactive";
  description: string;
  productCount?: number;
};

export type Product = {
  id: string;
  name: string;
  slug?: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  brand: string;
  price: number;
  costPrice: number;
  stockQty: number;
  reservedQty: number;
  availableQty: number;
  status: ProductStatus;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  primaryImage?: string;
  condition: Condition;
  minStockQty?: number;
  createdAt: string;
  updatedAt: string;
};

export type InventoryMovement = {
  id: string;
  productId: string;
  delta: number;
  reason: string;
  createdAt: string;
};

export type OrderItem = {
  productId: string;
  qty: number;
  quantity: number;
  productName?: string;
  unitPrice: number;
  totalPrice: number;
};

export type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customer: {
    name: string;
    phone: string;
    email?: string | null;
  };
  items: OrderItem[];
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  payment?: {
    method: PaymentMethod;
    status: PaymentStatus;
    amount: number;
    transactionId?: string | null;
    paidAt?: string | null;
  } | null;
  deliveryMethod: DeliveryMethod;
  deliveryStatus?: DeliveryStatus | null;
  delivery?: {
    method: DeliveryMethod;
    company?: string | null;
    address: string;
    trackingNumber?: string | null;
    shippingCost: number;
    status: DeliveryStatus;
    shippedAt?: string | null;
    deliveredAt?: string | null;
  } | null;
  packaging?: {
    status: PackagingStatus;
    fragile: boolean;
    packageType?: string | null;
    dimensions?: string | null;
    weightGrams?: number | null;
    comment?: string | null;
    packedAt?: string | null;
    employeeId?: string | null;
  } | null;
  status: OrderStatus;
  subtotal: number;
  deliveryCost: number;
  total: number;
  notes: string;
  statusHistory: Array<{
    oldStatus?: OrderStatus | null;
    newStatus: OrderTerminalStatus;
    changedByType: "system" | "employee" | "customer";
    changedById?: string | null;
    comment?: string | null;
    changedAt: string;
  }>;
  paymentRedirectUrl?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RepairRequest = {
  id: string;
  customerId: string;
  instrumentName: string;
  brand: string;
  issue: string;
  status: RepairStatus;
  notes: string;
  estimatedCost?: number;
  assignedMasterName?: string;
  receivedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  fullName?: string;
  phone: string;
  email: string;
  tier: "standard" | "studio" | "vip";
  status: "active" | "inactive";
  notes: string;
  ordersCount?: number;
  repairsCount?: number;
  registeredAt?: string;
};

export type Employee = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
  status: "active" | "inactive";
};

export type BusinessSettings = {
  currency: string;
  lowStockThreshold: number;
  defaultProductStatus: ProductStatus;
  defaultMarkupPercent: number;
};

export type Activity = {
  id: string;
  title: string;
  timestamp: string;
  messageKey?: string;
  messageParams?: Record<string, string | number>;
};

export type Session = {
  role: Role;
  name: string;
  customerId?: string;
};

export type Database = {
  categories: Category[];
  products: Product[];
  inventoryMovements: InventoryMovement[];
  orders: Order[];
  repairRequests: RepairRequest[];
  customers: Customer[];
  employees: Employee[];
  settings: BusinessSettings;
  activity: Activity[];
};

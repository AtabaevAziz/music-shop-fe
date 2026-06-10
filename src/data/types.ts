export type Role =
  | "admin"
  | "store_manager"
  | "catalog_manager"
  | "sales_operator";
export type PaymentStatus = "pending" | "partial" | "paid" | "refunded";
export type OrderStatus =
  | "new"
  | "confirmed"
  | "packed"
  | "ready_for_pickup"
  | "completed"
  | "cancelled";
export type ProductStatus = "draft" | "active" | "archived";
export type Condition = "new" | "used" | "showroom";

export type Category = {
  id: string;
  name: string;
  slug: string;
  parentId?: string;
  status: "active" | "inactive";
  description: string;
};

export type Brand = {
  id: string;
  name: string;
  country: string;
  website: string;
  status: "active" | "inactive";
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  barcode?: string;
  categoryId: string;
  brandId: string;
  price: number;
  costPrice: number;
  stockQty: number;
  status: ProductStatus;
  shortDescription: string;
  description: string;
  specs: Record<string, string>;
  images: string[];
  primaryImage?: string;
  condition: Condition;
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
  unitPrice: number;
};

export type Order = {
  id: string;
  customerId: string;
  items: OrderItem[];
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string;
  tier: "standard" | "studio" | "vip";
  status: "active" | "inactive";
  notes: string;
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
};

export type Session = {
  role: Role;
  name: string;
};

export type Database = {
  categories: Category[];
  brands: Brand[];
  products: Product[];
  inventoryMovements: InventoryMovement[];
  orders: Order[];
  customers: Customer[];
  employees: Employee[];
  settings: BusinessSettings;
  activity: Activity[];
};

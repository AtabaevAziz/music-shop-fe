import { slugify } from "@/lib/utils";
import {
  Brand,
  Category,
  Customer,
  Database,
  Employee,
  OrderItem,
  OrderStatus,
  Product,
  RepairRequest,
} from "@/types/music";

export class StoreActionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StoreActionError";
  }
}

const orderTransitions: Record<OrderStatus, OrderStatus[]> = {
  new: ["confirmed", "cancelled"],
  confirmed: ["packed", "cancelled"],
  packed: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

function assert(condition: boolean, message: string): asserts condition {
  if (!condition) {
    throw new StoreActionError(message);
  }
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizeImageList(images: string[]) {
  return images
    .map((image) => image.trim())
    .filter(Boolean)
    .filter((image, index, current) => current.indexOf(image) === index);
}

function validateSharedName(name: string, label: string) {
  assert(name.trim().length >= 2, `${label} must be at least 2 characters.`);
}

export function validateCategoryInput(
  db: Database,
  input: Omit<Category, "id" | "slug"> & { id?: string },
) {
  validateSharedName(input.name, "Category name");
  assert(
    input.description.trim().length >= 4,
    "Category description is too short.",
  );
  if (input.parentId) {
    assert(
      db.categories.some((category) => category.id === input.parentId),
      "Selected parent category does not exist.",
    );
    assert(input.parentId !== input.id, "A category cannot be its own parent.");
  }
  const nextSlug = slugify(input.name);
  assert(nextSlug.length > 0, "Category slug cannot be empty.");
  const duplicateSlug = db.categories.some(
    (category) => category.slug === nextSlug && category.id !== input.id,
  );
  assert(!duplicateSlug, "Category slug must be unique.");
}

export function validateBrandInput(
  db: Database,
  input: Omit<Brand, "id"> & { id?: string },
) {
  validateSharedName(input.name, "Brand name");
  assert(input.country.trim().length >= 2, "Brand country is required.");
  assert(isValidUrl(input.website), "Brand website must be a valid URL.");
  const duplicateName = db.brands.some(
    (brand) =>
      brand.name.trim().toLowerCase() === input.name.trim().toLowerCase() &&
      brand.id !== input.id,
  );
  assert(!duplicateName, "Brand name must be unique.");
}

export function validateCustomerInput(
  db: Database,
  input: Omit<Customer, "id"> & { id?: string },
) {
  validateSharedName(input.name, "Customer name");
  assert(input.phone.trim().length >= 6, "Customer phone is required.");
  assert(isValidEmail(input.email), "Customer email must be valid.");
  const duplicateEmail = db.customers.some(
    (customer) =>
      customer.email.trim().toLowerCase() ===
        input.email.trim().toLowerCase() && customer.id !== input.id,
  );
  assert(!duplicateEmail, "Customer email must be unique.");
}

export function validateEmployeeInput(
  db: Database,
  input: Omit<Employee, "id"> & { id?: string },
) {
  validateSharedName(input.name, "Employee name");
  assert(isValidEmail(input.email), "Employee email must be valid.");
  assert(input.phone.trim().length >= 6, "Employee phone is required.");
  const duplicateEmail = db.employees.some(
    (employee) =>
      employee.email.trim().toLowerCase() ===
        input.email.trim().toLowerCase() && employee.id !== input.id,
  );
  assert(!duplicateEmail, "Employee email must be unique.");
}

export function validateProductInput(
  db: Database,
  input: Omit<Product, "id"> & { id?: string },
) {
  validateSharedName(input.name, "Product name");
  assert(input.sku.trim().length >= 3, "Product SKU is required.");
  assert(input.price > 0, "Product price must be greater than 0.");
  assert(input.costPrice > 0, "Product cost price must be greater than 0.");
  assert(input.stockQty >= 0, "Product stock cannot be negative.");
  assert(
    db.categories.some((category) => category.id === input.categoryId),
    "Selected category does not exist.",
  );
  assert(
    db.brands.some((brand) => brand.id === input.brandId),
    "Selected brand does not exist.",
  );
  assert(
    input.shortDescription.trim().length >= 4,
    "Product short description is too short.",
  );
  assert(
    input.description.trim().length >= 4,
    "Product description is too short.",
  );
  const duplicateSku = db.products.some(
    (product) =>
      product.sku.trim().toLowerCase() === input.sku.trim().toLowerCase() &&
      product.id !== input.id,
  );
  assert(!duplicateSku, "Product SKU must be unique.");

  const images = normalizeImageList(input.images);
  assert(images.length > 0, "At least one product image is required.");
  assert(
    images.every((image) => image.startsWith("/") || isValidUrl(image)),
    "Product images must be valid absolute paths or URLs.",
  );
  if (input.primaryImage) {
    assert(
      images.includes(input.primaryImage),
      "Primary image must exist in the product image list.",
    );
  }

  const invalidSpec = Object.entries(input.specs).some(
    ([key, value]) => !key.trim() || !value.trim(),
  );
  assert(!invalidSpec, "Each product spec must contain both key and value.");
}

export function validateSettingsInput(input: Database["settings"]) {
  assert(input.currency.trim().length >= 3, "Currency code is required.");
  assert(
    input.lowStockThreshold >= 0,
    "Low stock threshold cannot be negative.",
  );
  assert(
    input.defaultMarkupPercent >= 0,
    "Default markup percent cannot be negative.",
  );
}

export function validateDeleteEntity(
  db: Database,
  type: DeleteEntityType,
  id: string,
) {
  if (type === "categories") {
    assert(
      !db.products.some((product) => product.categoryId === id),
      "Category is used by products and cannot be deleted.",
    );
    assert(
      !db.categories.some((category) => category.parentId === id),
      "Category has child categories and cannot be deleted.",
    );
    return;
  }

  if (type === "brands") {
    assert(
      !db.products.some((product) => product.brandId === id),
      "Brand is used by products and cannot be deleted.",
    );
    return;
  }

  if (type === "customers") {
    assert(
      !db.orders.some((order) => order.customerId === id),
      "Customer is used by orders and cannot be deleted.",
    );
    assert(
      !db.repairRequests.some((request) => request.customerId === id),
      "Customer is used by repair requests and cannot be deleted.",
    );
    return;
  }

  if (type === "products") {
    assert(
      !db.orders.some((order) =>
        order.items.some((item) => item.productId === id),
      ),
      "Product is used by orders and cannot be deleted.",
    );
    assert(
      !db.inventoryMovements.some((movement) => movement.productId === id),
      "Product has inventory history and cannot be deleted.",
    );
  }
}

export function validateStockAdjustment(
  db: Database,
  productId: string,
  reason: string,
) {
  assert(
    db.products.some((product) => product.id === productId),
    "Selected product does not exist.",
  );
  assert(reason.trim().length >= 3, "Stock adjustment reason is too short.");
}

export function validateOrderStatusTransition(
  db: Database,
  orderId: string,
  nextStatus: OrderStatus,
) {
  const order = db.orders.find((entry) => entry.id === orderId);
  assert(Boolean(order), "Order does not exist.");
  if (!order) {
    return;
  }
  if (order.status === nextStatus) {
    return;
  }
  assert(
    orderTransitions[order.status].includes(nextStatus),
    `Order cannot move from ${order.status} to ${nextStatus}.`,
  );
}

export function validateClientLogin(db: Database, customerId: string) {
  const customer = db.customers.find((entry) => entry.id === customerId);
  assert(Boolean(customer), "Customer account does not exist.");
  assert(customer?.status === "active", "Customer account is inactive.");
}

export function validateClientOrderInput(
  db: Database,
  customerId: string,
  items: OrderItem[],
  notes: string,
) {
  validateClientLogin(db, customerId);
  assert(items.length > 0, "Order must contain at least one item.");
  assert(notes.trim().length >= 4, "Order note is too short.");

  items.forEach((item) => {
    const product = db.products.find((entry) => entry.id === item.productId);
    assert(Boolean(product), "Selected product does not exist.");
    assert(item.qty > 0, "Order quantity must be greater than 0.");
    assert(
      Number.isFinite(item.unitPrice) && item.unitPrice > 0,
      "Order price must be greater than 0.",
    );
    assert(
      product?.status === "active",
      "Only active products can be ordered.",
    );
    assert(
      (product?.stockQty ?? 0) >= item.qty,
      `Not enough stock for ${product?.name ?? item.productId}.`,
    );
  });
}

export function validateRepairRequestInput(
  db: Database,
  customerId: string,
  input: Omit<
    RepairRequest,
    "id" | "customerId" | "status" | "createdAt" | "updatedAt"
  >,
) {
  validateClientLogin(db, customerId);
  validateSharedName(input.instrumentName, "Instrument name");
  validateSharedName(input.brand, "Instrument brand");
  assert(
    input.issue.trim().length >= 8,
    "Repair issue description is too short.",
  );
  assert(input.notes.trim().length >= 4, "Repair notes are too short.");
}

export function validateProductImageInput(
  db: Database,
  productId: string,
  image: string,
) {
  const product = db.products.find((entry) => entry.id === productId);
  assert(product !== undefined, "Selected product does not exist.");
  const nextImage = image.trim();
  assert(nextImage.length > 0, "Image path is required.");
  assert(
    nextImage.startsWith("/") || isValidUrl(nextImage),
    "Image path must be a valid absolute path or URL.",
  );
  assert(
    !product.images.includes(nextImage),
    "This image is already attached to the product.",
  );
}

export function validatePrimaryImageSelection(
  db: Database,
  productId: string,
  image: string,
) {
  const product = db.products.find((entry) => entry.id === productId);
  assert(product !== undefined, "Selected product does not exist.");
  assert(
    product.images.includes(image),
    "Primary image must belong to the selected product.",
  );
}

export type DeleteEntityType =
  | "categories"
  | "brands"
  | "customers"
  | "employees"
  | "products";

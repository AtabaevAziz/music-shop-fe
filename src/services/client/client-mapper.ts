import { normalizeProductBrand } from "@/lib/product-brand";
import type {
  ApiClientCustomer,
  ApiClientOrder,
  ApiClientProduct,
  ApiClientRepairRequest,
} from "@/services/client/client-types";
import type { Customer, Order, Product, RepairRequest } from "@/types/music";

export function fromApiClientCustomer(
  customer: ApiClientCustomer | null | undefined,
): Customer | null {
  return customer ?? null;
}

export function fromApiClientProduct(product: ApiClientProduct): Product {
  return {
    ...product,
    brand: normalizeProductBrand(product.brand),
    barcode: product.barcode || undefined,
    primaryImage: product.primaryImage || undefined,
  };
}

export function fromApiClientOrder(order: ApiClientOrder): Order {
  return order;
}

export function fromApiClientRepairRequest(
  repairRequest: ApiClientRepairRequest,
): RepairRequest {
  return repairRequest;
}

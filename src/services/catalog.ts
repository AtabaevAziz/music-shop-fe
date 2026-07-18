import { api, unwrapEntityPayload, unwrapListPayload } from "@/lib/api-client";
import { fromApiCategory } from "@/services/categories/categories-mapper";
import type {
  ApiCategory,
  ApiCategoryResponse,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from "@/services/categories/categories-types";
import { fromApiMediaProduct } from "@/services/media/media-mapper";
import type {
  ApiMediaProductResponse,
  AttachProductImageRequest,
  SetPrimaryImageRequest,
} from "@/services/media/media-types";
import { fromApiProduct } from "@/services/products/products-mapper";
import type {
  ApiProduct,
  ApiProductResponse,
  CreateProductRequest,
  ProductsListQuery,
  UpdateProductRequest,
} from "@/services/products/products-types";

export async function getCategories() {
  const response = await api.get<{ items: ApiCategory[] } | ApiCategory[]>(
    "categories",
  );
  return unwrapListPayload(response).map(fromApiCategory);
}

export async function createCategory(input: CreateCategoryRequest) {
  const response = await api.post<ApiCategoryResponse>("categories", input);
  return fromApiCategory(response.category);
}

export async function updateCategory(id: string, input: UpdateCategoryRequest) {
  const response = await api.put<ApiCategory | ApiCategoryResponse>(
    `categories/${id}`,
    input,
  );
  return fromApiCategory(
    unwrapEntityPayload<ApiCategory, "category">(response, "category"),
  );
}

export async function deleteCategory(id: string) {
  await api.delete<void>(`categories/${id}`);
}

export async function getProducts(query: ProductsListQuery = {}) {
  const response = await api.get<{ items: ApiProduct[] } | ApiProduct[]>(
    "products",
    { params: query },
  );
  return unwrapListPayload(response).map(fromApiProduct);
}

export async function getProductById(id: string) {
  const response = await api.get<ApiProduct | ApiProductResponse>(
    `products/${id}`,
  );
  return fromApiProduct(
    unwrapEntityPayload<ApiProduct, "product">(response, "product"),
  );
}

export async function createProduct(input: CreateProductRequest) {
  const response = await api.post<ApiProductResponse>("products", input);
  return fromApiProduct(response.product);
}

export async function updateProduct(id: string, input: UpdateProductRequest) {
  const response = await api.put<ApiProduct | ApiProductResponse>(
    `products/${id}`,
    input,
  );
  return fromApiProduct(
    unwrapEntityPayload<ApiProduct, "product">(response, "product"),
  );
}

export async function deleteProduct(id: string) {
  await api.delete<void>(`products/${id}`);
}

export async function attachProductImage(
  productId: string,
  input: AttachProductImageRequest,
) {
  const response = await api.post<ApiMediaProductResponse>(
    `products/${productId}/images`,
    input,
  );
  return fromApiMediaProduct(response.product);
}

export async function setProductPrimaryImage(
  productId: string,
  input: SetPrimaryImageRequest,
) {
  const response = await api.post<ApiMediaProductResponse>(
    `products/${productId}/primary-image`,
    input,
  );
  return fromApiMediaProduct(response.product);
}

"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { resolveProductMediaPath } from "@/lib/media";
import type { StorefrontProduct } from "@/services/storefront/storefront-types";

export type StorefrontCartItem = {
  productId: string;
  variantId?: string;
  variantName?: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
  stockQty: number;
  availableQty: number;
  primaryImage?: string;
};

type StorefrontCartState = {
  hasHydrated: boolean;
  items: StorefrontCartItem[];
  setHasHydrated: (hasHydrated: boolean) => void;
  addProduct: (
    product: StorefrontProduct,
    qty?: number,
    variantId?: string,
  ) => void;
  removeProduct: (productId: string, variantId?: string) => void;
  setProductQty: (productId: string, qty: number, variantId?: string) => void;
  syncProducts: (products: StorefrontProduct[]) => void;
  clearCart: () => void;
};

function normalizeCartItemImage(primaryImage?: string) {
  return resolveProductMediaPath(primaryImage);
}

export const useStorefrontCartStore = create<StorefrontCartState>()(
  persist(
    (set) => ({
      hasHydrated: false,
      items: [],
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
      addProduct: (product, qty = 1, variantId) =>
        set((state) => {
          const variant =
            product.variants.find((item) => item.id === variantId) ??
            product.variants.find((item) => item.status === "active");
          const effectiveVariantId = variant?.id;
          const effectivePrice = variant?.price ?? product.price;
          const effectiveStockQty = variant?.stockQty ?? product.stockQty;
          const effectiveAvailableQty =
            variant?.availableQty ?? product.availableQty;
          const existingItem = state.items.find(
            (item) =>
              item.productId === product.id &&
              item.variantId === effectiveVariantId,
          );
          const nextQty = Math.max(1, Math.min(effectiveAvailableQty, qty));

          if (!existingItem) {
            return {
              items: [
                ...state.items,
                {
                  productId: product.id,
                  variantId: effectiveVariantId,
                  variantName: variant?.colorName,
                  name: product.name,
                  brand: product.brand,
                  price: effectivePrice,
                  qty: nextQty,
                  stockQty: effectiveStockQty,
                  availableQty: effectiveAvailableQty,
                  primaryImage: normalizeCartItemImage(
                    variant?.primaryImage ?? product.primaryImage,
                  ),
                },
              ],
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === product.id &&
              item.variantId === effectiveVariantId
                ? {
                    ...item,
                    variantName: variant?.colorName,
                    name: product.name,
                    brand: product.brand,
                    price: effectivePrice,
                    stockQty: effectiveStockQty,
                    availableQty: effectiveAvailableQty,
                    primaryImage: normalizeCartItemImage(
                      variant?.primaryImage ?? product.primaryImage,
                    ),
                    qty: Math.min(item.qty + nextQty, effectiveAvailableQty),
                  }
                : item,
            ),
          };
        }),
      removeProduct: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter(
            (item) =>
              item.productId !== productId || item.variantId !== variantId,
          ),
        })),
      setProductQty: (productId, qty, variantId) =>
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.productId !== productId || item.variantId !== variantId) {
              return [item];
            }

            if (qty <= 0) {
              return [];
            }

            return [
              {
                ...item,
                qty: Math.max(1, Math.min(qty, item.availableQty)),
                availableQty: item.availableQty,
              },
            ];
          }),
        })),
      syncProducts: (products) =>
        set((state) => {
          const productMap = new Map(
            products.map((product) => [product.id, product]),
          );

          return {
            items: state.items.flatMap((item) => {
              const product = productMap.get(item.productId);

              if (!product) {
                return [];
              }

              const variant = product.variants.find(
                (candidate) => candidate.id === item.variantId,
              );
              const availableQty =
                variant?.availableQty ?? product.availableQty;
              const stockQty = variant?.stockQty ?? product.stockQty;
              const price = variant?.price ?? product.price;

              if (availableQty < 1) {
                return [];
              }

              return [
                {
                  ...item,
                  name: product.name,
                  brand: product.brand,
                  variantName: variant?.colorName ?? item.variantName,
                  price,
                  stockQty,
                  availableQty,
                  primaryImage: normalizeCartItemImage(
                    variant?.primaryImage ?? product.primaryImage,
                  ),
                  qty: Math.max(1, Math.min(item.qty, availableQty)),
                },
              ];
            }),
          };
        }),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "music-shop-storefront-cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) {
          return;
        }

        useStorefrontCartStore.setState({
          hasHydrated: true,
          items: state.items.map((item) => ({
            ...item,
            primaryImage: normalizeCartItemImage(item.primaryImage),
          })),
        });
      },
    },
  ),
);

export function getStorefrontCartItemsCount(items: StorefrontCartItem[]) {
  return items.reduce((total, item) => total + item.qty, 0);
}

export function getStorefrontCartTotal(items: StorefrontCartItem[]) {
  return items.reduce((total, item) => total + item.qty * item.price, 0);
}

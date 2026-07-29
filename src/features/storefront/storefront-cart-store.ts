"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { resolveProductMediaPath } from "@/lib/media";
import type { StorefrontProduct } from "@/services/storefront/storefront-types";

export type StorefrontCartItem = {
  productId: string;
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
  addProduct: (product: StorefrontProduct, qty?: number) => void;
  removeProduct: (productId: string) => void;
  setProductQty: (productId: string, qty: number) => void;
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
      addProduct: (product, qty = 1) =>
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.productId === product.id,
          );
          const nextQty = Math.max(1, Math.min(product.availableQty, qty));

          if (!existingItem) {
            return {
              items: [
                ...state.items,
                {
                  productId: product.id,
                  name: product.name,
                  brand: product.brand,
                  price: product.price,
                  qty: nextQty,
                  stockQty: product.stockQty,
                  availableQty: product.availableQty,
                  primaryImage: normalizeCartItemImage(product.primaryImage),
                },
              ],
            };
          }

          return {
            items: state.items.map((item) =>
              item.productId === product.id
                ? {
                    ...item,
                    name: product.name,
                    brand: product.brand,
                    price: product.price,
                    stockQty: product.stockQty,
                    availableQty: product.availableQty,
                    primaryImage: normalizeCartItemImage(product.primaryImage),
                    qty: Math.min(item.qty + nextQty, product.availableQty),
                  }
                : item,
            ),
          };
        }),
      removeProduct: (productId) =>
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        })),
      setProductQty: (productId, qty) =>
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.productId !== productId) {
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

              if (!product || product.availableQty < 1) {
                return [];
              }

              return [
                {
                  ...item,
                  name: product.name,
                  brand: product.brand,
                  price: product.price,
                  stockQty: product.stockQty,
                  availableQty: product.availableQty,
                  primaryImage: normalizeCartItemImage(product.primaryImage),
                  qty: Math.max(1, Math.min(item.qty, product.availableQty)),
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

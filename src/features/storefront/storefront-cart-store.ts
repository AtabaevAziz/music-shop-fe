"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { StorefrontProduct } from "@/services/storefront/storefront-types";

export type StorefrontCartItem = {
  productId: string;
  name: string;
  brand: string;
  price: number;
  qty: number;
  stockQty: number;
  primaryImage?: string;
};

type StorefrontCartState = {
  hasHydrated: boolean;
  items: StorefrontCartItem[];
  setHasHydrated: (hasHydrated: boolean) => void;
  addProduct: (product: StorefrontProduct, qty?: number) => void;
  removeProduct: (productId: string) => void;
  setProductQty: (productId: string, qty: number) => void;
  clearCart: () => void;
};

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
          const nextQty = Math.max(1, Math.min(product.stockQty, qty));

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
                  primaryImage: product.primaryImage,
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
                    primaryImage: product.primaryImage,
                    qty: Math.min(item.qty + nextQty, product.stockQty),
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
                qty: Math.max(1, Math.min(qty, item.stockQty)),
              },
            ];
          }),
        })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: "music-shop-storefront-cart",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
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

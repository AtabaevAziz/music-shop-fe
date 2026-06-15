"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { Locale } from "@/i18n";
import { slugify } from "@/lib/utils";
import { localizeDemoDatabase, nextId, seedDatabase } from "@/store/seed";
import {
  Activity,
  Brand,
  Category,
  Customer,
  Database,
  Employee,
  OrderStatus,
  Product,
  ProductStatus,
  Role,
  Session,
} from "@/types/music";

type Flash = {
  kind: "success" | "error";
  message?: string;
  key?: string;
  params?: Record<string, string | number>;
} | null;

type StoreContextValue = {
  db: Database;
  session: Session | null;
  ready: boolean;
  flash: Flash;
  login: (role: Role) => Promise<void>;
  logout: () => void;
  resetDemo: () => Promise<void>;
  saveCategory: (
    input: Omit<Category, "id" | "slug"> & { id?: string },
  ) => Promise<void>;
  saveBrand: (input: Omit<Brand, "id"> & { id?: string }) => Promise<void>;
  saveCustomer: (
    input: Omit<Customer, "id"> & { id?: string },
  ) => Promise<void>;
  saveEmployee: (
    input: Omit<Employee, "id"> & { id?: string },
  ) => Promise<void>;
  saveProduct: (input: Omit<Product, "id"> & { id?: string }) => Promise<void>;
  deleteEntity: (
    type: "categories" | "brands" | "customers" | "employees" | "products",
    id: string,
  ) => Promise<void>;
  adjustStock: (
    productId: string,
    delta: number,
    reason: string,
  ) => Promise<void>;
  changeOrderStatus: (orderId: string, status: OrderStatus) => Promise<void>;
  saveSettings: (input: Database["settings"]) => Promise<void>;
  addProductImage: (productId: string, label: string) => Promise<void>;
  setPrimaryImage: (productId: string, label: string) => Promise<void>;
};

const DB_KEY = "music-shop-db";
const SESSION_KEY = "music-shop-session";
const DB_VERSION_KEY = "music-shop-db-version";
const DB_VERSION = "2";

const StoreContext = createContext<StoreContextValue | null>(null);

function cloneSeed() {
  return JSON.parse(JSON.stringify(seedDatabase)) as Database;
}

function roleToName(role: Role) {
  return {
    admin: "Admin",
    store_manager: "Store Manager",
    catalog_manager: "Catalog Manager",
    sales_operator: "Sales Operator",
  }[role];
}

function simulateDelay() {
  return new Promise((resolve) => setTimeout(resolve, 280));
}

export function MusicStoreProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const [db, setDb] = useState<Database>(cloneSeed);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);
  const localizedDb = useMemo(
    () => localizeDemoDatabase(db, locale),
    [db, locale],
  );

  useEffect(() => {
    const rawDb = window.localStorage.getItem(DB_KEY);
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    const rawDbVersion = window.localStorage.getItem(DB_VERSION_KEY);
    if (rawDb && rawDbVersion === DB_VERSION) {
      setDb(JSON.parse(rawDb) as Database);
    }
    if (rawSession) {
      setSession(JSON.parse(rawSession) as Session);
    }
    if (rawDbVersion !== DB_VERSION) {
      window.localStorage.setItem(DB_KEY, JSON.stringify(cloneSeed()));
      window.localStorage.setItem(DB_VERSION_KEY, DB_VERSION);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
    window.localStorage.setItem(DB_VERSION_KEY, DB_VERSION);
  }, [db, ready]);

  useEffect(() => {
    if (!ready) return;
    if (session) {
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
  }, [ready, session]);

  useEffect(() => {
    if (!flash) return;
    const timer = window.setTimeout(() => setFlash(null), 2200);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const patchDb = async (
    updater: (current: Database) => Database,
    flashConfig?: Flash,
  ) => {
    await simulateDelay();
    setDb((current) => updater(current));
    if (flashConfig) {
      setFlash(flashConfig);
    }
  };

  function addActivityEntry(
    activity: Activity[],
    messageKey: string,
    params: Record<string, string | number> = {},
  ) {
    const identitySource =
      String(
        params.name ??
          params.orderId ??
          params.productName ??
          params.productId ??
          messageKey,
      ) || messageKey;

    return [
      {
        id: nextId("activity", identitySource),
        title: messageKey,
        messageKey,
        messageParams: params,
        timestamp: new Date().toISOString(),
      },
      ...activity,
    ].slice(0, 12);
  }

  const value: StoreContextValue = {
    db: localizedDb,
    session,
    ready,
    flash,
    login: async (role) => {
      await simulateDelay();
      setSession({ role, name: roleToName(role) });
    },
    logout: () => setSession(null),
    resetDemo: async () => {
      await simulateDelay();
      setDb(cloneSeed());
      setFlash({ kind: "success", key: "flash.demoResetDone" });
    },
    saveCategory: async (input) => {
      await patchDb(
        (current) => {
          const item: Category = {
            id: input.id ?? nextId("category", input.name),
            name: input.name,
            slug: slugify(input.name),
            parentId: input.parentId || undefined,
            status: input.status,
            description: input.description,
          };
          const categories = input.id
            ? current.categories.map((category) =>
                category.id === input.id ? item : category,
              )
            : [item, ...current.categories];
          return {
            ...current,
            categories,
            activity: addActivityEntry(
              current.activity,
              "activity.categorySaved",
              {
                name: item.name,
              },
            ),
          };
        },
        { kind: "success", key: "flash.categorySaved" },
      );
    },
    saveBrand: async (input) => {
      await patchDb(
        (current) => {
          const item: Brand = {
            ...input,
            id: input.id ?? nextId("brand", input.name),
          };
          const brands = input.id
            ? current.brands.map((brand) =>
                brand.id === input.id ? item : brand,
              )
            : [item, ...current.brands];
          return {
            ...current,
            brands,
            activity: addActivityEntry(
              current.activity,
              "activity.brandSaved",
              {
                name: item.name,
              },
            ),
          };
        },
        { kind: "success", key: "flash.brandSaved" },
      );
    },
    saveCustomer: async (input) => {
      await patchDb(
        (current) => {
          const item: Customer = {
            ...input,
            id: input.id ?? nextId("customer", input.name),
          };
          const customers = input.id
            ? current.customers.map((customer) =>
                customer.id === input.id ? item : customer,
              )
            : [item, ...current.customers];
          return {
            ...current,
            customers,
            activity: addActivityEntry(
              current.activity,
              "activity.customerSaved",
              {
                name: item.name,
              },
            ),
          };
        },
        { kind: "success", key: "flash.customerSaved" },
      );
    },
    saveEmployee: async (input) => {
      await patchDb(
        (current) => {
          const item: Employee = {
            ...input,
            id: input.id ?? nextId("employee", input.name),
          };
          const employees = input.id
            ? current.employees.map((employee) =>
                employee.id === input.id ? item : employee,
              )
            : [item, ...current.employees];
          return {
            ...current,
            employees,
            activity: addActivityEntry(
              current.activity,
              "activity.employeeSaved",
              {
                name: item.name,
              },
            ),
          };
        },
        { kind: "success", key: "flash.employeeSaved" },
      );
    },
    saveProduct: async (input) => {
      await patchDb(
        (current) => {
          const product: Product = {
            ...input,
            id: input.id ?? nextId("product", input.name),
          };
          const products = input.id
            ? current.products.map((item) =>
                item.id === input.id ? product : item,
              )
            : [product, ...current.products];
          return {
            ...current,
            products,
            activity: addActivityEntry(
              current.activity,
              "activity.productSaved",
              {
                name: product.name,
              },
            ),
          };
        },
        { kind: "success", key: "flash.productSaved" },
      );
    },
    deleteEntity: async (type, id) => {
      await patchDb(
        (current) => {
          const activity = addActivityEntry(
            current.activity,
            "activity.entityRemoved",
            { entityType: type },
          );
          if (type === "categories") {
            return {
              ...current,
              categories: current.categories.filter((item) => item.id !== id),
              activity,
            };
          }
          if (type === "brands") {
            return {
              ...current,
              brands: current.brands.filter((item) => item.id !== id),
              activity,
            };
          }
          if (type === "customers") {
            return {
              ...current,
              customers: current.customers.filter((item) => item.id !== id),
              activity,
            };
          }
          if (type === "employees") {
            return {
              ...current,
              employees: current.employees.filter((item) => item.id !== id),
              activity,
            };
          }
          return {
            ...current,
            products: current.products.filter((item) => item.id !== id),
            activity,
          };
        },
        { kind: "success", key: "flash.entityDeleted" },
      );
    },
    adjustStock: async (productId, delta, reason) => {
      await patchDb(
        (current) => {
          const product = current.products.find(
            (item) => item.id === productId,
          );
          const products = current.products.map((product) =>
            product.id === productId
              ? { ...product, stockQty: Math.max(product.stockQty + delta, 0) }
              : product,
          );
          return {
            ...current,
            products,
            inventoryMovements: [
              {
                id: nextId("movement", reason),
                productId,
                delta,
                reason,
                createdAt: new Date().toISOString(),
              },
              ...current.inventoryMovements,
            ],
            activity: addActivityEntry(
              current.activity,
              "activity.stockAdjusted",
              {
                delta: `${delta > 0 ? "+" : ""}${delta}`,
                productId,
                productName: product?.name ?? productId,
              },
            ),
          };
        },
        { kind: "success", key: "flash.inventoryUpdated" },
      );
    },
    changeOrderStatus: async (orderId, status) => {
      await patchDb(
        (current) => {
          const orders = current.orders.map((order) =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order,
          );
          return {
            ...current,
            orders,
            activity: addActivityEntry(
              current.activity,
              "activity.orderMoved",
              {
                orderId,
                status,
              },
            ),
          };
        },
        { kind: "success", key: "flash.orderStatusUpdated" },
      );
    },
    saveSettings: async (input) => {
      await patchDb(
        (current) => ({
          ...current,
          settings: input,
          products: current.products.map((product) =>
            product.status === "draft"
              ? {
                  ...product,
                  status: input.defaultProductStatus as ProductStatus,
                }
              : product,
          ),
          activity: addActivityEntry(
            current.activity,
            "activity.businessSettingsUpdated",
          ),
        }),
        { kind: "success", key: "flash.settingsSaved" },
      );
    },
    addProductImage: async (productId, label) => {
      await patchDb(
        (current) => ({
          ...current,
          products: current.products.map((product) =>
            product.id === productId
              ? {
                  ...product,
                  images: [...product.images, label],
                  primaryImage: product.primaryImage ?? label,
                }
              : product,
          ),
          activity: addActivityEntry(current.activity, "activity.mediaAdded", {
            productId,
            productName:
              current.products.find((product) => product.id === productId)
                ?.name ?? productId,
          }),
        }),
        { kind: "success", key: "flash.imageAttached" },
      );
    },
    setPrimaryImage: async (productId, label) => {
      await patchDb(
        (current) => ({
          ...current,
          products: current.products.map((product) =>
            product.id === productId
              ? { ...product, primaryImage: label }
              : product,
          ),
          activity: addActivityEntry(
            current.activity,
            "activity.primaryImageChanged",
            {
              productId,
              productName:
                current.products.find((product) => product.id === productId)
                  ?.name ?? productId,
            },
          ),
        }),
        { kind: "success", key: "flash.primaryImageSet" },
      );
    },
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useMusicStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useMusicStore must be used within MusicStoreProvider");
  }
  return context;
}

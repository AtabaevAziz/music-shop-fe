"use client";

import { createContext, useContext, useEffect, useState } from "react";

import { slugify } from "@/lib/utils";
import { nextId, seedDatabase } from "@/store/seed";
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

type Flash = { kind: "success" | "error"; message: string } | null;

type StoreContextValue = {
  db: Database;
  session: Session | null;
  ready: boolean;
  flash: Flash;
  login: (role: Role) => Promise<void>;
  logout: () => void;
  resetDemo: (message: string) => Promise<void>;
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

function addActivity(activity: Activity[], title: string) {
  return [
    {
      id: nextId("activity", title),
      title,
      timestamp: new Date().toISOString(),
    },
    ...activity,
  ].slice(0, 12);
}

export function MusicStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [db, setDb] = useState<Database>(cloneSeed);
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [flash, setFlash] = useState<Flash>(null);

  useEffect(() => {
    const rawDb = window.localStorage.getItem(DB_KEY);
    const rawSession = window.localStorage.getItem(SESSION_KEY);
    if (rawDb) {
      setDb(JSON.parse(rawDb) as Database);
    }
    if (rawSession) {
      setSession(JSON.parse(rawSession) as Session);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    window.localStorage.setItem(DB_KEY, JSON.stringify(db));
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
    flashMessage?: string,
  ) => {
    await simulateDelay();
    setDb((current) => updater(current));
    if (flashMessage) {
      setFlash({ kind: "success", message: flashMessage });
    }
  };

  const value: StoreContextValue = {
    db,
    session,
    ready,
    flash,
    login: async (role) => {
      await simulateDelay();
      setSession({ role, name: roleToName(role) });
    },
    logout: () => setSession(null),
    resetDemo: async (message) => {
      await simulateDelay();
      setDb(cloneSeed());
      setFlash({ kind: "success", message });
    },
    saveCategory: async (input) => {
      await patchDb((current) => {
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
          activity: addActivity(
            current.activity,
            `Category ${item.name} saved`,
          ),
        };
      }, "Category saved");
    },
    saveBrand: async (input) => {
      await patchDb((current) => {
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
          activity: addActivity(current.activity, `Brand ${item.name} saved`),
        };
      }, "Brand saved");
    },
    saveCustomer: async (input) => {
      await patchDb((current) => {
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
          activity: addActivity(
            current.activity,
            `Customer ${item.name} saved`,
          ),
        };
      }, "Customer saved");
    },
    saveEmployee: async (input) => {
      await patchDb((current) => {
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
          activity: addActivity(
            current.activity,
            `Employee ${item.name} saved`,
          ),
        };
      }, "Employee saved");
    },
    saveProduct: async (input) => {
      await patchDb((current) => {
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
          activity: addActivity(
            current.activity,
            `Product ${product.name} saved`,
          ),
        };
      }, "Product saved");
    },
    deleteEntity: async (type, id) => {
      await patchDb((current) => {
        const activity = addActivity(
          current.activity,
          `Entity removed from ${type}`,
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
      }, "Entity deleted");
    },
    adjustStock: async (productId, delta, reason) => {
      await patchDb((current) => {
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
          activity: addActivity(
            current.activity,
            `Stock adjusted by ${delta > 0 ? "+" : ""}${delta} for ${productId}`,
          ),
        };
      }, "Inventory updated");
    },
    changeOrderStatus: async (orderId, status) => {
      await patchDb((current) => {
        const orders = current.orders.map((order) =>
          order.id === orderId
            ? { ...order, status, updatedAt: new Date().toISOString() }
            : order,
        );
        return {
          ...current,
          orders,
          activity: addActivity(
            current.activity,
            `Order ${orderId} moved to ${status}`,
          ),
        };
      }, "Order status updated");
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
          activity: addActivity(current.activity, "Business settings updated"),
        }),
        "Settings saved",
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
          activity: addActivity(
            current.activity,
            `Media added to ${productId}`,
          ),
        }),
        "Image attached",
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
          activity: addActivity(
            current.activity,
            `Primary image changed for ${productId}`,
          ),
        }),
        "Primary image set",
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

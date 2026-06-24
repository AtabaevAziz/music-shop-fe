"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Locale } from "@/i18n";
import { slugify } from "@/lib/utils";
import {
  DeleteEntityType,
  StoreActionError,
  validateBrandInput,
  validateCategoryInput,
  validateCustomerInput,
  validateDeleteEntity,
  validateEmployeeInput,
  validateOrderStatusTransition,
  validatePrimaryImageSelection,
  validateProductImageInput,
  validateProductInput,
  validateSettingsInput,
  validateStockAdjustment,
} from "@/store/music-store-domain";
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
  deleteEntity: (type: DeleteEntityType, id: string) => Promise<void>;
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
const DB_VERSION = "3";
const DEFAULT_ERROR_MESSAGE = "Unable to complete the requested action.";

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

function readStoredDb() {
  const rawDb = window.localStorage.getItem(DB_KEY);
  const rawDbVersion = window.localStorage.getItem(DB_VERSION_KEY);
  if (!rawDb || rawDbVersion !== DB_VERSION) {
    return null;
  }

  try {
    return JSON.parse(rawDb) as Database;
  } catch {
    return null;
  }
}

function persistDb(db: Database) {
  window.localStorage.setItem(DB_KEY, JSON.stringify(db));
  window.localStorage.setItem(DB_VERSION_KEY, DB_VERSION);
}

function persistSession(session: Session | null) {
  if (session) {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    return;
  }

  window.localStorage.removeItem(SESSION_KEY);
}

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
  const dbRef = useRef<Database>(db);
  const localizedDb = useMemo(
    () => localizeDemoDatabase(db, locale),
    [db, locale],
  );

  useEffect(() => {
    dbRef.current = db;
  }, [db]);

  useEffect(() => {
    const storedDb = readStoredDb();
    const rawSession = window.localStorage.getItem(SESSION_KEY);

    if (storedDb) {
      dbRef.current = storedDb;
      setDb(storedDb);
    } else {
      const nextDb = cloneSeed();
      dbRef.current = nextDb;
      setDb(nextDb);
      persistDb(nextDb);
    }

    if (rawSession) {
      try {
        setSession(JSON.parse(rawSession) as Session);
      } catch {
        window.localStorage.removeItem(SESSION_KEY);
      }
    }

    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) {
      return;
    }

    persistDb(db);
  }, [db, ready]);

  useEffect(() => {
    if (!ready) {
      return;
    }

    persistSession(session);
  }, [ready, session]);

  useEffect(() => {
    if (!flash) {
      return;
    }

    const timer = window.setTimeout(() => setFlash(null), 2200);
    return () => window.clearTimeout(timer);
  }, [flash]);

  const failAction = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE;
    setFlash({ kind: "error", message });
    throw error instanceof Error ? error : new StoreActionError(message);
  };

  const patchDb = async (
    updater: (current: Database) => Database,
    flashConfig?: Flash,
  ) => {
    await simulateDelay();

    try {
      const nextDb = updater(dbRef.current);
      dbRef.current = nextDb;
      setDb(nextDb);
      if (flashConfig) {
        setFlash(flashConfig);
      }
    } catch (error) {
      failAction(error);
    }
  };

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
      const nextDb = cloneSeed();
      dbRef.current = nextDb;
      setDb(nextDb);
      setFlash({ kind: "success", key: "flash.demoResetDone" });
    },
    saveCategory: async (input) => {
      await patchDb(
        (current) => {
          validateCategoryInput(current, input);
          const item: Category = {
            id: input.id ?? nextId("category", input.name),
            name: input.name.trim(),
            slug: slugify(input.name),
            parentId: input.parentId || undefined,
            status: input.status,
            description: input.description.trim(),
          };
          const categories = input.id
            ? current.categories.map((category) =>
                category.id === input.id ? item : category,
              )
            : [item, ...current.categories];
          return {
            ...current,
            categories,
            activity: addActivityEntry(current.activity, "activity.categorySaved", {
              name: item.name,
            }),
          };
        },
        { kind: "success", key: "flash.categorySaved" },
      );
    },
    saveBrand: async (input) => {
      await patchDb(
        (current) => {
          validateBrandInput(current, input);
          const item: Brand = {
            ...input,
            id: input.id ?? nextId("brand", input.name),
            name: input.name.trim(),
            country: input.country.trim(),
            website: input.website.trim(),
          };
          const brands = input.id
            ? current.brands.map((brand) =>
                brand.id === input.id ? item : brand,
              )
            : [item, ...current.brands];
          return {
            ...current,
            brands,
            activity: addActivityEntry(current.activity, "activity.brandSaved", {
              name: item.name,
            }),
          };
        },
        { kind: "success", key: "flash.brandSaved" },
      );
    },
    saveCustomer: async (input) => {
      await patchDb(
        (current) => {
          validateCustomerInput(current, input);
          const item: Customer = {
            ...input,
            id: input.id ?? nextId("customer", input.name),
            name: input.name.trim(),
            phone: input.phone.trim(),
            email: input.email.trim(),
            notes: input.notes.trim(),
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
          validateEmployeeInput(current, input);
          const item: Employee = {
            ...input,
            id: input.id ?? nextId("employee", input.name),
            name: input.name.trim(),
            phone: input.phone.trim(),
            email: input.email.trim(),
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
          validateProductInput(current, input);
          const images = Array.from(new Set(input.images.map((image) => image.trim())));
          const product: Product = {
            ...input,
            id: input.id ?? nextId("product", input.name),
            name: input.name.trim(),
            sku: input.sku.trim(),
            barcode: input.barcode?.trim() || undefined,
            shortDescription: input.shortDescription.trim(),
            description: input.description.trim(),
            images,
            primaryImage: input.primaryImage?.trim() || images[0],
          };
          const products = input.id
            ? current.products.map((item) =>
                item.id === input.id ? product : item,
              )
            : [product, ...current.products];
          return {
            ...current,
            products,
            activity: addActivityEntry(current.activity, "activity.productSaved", {
              name: product.name,
            }),
          };
        },
        { kind: "success", key: "flash.productSaved" },
      );
    },
    deleteEntity: async (type, id) => {
      await patchDb(
        (current) => {
          validateDeleteEntity(current, type, id);
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
          validateStockAdjustment(current, productId, reason);
          const product = current.products.find((item) => item.id === productId);
          const products = current.products.map((item) =>
            item.id === productId
              ? { ...item, stockQty: Math.max(item.stockQty + delta, 0) }
              : item,
          );
          return {
            ...current,
            products,
            inventoryMovements: [
              {
                id: nextId("movement", reason),
                productId,
                delta,
                reason: reason.trim(),
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
          validateOrderStatusTransition(current, orderId, status);
          const orders = current.orders.map((order) =>
            order.id === orderId
              ? { ...order, status, updatedAt: new Date().toISOString() }
              : order,
          );
          return {
            ...current,
            orders,
            activity: addActivityEntry(current.activity, "activity.orderMoved", {
              orderId,
              status,
            }),
          };
        },
        { kind: "success", key: "flash.orderStatusUpdated" },
      );
    },
    saveSettings: async (input) => {
      await patchDb(
        (current) => {
          validateSettingsInput(input);
          return {
            ...current,
            settings: {
              ...input,
              currency: input.currency.trim().toUpperCase(),
            },
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
          };
        },
        { kind: "success", key: "flash.settingsSaved" },
      );
    },
    addProductImage: async (productId, label) => {
      await patchDb(
        (current) => {
          validateProductImageInput(current, productId, label);
          return {
            ...current,
            products: current.products.map((product) =>
              product.id === productId
                ? {
                    ...product,
                    images: [...product.images, label.trim()],
                    primaryImage: product.primaryImage ?? label.trim(),
                  }
                : product,
            ),
            activity: addActivityEntry(current.activity, "activity.mediaAdded", {
              productId,
              productName:
                current.products.find((product) => product.id === productId)
                  ?.name ?? productId,
            }),
          };
        },
        { kind: "success", key: "flash.imageAttached" },
      );
    },
    setPrimaryImage: async (productId, label) => {
      await patchDb(
        (current) => {
          validatePrimaryImageSelection(current, productId, label);
          return {
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
          };
        },
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

export function useStoreDb() {
  return useMusicStore().db;
}

export function useFlashState() {
  return useMusicStore().flash;
}

export function useSessionStore() {
  const { ready, session, login, logout, resetDemo } = useMusicStore();
  return { ready, session, login, logout, resetDemo };
}

export function useCategoryStore() {
  const { db, saveCategory, deleteEntity } = useMusicStore();
  return {
    categories: db.categories,
    saveCategory,
    deleteEntity,
  };
}

export function useBrandStore() {
  const { db, saveBrand, deleteEntity } = useMusicStore();
  return {
    brands: db.brands,
    saveBrand,
    deleteEntity,
  };
}

export function useCustomerStore() {
  const { db, saveCustomer, deleteEntity } = useMusicStore();
  return {
    customers: db.customers,
    saveCustomer,
    deleteEntity,
  };
}

export function useEmployeeStore() {
  const { db, saveEmployee, deleteEntity } = useMusicStore();
  return {
    employees: db.employees,
    saveEmployee,
    deleteEntity,
  };
}

export function useCatalogStore() {
  const { db, saveProduct, deleteEntity } = useMusicStore();
  return {
    products: db.products,
    categories: db.categories,
    brands: db.brands,
    settings: db.settings,
    saveProduct,
    deleteEntity,
  };
}

export function useInventoryStore() {
  const { db, adjustStock } = useMusicStore();
  return {
    products: db.products,
    inventoryMovements: db.inventoryMovements,
    settings: db.settings,
    adjustStock,
  };
}

export function useOrdersStore() {
  const { db, changeOrderStatus } = useMusicStore();
  return {
    orders: db.orders,
    customers: db.customers,
    settings: db.settings,
    changeOrderStatus,
  };
}

export function useMediaStore() {
  const { db, addProductImage, setPrimaryImage } = useMusicStore();
  return {
    products: db.products,
    addProductImage,
    setPrimaryImage,
  };
}

export function useSettingsStore() {
  const { db, saveSettings } = useMusicStore();
  return {
    settings: db.settings,
    saveSettings,
  };
}

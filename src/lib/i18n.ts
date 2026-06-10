export const locales = ["ru", "en"] as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

type Dictionary = {
  brand: string;
  appName: string;
  appSubtitle: string;
  loginTitle: string;
  loginText: string;
  enterAs: string;
  dashboard: string;
  catalog: string;
  categories: string;
  brands: string;
  inventory: string;
  orders: string;
  customers: string;
  employees: string;
  finance: string;
  settings: string;
  media: string;
  logout: string;
  resetDemo: string;
  search: string;
  save: string;
  cancel: string;
  addNew: string;
  edit: string;
  delete: string;
  details: string;
  actions: string;
  status: string;
  language: string;
  revenue: string;
  lowStock: string;
  activeOrders: string;
  completedSales: string;
  recentActivity: string;
  orderPipeline: string;
  paymentState: string;
  financeVisibility: string;
  noData: string;
  demoResetDone: string;
  loginDone: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    brand: "Sonata Ops",
    appName: "Music Instruments Backoffice",
    appSubtitle: "Внутренняя панель для каталога, склада, заказов и финансов",
    loginTitle: "Операционная панель магазина музыкальных инструментов",
    loginText:
      "Интерактивное демо без бэкенда: роли, заказы, склад, товары и настройки работают целиком на клиенте.",
    enterAs: "Войти как",
    dashboard: "Дашборд",
    catalog: "Каталог",
    categories: "Категории",
    brands: "Бренды",
    inventory: "Склад",
    orders: "Заказы",
    customers: "Клиенты",
    employees: "Сотрудники",
    finance: "Финансы",
    settings: "Настройки",
    media: "Медиа",
    logout: "Выйти",
    resetDemo: "Сбросить демо",
    search: "Поиск",
    save: "Сохранить",
    cancel: "Отмена",
    addNew: "Добавить",
    edit: "Редактировать",
    delete: "Удалить",
    details: "Детали",
    actions: "Действия",
    status: "Статус",
    language: "Язык",
    revenue: "Выручка",
    lowStock: "Низкий остаток",
    activeOrders: "Активные заказы",
    completedSales: "Завершённые продажи",
    recentActivity: "Последние действия",
    orderPipeline: "Статусы заказов",
    paymentState: "Оплата",
    financeVisibility: "Финансовая видимость",
    noData: "Данных пока нет",
    demoResetDone: "Демо-данные восстановлены.",
    loginDone: "Сессия активирована.",
  },
  en: {
    brand: "Sonata Ops",
    appName: "Music Instruments Backoffice",
    appSubtitle: "Internal admin for catalog, inventory, orders, and finance",
    loginTitle: "Operational panel for a musical instruments retailer",
    loginText:
      "Interactive demo without a backend: roles, orders, stock, products, and settings run entirely on the client.",
    enterAs: "Enter as",
    dashboard: "Dashboard",
    catalog: "Catalog",
    categories: "Categories",
    brands: "Brands",
    inventory: "Inventory",
    orders: "Orders",
    customers: "Customers",
    employees: "Employees",
    finance: "Finance",
    settings: "Settings",
    media: "Media",
    logout: "Logout",
    resetDemo: "Reset demo",
    search: "Search",
    save: "Save",
    cancel: "Cancel",
    addNew: "Add new",
    edit: "Edit",
    delete: "Delete",
    details: "Details",
    actions: "Actions",
    status: "Status",
    language: "Language",
    revenue: "Revenue",
    lowStock: "Low stock",
    activeOrders: "Active orders",
    completedSales: "Completed sales",
    recentActivity: "Recent activity",
    orderPipeline: "Order pipeline",
    paymentState: "Payment",
    financeVisibility: "Finance visibility",
    noData: "No data yet",
    demoResetDone: "Demo data restored.",
    loginDone: "Session activated.",
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

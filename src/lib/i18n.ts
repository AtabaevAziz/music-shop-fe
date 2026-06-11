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
  confirmDelete: string;
  deletePrompt: string;
  close: string;
  dashboardLowStockSubtitle: string;
  dashboardPipelineSubtitle: string;
  dashboardFeaturedTitle: string;
  dashboardFeaturedSubtitle: string;
  dashboardActivitySubtitle: string;
  product: string;
  sku: string;
  qty: string;
  financeSubtitle: string;
  grossMargin: string;
  paidOrders: string;
  order: string;
  total: string;
  margin: string;
  inventorySubtitle: string;
  available: string;
  condition: string;
  stockHealth: string;
  stockAdjustment: string;
  stockAdjustmentSubtitle: string;
  recentMovements: string;
  recentMovementsSubtitle: string;
  replenishmentRisk: string;
  thresholdLabel: string;
  stockOnHand: string;
  showroomUnits: string;
  movementCount: string;
  delta: string;
  reason: string;
  currentStock: string;
  stockHealthy: string;
  manualCorrection: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    brand: "Music Shop",
    appName: "Music Shop Backoffice",
    appSubtitle: "Панель магазина для каталога, склада, заказов и финансов",
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
    confirmDelete: "Подтвердить удаление",
    deletePrompt: "Это действие нельзя отменить.",
    close: "Закрыть",
    dashboardLowStockSubtitle: "Товары ниже порога пополнения",
    dashboardPipelineSubtitle: "Операционная видимость выполнения заказов",
    dashboardFeaturedTitle: "Актуальный ассортимент",
    dashboardFeaturedSubtitle: "Быстрый срез по текущим товарам витрины",
    dashboardActivitySubtitle: "Последние события клиентского демо",
    product: "Товар",
    sku: "SKU",
    qty: "Кол-во",
    financeSubtitle: "Контроль выручки и маржи для внутренних операций",
    grossMargin: "Валовая маржа",
    paidOrders: "Оплаченные заказы",
    order: "Заказ",
    total: "Сумма",
    margin: "Маржа",
    inventorySubtitle: "Остатки, риск пополнения и последние движения по складу",
    available: "В наличии",
    condition: "Состояние",
    stockHealth: "Состояние остатка",
    stockAdjustment: "Корректировка остатков",
    stockAdjustmentSubtitle: "Быстрое складское действие с сохранением в localStorage",
    recentMovements: "Последние движения",
    recentMovementsSubtitle: "Журнал последних операций по остаткам",
    replenishmentRisk: "Риск пополнения",
    thresholdLabel: "Порог",
    stockOnHand: "Товарных единиц",
    showroomUnits: "Шоурум-позиций",
    movementCount: "Движений сегодня",
    delta: "Изменение",
    reason: "Причина",
    currentStock: "Текущий остаток",
    stockHealthy: "Норма",
    manualCorrection: "Ручная корректировка",
  },
  en: {
    brand: "Music Shop",
    appName: "Music Shop Backoffice",
    appSubtitle: "Store admin for catalog, inventory, orders, and finance",
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
    confirmDelete: "Confirm deletion",
    deletePrompt: "This action cannot be undone.",
    close: "Close",
    dashboardLowStockSubtitle: "Products below replenishment threshold",
    dashboardPipelineSubtitle: "Operational fulfillment visibility",
    dashboardFeaturedTitle: "Featured assortment",
    dashboardFeaturedSubtitle: "Fast view of the current storefront mix",
    dashboardActivitySubtitle: "Latest browser-side demo events",
    product: "Product",
    sku: "SKU",
    qty: "Qty",
    financeSubtitle: "Revenue and margin awareness for internal operations",
    grossMargin: "Gross margin",
    paidOrders: "Paid orders",
    order: "Order",
    total: "Total",
    margin: "Margin",
    inventorySubtitle: "Current stock, replenishment risk, and recent warehouse movement visibility",
    available: "Available",
    condition: "Condition",
    stockHealth: "Stock health",
    stockAdjustment: "Stock adjustment",
    stockAdjustmentSubtitle: "Fast inventory action persisted in localStorage",
    recentMovements: "Recent movements",
    recentMovementsSubtitle: "Latest stock operations log",
    replenishmentRisk: "Replenishment risk",
    thresholdLabel: "Threshold",
    stockOnHand: "Units on hand",
    showroomUnits: "Showroom units",
    movementCount: "Movements today",
    delta: "Delta",
    reason: "Reason",
    currentStock: "Current stock",
    stockHealthy: "Healthy",
    manualCorrection: "Manual correction",
  },
};

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

const dynamicLabels = {
  ru: {
    active: "Активный",
    inactive: "Неактивный",
    draft: "Черновик",
    archived: "Архивный",
    new: "Новый",
    confirmed: "Подтвержден",
    packed: "Собран",
    ready_for_pickup: "Готов к выдаче",
    completed: "Завершен",
    cancelled: "Отменен",
    used: "Б/у",
    showroom: "Шоурум",
    pending: "Ожидает",
    partial: "Частично",
    paid: "Оплачен",
    refunded: "Возврат",
    standard: "Стандарт",
    studio: "Студия",
    vip: "VIP",
    admin: "Администратор",
    store_manager: "Менеджер магазина",
    catalog_manager: "Менеджер каталога",
    sales_operator: "Оператор продаж",
  },
  en: {
    active: "Active",
    inactive: "Inactive",
    draft: "Draft",
    archived: "Archived",
    new: "New",
    confirmed: "Confirmed",
    packed: "Packed",
    ready_for_pickup: "Ready for pickup",
    completed: "Completed",
    cancelled: "Cancelled",
    used: "Used",
    showroom: "Showroom",
    pending: "Pending",
    partial: "Partial",
    paid: "Paid",
    refunded: "Refunded",
    standard: "Standard",
    studio: "Studio",
    vip: "VIP",
    admin: "Admin",
    store_manager: "Store manager",
    catalog_manager: "Catalog manager",
    sales_operator: "Sales operator",
  },
} as const;

export function translateDynamicLabel(locale: Locale, value: string) {
  return (
    dynamicLabels[locale][value as keyof (typeof dynamicLabels)[Locale]] ??
    value.replaceAll("_", " ")
  );
}

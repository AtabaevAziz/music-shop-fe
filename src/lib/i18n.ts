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
  loginModulesLabel: string;
  loginModulesValue: string;
  loginDemoLabel: string;
  loginDemoValue: string;
  enterAs: string;
  adminBlurb: string;
  storeManagerBlurb: string;
  catalogManagerBlurb: string;
  salesOperatorBlurb: string;
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
  catalogSubtitle: string;
  categoriesSubtitle: string;
  brandsSubtitle: string;
  ordersSubtitle: string;
  customersSubtitle: string;
  employeesSubtitle: string;
  settingsSubtitle: string;
  mediaSubtitle: string;
  product: string;
  sku: string;
  qty: string;
  currencyLabel: string;
  lowStockThresholdLabel: string;
  defaultProductStatusLabel: string;
  defaultMarkupLabel: string;
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
  inventoryThresholdTitle: string;
  inventoryThresholdHelp: string;
};

export const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    brand: "Music Shop",
    appName: "Music Shop Online",
    appSubtitle: "Онлайн-магазин с каталогом, заказами и складом",
    loginTitle: "Онлайн-магазин музыкальных инструментов и операционная панель",
    loginText:
      "Демо интернет-магазина музыкальных инструментов: каталог товаров, заказы, клиенты, склад и настройки доступны целиком на клиенте без бэкенда.",
    loginModulesLabel: "Разделы",
    loginModulesValue: "Дашборд, каталог, склад, заказы и финансы",
    loginDemoLabel: "Демо-режим",
    loginDemoValue: "Состояние хранится на клиенте и сохраняется локально",
    enterAs: "Войти как",
    adminBlurb: "Полный доступ к операциям, пользователям и настройкам.",
    storeManagerBlurb: "Заказы, склад, сотрудники и обзор финансов магазина.",
    catalogManagerBlurb: "Товары, бренды, категории и управление медиа.",
    salesOperatorBlurb: "Заказы, клиенты и обработка самовывоза.",
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
    catalogSubtitle: "Товары, цены, описания и merchandising-статусы каталога.",
    categoriesSubtitle:
      "Структурированная товарная таксономия для музыкального каталога.",
    brandsSubtitle: "Справочник брендов, вендоров и производителей.",
    ordersSubtitle: "Обработка заказов и продвижение по этапам выполнения.",
    customersSubtitle: "Клиентские записи с видимостью для заказов и продаж.",
    employeesSubtitle:
      "Внутренние пользователи и роли для защищённого доступа.",
    settingsSubtitle:
      "Настройки, влияющие на ценообразование и складское поведение.",
    product: "Товар",
    sku: "SKU",
    qty: "Кол-во",
    currencyLabel: "Валюта",
    lowStockThresholdLabel: "Порог низкого остатка",
    defaultProductStatusLabel: "Статус товара по умолчанию",
    defaultMarkupLabel: "Наценка по умолчанию %",
    financeSubtitle: "Контроль выручки и маржи для внутренних операций",
    grossMargin: "Валовая маржа",
    paidOrders: "Оплаченные заказы",
    order: "Заказ",
    total: "Сумма",
    margin: "Маржа",
    inventorySubtitle:
      "Остатки, риск пополнения и последние движения по складу",
    available: "В наличии",
    condition: "Состояние",
    stockHealth: "Состояние остатка",
    stockAdjustment: "Корректировка остатков",
    stockAdjustmentSubtitle:
      "Быстрое складское действие с сохранением в localStorage",
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
    mediaSubtitle:
      "Пути к изображениям товаров и управление основным изображением.",
    inventoryThresholdTitle: "Порог остатков",
    inventoryThresholdHelp:
      "Это значение используется для предупреждений в складе и на дашборде.",
  },
  en: {
    brand: "Music Shop",
    appName: "Music Shop Online",
    appSubtitle: "Online store with catalog, orders, and inventory tools",
    loginTitle: "Online musical instrument store and operations backoffice",
    loginText:
      "Browser-only demo of a musical instrument ecommerce operation with products, orders, customers, inventory, and settings running fully on the client.",
    loginModulesLabel: "Modules",
    loginModulesValue: "Dashboard, Catalog, Inventory, Orders, and Finance",
    loginDemoLabel: "Demo mode",
    loginDemoValue: "Frontend-only state with local persistence",
    enterAs: "Enter as",
    adminBlurb: "Full operational access with user and settings control.",
    storeManagerBlurb:
      "Orders, inventory, staff overview, and finance visibility.",
    catalogManagerBlurb: "Products, brands, categories, and media workflows.",
    salesOperatorBlurb: "Orders, customers, and pickup processing.",
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
    catalogSubtitle:
      "Products, pricing, descriptions, and merchandising status.",
    categoriesSubtitle:
      "Structured product taxonomy for the music retail catalog.",
    brandsSubtitle: "Reusable vendor and manufacturer records.",
    ordersSubtitle: "Internal order processing and fulfillment progression.",
    customersSubtitle:
      "Internal customer records with order-facing visibility.",
    employeesSubtitle:
      "Role-aware internal users for protected backoffice access.",
    settingsSubtitle:
      "Settings-driven behavior for pricing and inventory control.",
    product: "Product",
    sku: "SKU",
    qty: "Qty",
    currencyLabel: "Currency",
    lowStockThresholdLabel: "Low stock threshold",
    defaultProductStatusLabel: "Default product status",
    defaultMarkupLabel: "Default markup %",
    financeSubtitle: "Revenue and margin awareness for internal operations",
    grossMargin: "Gross margin",
    paidOrders: "Paid orders",
    order: "Order",
    total: "Total",
    margin: "Margin",
    inventorySubtitle:
      "Current stock, replenishment risk, and recent warehouse movement visibility",
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
    mediaSubtitle: "Attach product image paths and manage primary artwork.",
    inventoryThresholdTitle: "Inventory threshold",
    inventoryThresholdHelp:
      "Reorder alerts use this value across inventory and dashboard views.",
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

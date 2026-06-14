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
  nameLabel: string;
  descriptionLabel: string;
  countryLabel: string;
  websiteLabel: string;
  phoneLabel: string;
  emailLabel: string;
  parentLabel: string;
  rootLabel: string;
  slugLabel: string;
  roleLabel: string;
  tierLabel: string;
  notesLabel: string;
  previewLabel: string;
  categoryLabel: string;
  brandLabel: string;
  priceLabel: string;
  stockLabel: string;
  barcodeLabel: string;
  selectLabel: string;
  costPriceLabel: string;
  stockQtyLabel: string;
  shortDescriptionLabel: string;
  fullDescriptionLabel: string;
  imagesPerLineLabel: string;
  specsKeyValueLabel: string;
  productRecordSubtitle: string;
  validationFailed: string;
  customerLabel: string;
  workflowControlsTitle: string;
  workflowControlsSubtitle: string;
  imagePathLabel: string;
  productGalleryPreviewSubtitle: string;
  primaryLabel: string;
  setPrimaryLabel: string;
  loadingWorkspace: string;
  accessRestrictedTitle: string;
  accessRestrictedText: string;
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
    nameLabel: "Название",
    descriptionLabel: "Описание",
    countryLabel: "Страна",
    websiteLabel: "Сайт",
    phoneLabel: "Телефон",
    emailLabel: "Email",
    parentLabel: "Родитель",
    rootLabel: "Корень",
    slugLabel: "Слаг",
    roleLabel: "Роль",
    tierLabel: "Уровень",
    notesLabel: "Заметки",
    previewLabel: "Превью",
    categoryLabel: "Категория",
    brandLabel: "Бренд",
    priceLabel: "Цена",
    stockLabel: "Остаток",
    barcodeLabel: "Штрихкод",
    selectLabel: "Выбрать",
    costPriceLabel: "Себестоимость",
    stockQtyLabel: "Кол-во на складе",
    shortDescriptionLabel: "Краткое описание",
    fullDescriptionLabel: "Полное описание",
    imagesPerLineLabel: "Изображения, по одному на строку",
    specsKeyValueLabel: "Характеристики в формате Ключ: Значение",
    productRecordSubtitle: "Карточка товара",
    validationFailed: "Проверьте заполнение формы.",
    customerLabel: "Клиент",
    workflowControlsTitle: "Управление этапами",
    workflowControlsSubtitle: "Смоделируйте прохождение заказа по этапам.",
    imagePathLabel: "Путь к изображению",
    productGalleryPreviewSubtitle: "Предпросмотр галереи товара",
    primaryLabel: "основное",
    setPrimaryLabel: "Сделать основным",
    loadingWorkspace: "Загрузка рабочего пространства...",
    accessRestrictedTitle: "Доступ ограничен",
    accessRestrictedText:
      "Эта роль может войти в систему, но данный модуль скрыт настройками демо-доступа.",
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
    nameLabel: "Name",
    descriptionLabel: "Description",
    countryLabel: "Country",
    websiteLabel: "Website",
    phoneLabel: "Phone",
    emailLabel: "Email",
    parentLabel: "Parent",
    rootLabel: "Root",
    slugLabel: "Slug",
    roleLabel: "Role",
    tierLabel: "Tier",
    notesLabel: "Notes",
    previewLabel: "Preview",
    categoryLabel: "Category",
    brandLabel: "Brand",
    priceLabel: "Price",
    stockLabel: "Stock",
    barcodeLabel: "Barcode",
    selectLabel: "Select",
    costPriceLabel: "Cost price",
    stockQtyLabel: "Stock qty",
    shortDescriptionLabel: "Short description",
    fullDescriptionLabel: "Full description",
    imagesPerLineLabel: "Images, one per line",
    specsKeyValueLabel: "Specs as Key: Value",
    productRecordSubtitle: "Product record",
    validationFailed: "Please review the form fields.",
    customerLabel: "Customer",
    workflowControlsTitle: "Workflow controls",
    workflowControlsSubtitle: "Simulate retail order progression.",
    imagePathLabel: "Image path",
    productGalleryPreviewSubtitle: "Product gallery preview",
    primaryLabel: "primary",
    setPrimaryLabel: "Set primary",
    loadingWorkspace: "Loading workspace...",
    accessRestrictedTitle: "Access restricted",
    accessRestrictedText:
      "This role can sign in, but this module is intentionally hidden in the demo access matrix.",
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

type StoreMessageParams = Record<string, string | number | undefined>;

function entityLabel(locale: Locale, entityType: string) {
  const dict = getDictionary(locale);

  return (
    {
      categories: dict.categories,
      brands: dict.brands,
      customers: dict.customers,
      employees: dict.employees,
      products: dict.catalog,
    }[entityType] ?? entityType
  );
}

export function formatStoreMessage(
  locale: Locale,
  key: string,
  params: StoreMessageParams = {},
) {
  const dict = getDictionary(locale);
  const name = String(params.name ?? "");
  const orderId = String(params.orderId ?? "");
  const productName = String(params.productName ?? params.productId ?? "");
  const status = String(params.status ?? "");
  const delta = String(params.delta ?? "");

  switch (key) {
    case "categorySavedFlash":
      return locale === "ru" ? "Категория сохранена" : "Category saved";
    case "brandSavedFlash":
      return locale === "ru" ? "Бренд сохранён" : "Brand saved";
    case "customerSavedFlash":
      return locale === "ru" ? "Клиент сохранён" : "Customer saved";
    case "employeeSavedFlash":
      return locale === "ru" ? "Сотрудник сохранён" : "Employee saved";
    case "productSavedFlash":
      return locale === "ru" ? "Товар сохранён" : "Product saved";
    case "entityDeletedFlash":
      return locale === "ru" ? "Запись удалена" : "Entity deleted";
    case "inventoryUpdatedFlash":
      return locale === "ru" ? "Склад обновлён" : "Inventory updated";
    case "orderStatusUpdatedFlash":
      return locale === "ru"
        ? "Статус заказа обновлён"
        : "Order status updated";
    case "settingsSavedFlash":
      return locale === "ru" ? "Настройки сохранены" : "Settings saved";
    case "imageAttachedFlash":
      return locale === "ru" ? "Изображение прикреплено" : "Image attached";
    case "primaryImageSetFlash":
      return locale === "ru"
        ? "Основное изображение обновлено"
        : "Primary image set";
    case "categorySavedActivity":
      return locale === "ru"
        ? `Категория ${name} сохранена`
        : `Category ${name} saved`;
    case "brandSavedActivity":
      return locale === "ru" ? `Бренд ${name} сохранён` : `Brand ${name} saved`;
    case "customerSavedActivity":
      return locale === "ru"
        ? `Клиент ${name} сохранён`
        : `Customer ${name} saved`;
    case "employeeSavedActivity":
      return locale === "ru"
        ? `Сотрудник ${name} сохранён`
        : `Employee ${name} saved`;
    case "productSavedActivity":
      return locale === "ru"
        ? `Товар ${name} сохранён`
        : `Product ${name} saved`;
    case "entityRemovedActivity":
      return locale === "ru"
        ? `Запись удалена из раздела ${entityLabel(locale, String(params.entityType ?? ""))}`
        : `Entity removed from ${entityLabel(locale, String(params.entityType ?? ""))}`;
    case "stockAdjustedActivity":
      return locale === "ru"
        ? `Остаток ${productName} скорректирован на ${delta}`
        : `Stock adjusted by ${delta} for ${productName}`;
    case "orderMovedActivity":
      return locale === "ru"
        ? `Заказ ${orderId} переведён в статус ${translateDynamicLabel(locale, status)}`
        : `Order ${orderId} moved to ${translateDynamicLabel(locale, status)}`;
    case "businessSettingsUpdatedActivity":
      return locale === "ru"
        ? "Бизнес-настройки обновлены"
        : "Business settings updated";
    case "mediaAddedActivity":
      return locale === "ru"
        ? `Медиа добавлено к ${productName}`
        : `Media added to ${productName}`;
    case "primaryImageChangedActivity":
      return locale === "ru"
        ? `Основное изображение изменено для ${productName}`
        : `Primary image changed for ${productName}`;
    case "seedOrderReadyActivity":
      return locale === "ru"
        ? `Заказ ${orderId} отмечен как готовый к выдаче`
        : `Order ${orderId} marked ready for pickup`;
    case "seedReservedStockActivity":
      return locale === "ru"
        ? `Остаток ${productName} зарезервирован для заказа ${orderId}`
        : `${productName} stock reserved for order ${orderId}`;
    case "seedSupplierBatchActivity":
      return locale === "ru"
        ? `Новая поставка получена для ${productName}`
        : `New supplier batch received for ${productName}`;
    default:
      return key;
  }
}

import { Locale } from "@/lib/i18n";
import { slugify } from "@/lib/utils";
import { Database } from "@/types/music";

const now = new Date();

export const seedDatabase: Database = {
  categories: [
    {
      id: "cat-guitars",
      name: "Guitars",
      slug: "guitars",
      status: "active",
      description: "Electric, acoustic, bass, and premium models.",
    },
    {
      id: "cat-keys",
      name: "Keyboards",
      slug: "keyboards",
      status: "active",
      description: "Stage pianos, synthesizers, and controllers.",
    },
    {
      id: "cat-drums",
      name: "Drums",
      slug: "drums",
      status: "active",
      description: "Acoustic kits, electronic pads, cymbals.",
    },
    {
      id: "cat-studio",
      name: "Studio Gear",
      slug: "studio-gear",
      status: "active",
      description: "Interfaces, monitors, and microphones.",
    },
    {
      id: "cat-accessories",
      name: "Accessories",
      slug: "accessories",
      parentId: "cat-guitars",
      status: "active",
      description: "Strings, cables, stands, and cases.",
    },
  ],
  brands: [
    {
      id: "brand-fender",
      name: "Fender",
      country: "USA",
      website: "https://www.fender.com",
      status: "active",
    },
    {
      id: "brand-yamaha",
      name: "Yamaha",
      country: "Japan",
      website: "https://www.yamaha.com",
      status: "active",
    },
    {
      id: "brand-roland",
      name: "Roland",
      country: "Japan",
      website: "https://www.roland.com",
      status: "active",
    },
    {
      id: "brand-shure",
      name: "Shure",
      country: "USA",
      website: "https://www.shure.com",
      status: "active",
    },
    {
      id: "brand-pearl",
      name: "Pearl",
      country: "Japan",
      website: "https://pearldrum.com",
      status: "active",
    },
  ],
  products: [
    {
      id: "prod-strat",
      name: "Fender Player Stratocaster",
      sku: "GTR-STRAT-001",
      barcode: "190123490001",
      categoryId: "cat-guitars",
      brandId: "brand-fender",
      price: 820,
      costPrice: 640,
      stockQty: 5,
      status: "active",
      shortDescription: "Best-selling electric guitar for live and studio use.",
      description:
        "A versatile electric guitar with alder body, maple neck, and modern C profile.",
      specs: {
        Body: "Alder",
        Neck: "Maple",
        Pickups: "SSS",
        Color: "3-Color Sunburst",
      },
      images: ["/products/fender-player-stratocaster.jpg"],
      primaryImage: "/products/fender-player-stratocaster.jpg",
      condition: "new",
    },
    {
      id: "prod-p125",
      name: "Yamaha P-125",
      sku: "KEY-P125-002",
      barcode: "4957812629002",
      categoryId: "cat-keys",
      brandId: "brand-yamaha",
      price: 690,
      costPrice: 540,
      stockQty: 2,
      status: "active",
      shortDescription: "Portable digital piano with graded hammer action.",
      description: "Compact piano for home, teaching, and rehearsal spaces.",
      specs: {
        Keys: "88",
        Polyphony: "192",
        Weight: "11.8 kg",
        Finish: "Black",
      },
      images: ["/products/yamaha-p125.jpg"],
      primaryImage: "/products/yamaha-p125.jpg",
      condition: "new",
    },
    {
      id: "prod-spd",
      name: "Roland SPD-SX",
      sku: "DRM-SPDSX-003",
      barcode: "761294500333",
      categoryId: "cat-drums",
      brandId: "brand-roland",
      price: 999,
      costPrice: 760,
      stockQty: 1,
      status: "active",
      shortDescription:
        "Sampling percussion pad for stage and hybrid drummers.",
      description:
        "Powerful percussion sampling pad with nine pads and live control workflow.",
      specs: {
        Pads: "9",
        Outputs: "Stereo + Sub",
        USB: "Yes",
        Memory: "16 GB",
      },
      images: ["/products/roland-spd-sx.jpg"],
      primaryImage: "/products/roland-spd-sx.jpg",
      condition: "showroom",
    },
    {
      id: "prod-sm7b",
      name: "Shure SM7B",
      sku: "MIC-SM7B-004",
      barcode: "042406088879",
      categoryId: "cat-studio",
      brandId: "brand-shure",
      price: 429,
      costPrice: 325,
      stockQty: 8,
      status: "active",
      shortDescription: "Broadcast-grade dynamic microphone.",
      description:
        "Studio and podcast microphone with smooth response and effective shielding.",
      specs: {
        Type: "Dynamic",
        Pattern: "Cardioid",
        Application: "Vocal / Broadcast",
      },
      images: ["/products/shure-sm7b.jpg"],
      primaryImage: "/products/shure-sm7b.jpg",
      condition: "new",
    },
  ],
  inventoryMovements: [
    {
      id: "mov-1",
      productId: "prod-p125",
      delta: -1,
      reason: "Floor demo allocation",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 18).toISOString(),
    },
    {
      id: "mov-2",
      productId: "prod-strat",
      delta: 3,
      reason: "Weekly supplier delivery",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 30).toISOString(),
    },
    {
      id: "mov-3",
      productId: "prod-spd",
      delta: -1,
      reason: "Reserved for pickup",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    },
  ],
  customers: [
    {
      id: "cust-1",
      name: "Studio Pulse",
      phone: "+998 90 111 22 33",
      email: "ops@studiopulse.uz",
      tier: "studio",
      status: "active",
      notes: "Monthly B2B buyer for microphones.",
    },
    {
      id: "cust-2",
      name: "Aziza Karimova",
      phone: "+998 97 555 08 18",
      email: "aziza.k@example.com",
      tier: "vip",
      status: "active",
      notes: "Prefers premium keyboards.",
    },
    {
      id: "cust-3",
      name: "Farhod Melikov",
      phone: "+998 93 345 14 66",
      email: "fm@example.com",
      tier: "standard",
      status: "active",
      notes: "Pickup orders only.",
    },
  ],
  orders: [
    {
      id: "ORD-24061",
      customerId: "cust-1",
      items: [
        { productId: "prod-sm7b", qty: 2, unitPrice: 429 },
        { productId: "prod-strat", qty: 1, unitPrice: 820 },
      ],
      paymentStatus: "partial",
      status: "confirmed",
      notes: "Invoice split between studio and founder account.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 26).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 3).toISOString(),
    },
    {
      id: "ORD-24062",
      customerId: "cust-2",
      items: [{ productId: "prod-p125", qty: 1, unitPrice: 690 }],
      paymentStatus: "paid",
      status: "ready_for_pickup",
      notes: "Pickup scheduled after 18:00.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 10).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "ORD-24063",
      customerId: "cust-3",
      items: [{ productId: "prod-spd", qty: 1, unitPrice: 999 }],
      paymentStatus: "pending",
      status: "new",
      notes: "Needs manager call before confirmation.",
      createdAt: new Date(now.getTime() - 1000 * 60 * 60 * 4).toISOString(),
      updatedAt: new Date(now.getTime() - 1000 * 60 * 60 * 1).toISOString(),
    },
  ],
  employees: [
    {
      id: "emp-1",
      name: "Nodir Ismoilov",
      email: "nodir@musicshop.test",
      phone: "+998 90 111 00 00",
      role: "admin",
      status: "active",
    },
    {
      id: "emp-2",
      name: "Diana Petrova",
      email: "diana@musicshop.test",
      phone: "+998 90 222 00 00",
      role: "store_manager",
      status: "active",
    },
    {
      id: "emp-3",
      name: "Sardor Yuldashev",
      email: "sardor@musicshop.test",
      phone: "+998 90 333 00 00",
      role: "catalog_manager",
      status: "active",
    },
    {
      id: "emp-4",
      name: "Anya Mironova",
      email: "anya@musicshop.test",
      phone: "+998 90 444 00 00",
      role: "sales_operator",
      status: "active",
    },
  ],
  settings: {
    currency: "USD",
    lowStockThreshold: 3,
    defaultProductStatus: "draft",
    defaultMarkupPercent: 28,
  },
  activity: [
    {
      id: "act-1",
      title: "Order ORD-24062 marked ready for pickup",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "act-2",
      title: "Roland SPD-SX stock reserved for order ORD-24063",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 5).toISOString(),
    },
    {
      id: "act-3",
      title: "New supplier batch received for Fender guitars",
      timestamp: new Date(now.getTime() - 1000 * 60 * 60 * 30).toISOString(),
    },
  ],
};

export function nextId(prefix: string, value: string) {
  return `${prefix}-${slugify(value)}-${Math.random().toString(36).slice(2, 6)}`;
}

const localizedCategoryContent = {
  "cat-guitars": {
    ru: {
      name: "Гитары",
      description: "Электро, акустические, басовые и премиальные модели.",
    },
    en: {
      name: "Guitars",
      description: "Electric, acoustic, bass, and premium models.",
    },
  },
  "cat-keys": {
    ru: {
      name: "Клавишные",
      description: "Сценические пианино, синтезаторы и контроллеры.",
    },
    en: {
      name: "Keyboards",
      description: "Stage pianos, synthesizers, and controllers.",
    },
  },
  "cat-drums": {
    ru: {
      name: "Ударные",
      description: "Акустические установки, электронные пэды и тарелки.",
    },
    en: {
      name: "Drums",
      description: "Acoustic kits, electronic pads, cymbals.",
    },
  },
  "cat-studio": {
    ru: {
      name: "Студийное оборудование",
      description: "Интерфейсы, мониторы и микрофоны.",
    },
    en: {
      name: "Studio Gear",
      description: "Interfaces, monitors, and microphones.",
    },
  },
  "cat-accessories": {
    ru: {
      name: "Аксессуары",
      description: "Струны, кабели, стойки и кейсы.",
    },
    en: {
      name: "Accessories",
      description: "Strings, cables, stands, and cases.",
    },
  },
} as const;

const localizedProductContent = {
  "prod-strat": {
    ru: {
      shortDescription: "Хитовая электрогитара для сцены и студийной работы.",
      description:
        "Универсальная электрогитара с корпусом из ольхи, кленовым грифом и современным профилем C.",
      specs: {
        Корпус: "Ольха",
        Гриф: "Клён",
        Звукосниматели: "SSS",
        Цвет: "3-Color Sunburst",
      },
    },
    en: {
      shortDescription: "Best-selling electric guitar for live and studio use.",
      description:
        "A versatile electric guitar with alder body, maple neck, and modern C profile.",
      specs: {
        Body: "Alder",
        Neck: "Maple",
        Pickups: "SSS",
        Color: "3-Color Sunburst",
      },
    },
  },
  "prod-p125": {
    ru: {
      shortDescription:
        "Портативное цифровое пианино с молоточковой механикой.",
      description:
        "Компактное пианино для дома, обучения и репетиционных пространств.",
      specs: {
        Клавиши: "88",
        Полифония: "192",
        Вес: "11.8 кг",
        Цвет: "Чёрный",
      },
    },
    en: {
      shortDescription: "Portable digital piano with graded hammer action.",
      description: "Compact piano for home, teaching, and rehearsal spaces.",
      specs: {
        Keys: "88",
        Polyphony: "192",
        Weight: "11.8 kg",
        Finish: "Black",
      },
    },
  },
  "prod-spd": {
    ru: {
      shortDescription:
        "Сэмплирующий перкуссионный пэд для сцены и гибридных барабанщиков.",
      description:
        "Мощный перкуссионный сэмплер с девятью пэдами и удобным live-workflow.",
      specs: {
        Пэды: "9",
        Выходы: "Stereo + Sub",
        USB: "Да",
        Память: "16 ГБ",
      },
    },
    en: {
      shortDescription:
        "Sampling percussion pad for stage and hybrid drummers.",
      description:
        "Powerful percussion sampling pad with nine pads and live control workflow.",
      specs: {
        Pads: "9",
        Outputs: "Stereo + Sub",
        USB: "Yes",
        Memory: "16 GB",
      },
    },
  },
  "prod-sm7b": {
    ru: {
      shortDescription: "Динамический микрофон вещательного класса.",
      description:
        "Студийный и подкастовый микрофон с мягкой АЧХ и эффективным экранированием.",
      specs: {
        Тип: "Динамический",
        Диаграмма: "Кардиоидная",
        Применение: "Вокал / Вещание",
      },
    },
    en: {
      shortDescription: "Broadcast-grade dynamic microphone.",
      description:
        "Studio and podcast microphone with smooth response and effective shielding.",
      specs: {
        Type: "Dynamic",
        Pattern: "Cardioid",
        Application: "Vocal / Broadcast",
      },
    },
  },
} as const;

const localizedMovementReasons = {
  "mov-1": {
    ru: "Выделено для демо-зала",
    en: "Floor demo allocation",
  },
  "mov-2": {
    ru: "Еженедельная поставка от поставщика",
    en: "Weekly supplier delivery",
  },
  "mov-3": {
    ru: "Зарезервировано под самовывоз",
    en: "Reserved for pickup",
  },
} as const;

const localizedCustomerNotes = {
  "cust-1": {
    ru: "Ежемесячный B2B-покупатель микрофонов.",
    en: "Monthly B2B buyer for microphones.",
  },
  "cust-2": {
    ru: "Предпочитает премиальные клавишные.",
    en: "Prefers premium keyboards.",
  },
  "cust-3": {
    ru: "Оформляет только заказы на самовывоз.",
    en: "Pickup orders only.",
  },
} as const;

const localizedOrderNotes = {
  "ORD-24061": {
    ru: "Счёт разделён между студией и аккаунтом основателя.",
    en: "Invoice split between studio and founder account.",
  },
  "ORD-24062": {
    ru: "Самовывоз запланирован после 18:00.",
    en: "Pickup scheduled after 18:00.",
  },
  "ORD-24063": {
    ru: "Нужен звонок менеджера перед подтверждением.",
    en: "Needs manager call before confirmation.",
  },
} as const;

const localizedActivityTitles = {
  "act-1": {
    ru: "Заказ ORD-24062 отмечен как готовый к выдаче",
    en: "Order ORD-24062 marked ready for pickup",
  },
  "act-2": {
    ru: "Остаток Roland SPD-SX зарезервирован для заказа ORD-24063",
    en: "Roland SPD-SX stock reserved for order ORD-24063",
  },
  "act-3": {
    ru: "Новая поставка получена для гитар Fender",
    en: "New supplier batch received for Fender guitars",
  },
} as const;

function localizeText(
  value: string,
  translations: Record<Locale, string> | undefined,
  locale: Locale,
) {
  if (!translations) return value;
  const knownVariants = Object.values(translations);
  return knownVariants.includes(value) ? translations[locale] : value;
}

function localizeSpecs(
  specs: Record<string, string>,
  translations:
    | {
        ru: Record<string, string>;
        en: Record<string, string>;
      }
    | undefined,
  locale: Locale,
) {
  if (!translations) return specs;

  const knownVariants = Object.values(translations).map((variant) =>
    JSON.stringify(variant),
  );

  return knownVariants.includes(JSON.stringify(specs))
    ? translations[locale]
    : specs;
}

export function localizeDemoDatabase(db: Database, locale: Locale): Database {
  return {
    ...db,
    categories: db.categories.map((category) => {
      const translations =
        localizedCategoryContent[
          category.id as keyof typeof localizedCategoryContent
        ];

      return {
        ...category,
        name: localizeText(
          category.name,
          translations && {
            ru: translations.ru.name,
            en: translations.en.name,
          },
          locale,
        ),
        description: localizeText(
          category.description,
          translations && {
            ru: translations.ru.description,
            en: translations.en.description,
          },
          locale,
        ),
      };
    }),
    products: db.products.map((product) => {
      const translations =
        localizedProductContent[
          product.id as keyof typeof localizedProductContent
        ];

      return {
        ...product,
        shortDescription: localizeText(
          product.shortDescription,
          translations && {
            ru: translations.ru.shortDescription,
            en: translations.en.shortDescription,
          },
          locale,
        ),
        description: localizeText(
          product.description,
          translations && {
            ru: translations.ru.description,
            en: translations.en.description,
          },
          locale,
        ),
        specs: localizeSpecs(
          product.specs,
          translations && {
            ru: translations.ru.specs,
            en: translations.en.specs,
          },
          locale,
        ),
      };
    }),
    inventoryMovements: db.inventoryMovements.map((movement) => ({
      ...movement,
      reason: localizeText(
        movement.reason,
        localizedMovementReasons[
          movement.id as keyof typeof localizedMovementReasons
        ],
        locale,
      ),
    })),
    customers: db.customers.map((customer) => ({
      ...customer,
      notes: localizeText(
        customer.notes,
        localizedCustomerNotes[
          customer.id as keyof typeof localizedCustomerNotes
        ],
        locale,
      ),
    })),
    orders: db.orders.map((order) => ({
      ...order,
      notes: localizeText(
        order.notes,
        localizedOrderNotes[order.id as keyof typeof localizedOrderNotes],
        locale,
      ),
    })),
    activity: db.activity.map((activity) => ({
      ...activity,
      title: localizeText(
        activity.title,
        localizedActivityTitles[
          activity.id as keyof typeof localizedActivityTitles
        ],
        locale,
      ),
    })),
  };
}

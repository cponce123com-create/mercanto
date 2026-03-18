import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  json,
  index,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow with role-based access control.
 */
export const users = mysqlTable(
  "users",
  {
    id: int("id").autoincrement().primaryKey(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).unique(),
    phone: varchar("phone", { length: 20 }),
    avatar_url: text("avatar_url"),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: mysqlEnum("role", ["user", "vendor", "admin"]).default("user").notNull(),
    is_blocked: boolean("is_blocked").default(false).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
    last_signed_in: timestamp("last_signed_in").defaultNow().notNull(),
  },
  (table) => ({
    emailIdx: index("email_idx").on(table.email),
    roleIdx: index("role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories table for organizing products.
 * Supports hierarchical structure via parent_id.
 */
export const categories = mysqlTable(
  "categories",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    icon: text("icon"),
    description: text("description"),
    parent_id: int("parent_id"),
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    slugIdx: index("slug_idx").on(table.slug),
    parentIdx: index("parent_idx").on(table.parent_id),
  })
);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Stores table representing vendor storefronts.
 * Each vendor can have one store.
 */
export const stores = mysqlTable(
  "stores",
  {
    id: int("id").autoincrement().primaryKey(),
    user_id: int("user_id").notNull().unique(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    description: text("description"),
    logo_url: text("logo_url"),
    logo_public_id: varchar("logo_public_id", { length: 255 }),
    banner_url: text("banner_url"),
    banner_public_id: varchar("banner_public_id", { length: 255 }),
    whatsapp: varchar("whatsapp", { length: 20 }),
    location: text("location"),
    schedule: text("schedule"),
    main_category_id: int("main_category_id"),
    status: mysqlEnum("status", ["pending", "active", "suspended"]).default("pending").notNull(),
    is_featured: boolean("is_featured").default(false).notNull(),
    total_visits: int("total_visits").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.user_id),
    slugIdx: index("slug_idx").on(table.slug),
    statusIdx: index("status_idx").on(table.status),
    categoryIdx: index("category_idx").on(table.main_category_id),
  })
);

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/**
 * Store gallery images for store portfolio.
 * Maximum 5 images per store.
 */
export const store_gallery_images = mysqlTable(
  "store_gallery_images",
  {
    id: int("id").autoincrement().primaryKey(),
    store_id: int("store_id").notNull(),
    url: text("url").notNull(),
    public_id: varchar("public_id", { length: 255 }).notNull(),
    sort_order: int("sort_order").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    storeIdx: index("store_idx").on(table.store_id),
  })
);

export type StoreGalleryImage = typeof store_gallery_images.$inferSelect;
export type InsertStoreGalleryImage = typeof store_gallery_images.$inferInsert;

/**
 * Products table for marketplace items.
 * Maximum 15 products per store.
 */
export const products = mysqlTable(
  "products",
  {
    id: int("id").autoincrement().primaryKey(),
    store_id: int("store_id").notNull(),
    category_id: int("category_id").notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    offer_price: decimal("offer_price", { precision: 10, scale: 2 }),
    stock: int("stock").default(0).notNull(),
    unit: varchar("unit", { length: 50 }),
    status: mysqlEnum("status", ["active", "inactive"]).default("active").notNull(),
    is_featured: boolean("is_featured").default(false).notNull(),
    total_views: int("total_views").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    storeIdx: index("store_idx").on(table.store_id),
    categoryIdx: index("category_idx").on(table.category_id),
    slugIdx: index("slug_idx").on(table.slug),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product images table.
 * Maximum 5 images per product.
 */
export const product_images = mysqlTable(
  "product_images",
  {
    id: int("id").autoincrement().primaryKey(),
    product_id: int("product_id").notNull(),
    url: text("url").notNull(),
    public_id: varchar("public_id", { length: 255 }).notNull(),
    sort_order: int("sort_order").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    productIdx: index("product_idx").on(table.product_id),
  })
);

export type ProductImage = typeof product_images.$inferSelect;
export type InsertProductImage = typeof product_images.$inferInsert;

/**
 * Tacora (second-hand) listings.
 */
export const tacora_posts = mysqlTable(
  "tacora_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    user_id: int("user_id").notNull(),
    store_id: int("store_id"),
    category_id: int("category_id").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    condition: mysqlEnum("condition", ["new", "like_new", "good", "fair", "poor"]).notNull(),
    location: text("location"),
    status: mysqlEnum("status", ["active", "sold", "inactive"]).default("active").notNull(),
    is_featured: boolean("is_featured").default(false).notNull(),
    total_views: int("total_views").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.user_id),
    storeIdx: index("store_idx").on(table.store_id),
    categoryIdx: index("category_idx").on(table.category_id),
    slugIdx: index("slug_idx").on(table.slug),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type TacoraPost = typeof tacora_posts.$inferSelect;
export type InsertTacoraPost = typeof tacora_posts.$inferInsert;

/**
 * Tacora images table.
 */
export const tacora_images = mysqlTable(
  "tacora_images",
  {
    id: int("id").autoincrement().primaryKey(),
    tacora_post_id: int("tacora_post_id").notNull(),
    url: text("url").notNull(),
    public_id: varchar("public_id", { length: 255 }).notNull(),
    sort_order: int("sort_order").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tacoraIdx: index("tacora_idx").on(table.tacora_post_id),
  })
);

export type TacoraImage = typeof tacora_images.$inferSelect;
export type InsertTacoraImage = typeof tacora_images.$inferInsert;

/**
 * Orders table for customer purchases.
 */
export const orders = mysqlTable(
  "orders",
  {
    id: int("id").autoincrement().primaryKey(),
    buyer_id: int("buyer_id").notNull(),
    store_id: int("store_id").notNull(),
    status: mysqlEnum("status", ["pending", "processing", "completed", "cancelled"]).default("pending").notNull(),
    total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    payment_method: varchar("payment_method", { length: 50 }),
    delivery_type: mysqlEnum("delivery_type", ["pickup", "delivery"]).default("pickup").notNull(),
    delivery_address: text("delivery_address"),
    notes: text("notes"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    buyerIdx: index("buyer_idx").on(table.buyer_id),
    storeIdx: index("store_idx").on(table.store_id),
    statusIdx: index("status_idx").on(table.status),
  })
);

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Order items table for products in each order.
 */
export const order_items = mysqlTable(
  "order_items",
  {
    id: int("id").autoincrement().primaryKey(),
    order_id: int("order_id").notNull(),
    product_id: int("product_id").notNull(),
    quantity: int("quantity").notNull(),
    unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orderIdx: index("order_idx").on(table.order_id),
    productIdx: index("product_idx").on(table.product_id),
  })
);

export type OrderItem = typeof order_items.$inferSelect;
export type InsertOrderItem = typeof order_items.$inferInsert;

/**
 * Reviews table for products and stores.
 */
export const reviews = mysqlTable(
  "reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    user_id: int("user_id").notNull(),
    store_id: int("store_id"),
    product_id: int("product_id"),
    tacora_post_id: int("tacora_post_id"),
    rating: int("rating").notNull(),
    comment: text("comment"),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.user_id),
    storeIdx: index("store_idx").on(table.store_id),
    productIdx: index("product_idx").on(table.product_id),
    tacoraIdx: index("tacora_idx").on(table.tacora_post_id),
  })
);

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Banners table for promotional content on homepage.
 */
export const banners = mysqlTable(
  "banners",
  {
    id: int("id").autoincrement().primaryKey(),
    title: varchar("title", { length: 200 }).notNull(),
    subtitle: text("subtitle"),
    image_url: text("image_url").notNull(),
    public_id: varchar("public_id", { length: 255 }),
    link: text("link"),
    position: int("position").default(0).notNull(),
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    activeIdx: index("active_idx").on(table.is_active),
  })
);

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;

/**
 * Price reports table for comparator analytics.
 * Tracks price trends for normalized products.
 */
export const price_reports = mysqlTable(
  "price_reports",
  {
    id: int("id").autoincrement().primaryKey(),
    product_normalized_name: varchar("product_normalized_name", { length: 200 }).notNull(),
    category_id: int("category_id").notNull(),
    unit: varchar("unit", { length: 50 }),
    lowest_price: decimal("lowest_price", { precision: 10, scale: 2 }).notNull(),
    average_price: decimal("average_price", { precision: 10, scale: 2 }).notNull(),
    highest_price: decimal("highest_price", { precision: 10, scale: 2 }).notNull(),
    vendor_count: int("vendor_count").default(0).notNull(),
    report_date: timestamp("report_date").defaultNow().notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    nameIdx: index("name_idx").on(table.product_normalized_name),
    categoryIdx: index("category_idx").on(table.category_id),
  })
);

export type PriceReport = typeof price_reports.$inferSelect;
export type InsertPriceReport = typeof price_reports.$inferInsert;

/**
 * Favorites table for customer wishlist.
 */
export const favorites = mysqlTable(
  "favorites",
  {
    id: int("id").autoincrement().primaryKey(),
    user_id: int("user_id").notNull(),
    product_id: int("product_id"),
    tacora_post_id: int("tacora_post_id"),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index("user_idx").on(table.user_id),
    productIdx: index("product_idx").on(table.product_id),
    tacoraIdx: index("tacora_idx").on(table.tacora_post_id),
  })
);

export type Favorite = typeof favorites.$inferSelect;
export type InsertFavorite = typeof favorites.$inferInsert;

import {
  integer,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  boolean,
  index,
} from "drizzle-orm/pg-core";

/**
 * Core user table backing auth flow with role-based access control.
 */
export const users = pgTable(
  "users",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    openId: varchar("openId", { length: 64 }).notNull().unique(),
    name: text("name"),
    email: varchar("email", { length: 320 }).unique(),
    phone: varchar("phone", { length: 20 }),
    avatar_url: text("avatar_url"),
    loginMethod: varchar("loginMethod", { length: 64 }),
    role: text("role").default("user").notNull(),
    is_blocked: boolean("is_blocked").default(false).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
    last_signed_in: timestamp("last_signed_in").defaultNow().notNull(),
  },
  (table) => ({
    userEmailIdx: index("user_email_idx").on(table.email),
    userRoleIdx: index("user_role_idx").on(table.role),
  })
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Categories table for organizing products.
 */
export const categories = pgTable(
  "categories",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    icon: text("icon"),
    description: text("description"),
    parent_id: integer("parent_id"),
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    categorySlugIdx: index("category_slug_idx").on(table.slug),
    categoryParentIdx: index("category_parent_idx").on(table.parent_id),
  })
);

export type Category = typeof categories.$inferSelect;
export type InsertCategory = typeof categories.$inferInsert;

/**
 * Stores table representing vendor storefronts.
 */
export const stores = pgTable(
  "stores",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer("user_id").notNull().unique(),
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
    main_category_id: integer("main_category_id"),
    status: text("status").default("pending").notNull(),
    is_featured: boolean("is_featured").default(false).notNull(),
    total_visits: integer("total_visits").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    storeUserIdx: index("store_user_idx").on(table.user_id),
    storeSlugIdx: index("store_slug_idx").on(table.slug),
    storeStatusIdx: index("store_status_idx").on(table.status),
    storeCategoryIdx: index("store_category_idx").on(table.main_category_id),
  })
);

export type Store = typeof stores.$inferSelect;
export type InsertStore = typeof stores.$inferInsert;

/**
 * Store gallery images.
 */
export const store_gallery_images = pgTable(
  "store_gallery_images",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    store_id: integer("store_id").notNull(),
    url: text("url").notNull(),
    public_id: varchar("public_id", { length: 255 }).notNull(),
    sort_order: integer("sort_order").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    storeGalleryStoreIdx: index("store_gallery_store_idx").on(table.store_id),
  })
);

/**
 * Products table.
 */
export const products = pgTable(
  "products",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    store_id: integer("store_id").notNull(),
    category_id: integer("category_id").notNull(),
    name: varchar("name", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    offer_price: decimal("offer_price", { precision: 10, scale: 2 }),
    stock: integer("stock").default(0).notNull(),
    unit: varchar("unit", { length: 50 }),
    status: text("status").default("active").notNull(),
    is_featured: boolean("is_featured").default(false).notNull(),
    total_views: integer("total_views").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    productStoreIdx: index("product_store_idx").on(table.store_id),
    productCategoryIdx: index("product_category_idx").on(table.category_id),
    productSlugIdx: index("product_slug_idx").on(table.slug),
    productStatusIdx: index("product_status_idx").on(table.status),
  })
);

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Product images.
 */
export const product_images = pgTable(
  "product_images",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    product_id: integer("product_id").notNull(),
    url: text("url").notNull(),
    public_id: varchar("public_id", { length: 255 }).notNull(),
    sort_order: integer("sort_order").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    productImageProductIdx: index("product_image_product_idx").on(table.product_id),
  })
);

/**
 * Tacora (second-hand) listings.
 */
export const tacora_posts = pgTable(
  "tacora_posts",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer("user_id").notNull(),
    store_id: integer("store_id"),
    category_id: integer("category_id").notNull(),
    title: varchar("title", { length: 200 }).notNull(),
    slug: varchar("slug", { length: 200 }).notNull(),
    description: text("description"),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    condition: text("condition").notNull(),
    location: text("location"),
    status: text("status").default("active").notNull(),
    is_featured: boolean("is_featured").default(false).notNull(),
    total_views: integer("total_views").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    tacoraUserIdx: index("tacora_user_idx").on(table.user_id),
    tacoraStoreIdx: index("tacora_store_idx").on(table.store_id),
    tacoraCategoryIdx: index("tacora_category_idx").on(table.category_id),
    tacoraSlugIdx: index("tacora_slug_idx").on(table.slug),
    tacoraStatusIdx: index("tacora_status_idx").on(table.status),
  })
);

/**
 * Tacora images.
 */
export const tacora_images = pgTable(
  "tacora_images",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    tacora_post_id: integer("tacora_post_id").notNull(),
    url: text("url").notNull(),
    public_id: varchar("public_id", { length: 255 }).notNull(),
    sort_order: integer("sort_order").default(0).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    tacoraImageTacoraIdx: index("tacora_image_tacora_idx").on(table.tacora_post_id),
  })
);

/**
 * Orders table.
 */
export const orders = pgTable(
  "orders",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    buyer_id: integer("buyer_id").notNull(),
    store_id: integer("store_id").notNull(),
    status: text("status").default("pending").notNull(),
    total_amount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    payment_method: varchar("payment_method", { length: 50 }),
    delivery_type: text("delivery_type").default("pickup").notNull(),
    delivery_address: text("delivery_address"),
    notes: text("notes"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    orderBuyerIdx: index("order_buyer_idx").on(table.buyer_id),
    orderStoreIdx: index("order_store_idx").on(table.store_id),
    orderStatusIdx: index("order_status_idx").on(table.status),
  })
);

/**
 * Order items.
 */
export const order_items = pgTable(
  "order_items",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    order_id: integer("order_id").notNull(),
    product_id: integer("product_id").notNull(),
    quantity: integer("quantity").notNull(),
    unit_price: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    orderItemOrderIdx: index("order_item_order_idx").on(table.order_id),
    orderItemProductIdx: index("order_item_product_idx").on(table.product_id),
  })
);

/**
 * Reviews table.
 */
export const reviews = pgTable(
  "reviews",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer("user_id").notNull(),
    store_id: integer("store_id"),
    product_id: integer("product_id"),
    tacora_post_id: integer("tacora_post_id"),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    reviewUserIdx: index("review_user_idx").on(table.user_id),
    reviewStoreIdx: index("review_store_idx").on(table.store_id),
    reviewProductIdx: index("review_product_idx").on(table.product_id),
    reviewTacoraIdx: index("review_tacora_idx").on(table.tacora_post_id),
  })
);

/**
 * Banners table.
 */
export const banners = pgTable(
  "banners",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    title: varchar("title", { length: 100 }).notNull(),
    image_url: text("image_url").notNull(),
    link_url: text("link_url"),
    sort_order: integer("sort_order").default(0).notNull(),
    is_active: boolean("is_active").default(true).notNull(),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    bannerActiveIdx: index("banner_active_idx").on(table.is_active),
  })
);

/**
 * Price reports.
 */
export const price_reports = pgTable(
  "price_reports",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    product_id: integer("product_id").notNull(),
    user_id: integer("user_id").notNull(),
    reported_price: decimal("reported_price", { precision: 10, scale: 2 }).notNull(),
    location: text("location"),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    priceReportProductIdx: index("price_report_product_idx").on(table.product_id),
  })
);

/**
 * User favorites.
 */
export const favorites = pgTable(
  "favorites",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    user_id: integer("user_id").notNull(),
    product_id: integer("product_id"),
    store_id: integer("store_id"),
    tacora_post_id: integer("tacora_post_id"),
    created_at: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    favoriteUserIdx: index("favorite_user_idx").on(table.user_id),
  })
);

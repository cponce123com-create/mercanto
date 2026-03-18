import { eq, and, or, sql, desc, asc, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import {
  InsertUser,
  users,
  stores,
  products,
  categories,
  tacora_posts,
  orders,
  order_items,
  reviews,
  banners,
  price_reports,
  favorites,
  product_images,
  store_gallery_images,
  tacora_images,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = new pg.Pool({
        connectionString: process.env.DATABASE_URL,
      });
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER OPERATIONS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  const hasOpenId = typeof user.openId === "string" && user.openId.trim().length > 0;
  const hasEmail = typeof user.email === "string" && user.email.trim().length > 0;

  if (!hasOpenId && !hasEmail) {
    throw new Error("User openId or email is required for upsert");
  }

  try {
    const values: InsertUser = {};
    const updateSet: Record<string, any> = {};

    if (hasOpenId) {
      values.openId = user.openId!.trim();
    }

    const textFields = [
      "name",
      "email",
      "loginMethod",
      "phone",
      "avatar_url",
      "password_hash",
    ] as const;

    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.last_signed_in !== undefined) {
      values.last_signed_in = user.last_signed_in;
      updateSet.last_signed_in = user.last_signed_in;
    } else {
      values.last_signed_in = new Date();
      updateSet.last_signed_in = new Date();
    }

    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (hasOpenId && user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.last_signed_in = new Date();
    }

    if (hasOpenId) {
      await db.insert(users).values(values).onConflictDoUpdate({
        target: users.openId,
        set: updateSet,
      });
      return;
    }

    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.email,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const normalizedOpenId = openId.trim();
  if (!normalizedOpenId) return undefined;

  const result = await db.select().from(users).where(eq(users.openId, normalizedOpenId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user by email: database not available");
    return undefined;
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail) return undefined;

  const result = await db.select().from(users).where(eq(users.email, normalizedEmail)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, data: Partial<typeof users.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(users).set(data).where(eq(users.id, id));
}

export async function updateUserLastSignedIn(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db
    .update(users)
    .set({
      last_signed_in: new Date(),
    })
    .where(eq(users.id, id));
}

// ============================================================================
// STORE OPERATIONS
// ============================================================================

export async function createStore(data: {
  user_id: number;
  name: string;
  slug: string;
  description?: string;
  main_category_id?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(stores).values({
    user_id: data.user_id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    main_category_id: data.main_category_id,
    status: "active",
  });
}
export async function getStoreByUserId(user_id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(stores).where(eq(stores.user_id, user_id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(stores).where(eq(stores.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getStoreById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(stores).where(eq(stores.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateStore(id: number, data: Partial<typeof stores.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(stores).set(data).where(eq(stores.id, id));
}

export async function listActiveStores(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(stores)
    .where(eq(stores.status, "active"))
    .orderBy(desc(stores.created_at))
    .limit(limit)
    .offset(offset);
}

// ============================================================================
// PRODUCT OPERATIONS
// ============================================================================

export async function createProduct(data: {
  store_id: number;
  category_id: number;
  name: string;
  slug: string;
  description?: string;
  price: string;
  offer_price?: string;
  stock?: number;
  unit?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(products).values({
    store_id: data.store_id,
    category_id: data.category_id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    price: data.price,
    offer_price: data.offer_price,
    stock: data.stock ?? 0,
    unit: data.unit,
    status: "active",
  });
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getProductsByStore(store_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(and(eq(products.store_id, store_id), eq(products.status, "active")))
    .orderBy(desc(products.created_at));
}

export async function getProductsByStoreForAdmin(store_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(eq(products.store_id, store_id))
    .orderBy(desc(products.created_at));
}

export async function getProductsByStoreWithImages(store_id: number, includeInactive = false) {
  const db = await getDb();
  if (!db) return [];

  const productList = includeInactive
    ? await db
        .select()
        .from(products)
        .where(eq(products.store_id, store_id))
        .orderBy(desc(products.created_at))
    : await db
        .select()
        .from(products)
        .where(and(eq(products.store_id, store_id), eq(products.status, "active")))
        .orderBy(desc(products.created_at));

  if (productList.length === 0) return [];

  const productIds = productList.map((product) => product.id);
  const allImages = await db
    .select()
    .from(product_images)
    .where(inArray(product_images.product_id, productIds))
    .orderBy(asc(product_images.sort_order), asc(product_images.id));

  return productList.map((product) => ({
    ...product,
    images: allImages.filter((image) => image.product_id === product.id),
  }));
}

export async function searchProducts(query: string, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  const normalizedQuery = query.trim();
  if (!normalizedQuery) return [];

  const rows = await db
    .select({
      id: products.id,
      store_id: products.store_id,
      category_id: products.category_id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      offer_price: products.offer_price,
      stock: products.stock,
      unit: products.unit,
      status: products.status,
      is_featured: products.is_featured,
      total_views: products.total_views,
      created_at: products.created_at,
      updated_at: products.updated_at,
      store_name: stores.name,
      image_url: sql<string | null>`
        (
          select pi.url
          from ${product_images} pi
          where pi.product_id = ${products.id}
          order by pi.sort_order asc, pi.id asc
          limit 1
        )
      `,
    })
    .from(products)
    .leftJoin(stores, eq(stores.id, products.store_id))
    .where(
      and(
        eq(products.status, "active"),
        or(
          sql`${products.name} ILIKE ${`%${normalizedQuery}%`}`,
          sql`${products.description} ILIKE ${`%${normalizedQuery}%`}`,
          sql`${stores.name} ILIKE ${`%${normalizedQuery}%`}`
        )
      )
    )
    .orderBy(desc(products.created_at))
    .limit(limit)
    .offset(offset);

  return rows;
}

export async function getProductsByCategory(category_id: number, limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(products)
    .where(and(eq(products.category_id, category_id), eq(products.status, "active")))
    .orderBy(desc(products.created_at))
    .limit(limit)
    .offset(offset);
}

export async function updateProduct(id: number, data: Partial<typeof products.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(products).set(data).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(products).where(eq(products.id, id));
}

// ============================================================================
// CATEGORY OPERATIONS
// ============================================================================

export async function getCategories() {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(categories).where(eq(categories.is_active, true));
}

export async function getCategoryBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createCategory(data: {
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  parent_id?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(categories).values({
    name: data.name,
    slug: data.slug,
    icon: data.icon,
    description: data.description,
    parent_id: data.parent_id,
    is_active: true,
  });
}

// ============================================================================
// TACORA OPERATIONS
// ============================================================================

export async function getTacoraPostById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tacora_posts).where(eq(tacora_posts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function listTacoraPosts(limit = 20, offset = 0) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(tacora_posts)
    .where(eq(tacora_posts.status, "active"))
    .orderBy(desc(tacora_posts.created_at))
    .limit(limit)
    .offset(offset);
}

export async function getTacoraPostBySlug(slug: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(tacora_posts).where(eq(tacora_posts.slug, slug)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getTacoraPostsByUser(user_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tacora_posts).where(eq(tacora_posts.user_id, user_id));
}

export async function createTacoraPost(data: {
  user_id: number;
  store_id?: number;
  category_id: number;
  title: string;
  slug: string;
  description?: string;
  price: string;
  condition: string;
  location?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(tacora_posts).values({
    user_id: data.user_id,
    store_id: data.store_id,
    category_id: data.category_id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    price: data.price,
    condition: data.condition,
    location: data.location,
    status: "active",
  });
}

export async function updateTacoraPost(id: number, data: Partial<typeof tacora_posts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(tacora_posts).set(data).where(eq(tacora_posts.id, id));
}

// ============================================================================
// FAVORITE OPERATIONS
// ============================================================================

export async function getUserFavorites(user_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(favorites)
    .where(eq(favorites.user_id, user_id))
    .orderBy(desc(favorites.created_at));
}

export async function addFavorite(user_id: number, product_id?: number, tacora_post_id?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!product_id && !tacora_post_id) {
    throw new Error("product_id or tacora_post_id is required");
  }

  const conditions = [eq(favorites.user_id, user_id)];

  if (product_id) {
    conditions.push(eq(favorites.product_id, product_id));
  } else {
    conditions.push(sql`${favorites.product_id} IS NULL`);
  }

  if (tacora_post_id) {
    conditions.push(eq(favorites.tacora_post_id, tacora_post_id));
  } else {
    conditions.push(sql`${favorites.tacora_post_id} IS NULL`);
  }

  const existing = await db
    .select()
    .from(favorites)
    .where(and(...conditions))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  const inserted = await db
    .insert(favorites)
    .values({
      user_id,
      product_id,
      tacora_post_id,
    })
    .returning();

  return inserted[0];
}

export async function removeFavorite(user_id: number, product_id?: number, tacora_post_id?: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (!product_id && !tacora_post_id) {
    throw new Error("product_id or tacora_post_id is required");
  }

  const conditions = [eq(favorites.user_id, user_id)];

  if (product_id) {
    conditions.push(eq(favorites.product_id, product_id));
  } else {
    conditions.push(sql`${favorites.product_id} IS NULL`);
  }

  if (tacora_post_id) {
    conditions.push(eq(favorites.tacora_post_id, tacora_post_id));
  } else {
    conditions.push(sql`${favorites.tacora_post_id} IS NULL`);
  }

  return await db.delete(favorites).where(and(...conditions));
}

// ============================================================================
// ORDER OPERATIONS
// ============================================================================

export async function createOrder(data: {
  buyer_id: number;
  store_id: number;
  total_amount: string;
  delivery_type: string;
  delivery_address?: string;
  notes?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const inserted = await db
    .insert(orders)
    .values({
      buyer_id: data.buyer_id,
      store_id: data.store_id,
      total_amount: data.total_amount,
      delivery_type: data.delivery_type,
      delivery_address: data.delivery_address,
      notes: data.notes,
      status: "pending",
    })
    .returning();

  return inserted[0];
}

export async function createOrderItems(
  order_id: number,
  items: Array<{
    product_id: number;
    quantity: number;
    unit_price: string;
  }>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  if (items.length === 0) return [];

  const values = items.map((item) => {
    const subtotal = (Number(item.unit_price) * item.quantity).toFixed(2);
    return {
      order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal,
    };
  });

  return await db.insert(order_items).values(values).returning();
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrdersByBuyer(buyer_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orders)
    .where(eq(orders.buyer_id, buyer_id))
    .orderBy(desc(orders.created_at));
}

export async function getOrdersByStore(store_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(orders)
    .where(eq(orders.store_id, store_id))
    .orderBy(desc(orders.created_at));
}

export async function updateOrderStatus(id: number, status: "pending" | "processing" | "completed" | "cancelled") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(orders).set({ status }).where(eq(orders.id, id));
}

// ============================================================================
// BANNER OPERATIONS
// ============================================================================

export async function getActiveBanners() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(banners)
    .where(eq(banners.is_active, true))
    .orderBy(asc(banners.sort_order));
}

// ============================================================================
// IMAGE OPERATIONS
// ============================================================================

export async function addProductImage(product_id: number, url: string, public_id: string, sort_order = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(product_images).values({
    product_id,
    url,
    public_id,
    sort_order,
  });
}

export async function getProductImages(product_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(product_images)
    .where(eq(product_images.product_id, product_id))
    .orderBy(asc(product_images.sort_order), asc(product_images.id));
}

export async function deleteProductImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(product_images).where(eq(product_images.id, id));
}

export async function addStoreGalleryImage(store_id: number, url: string, public_id: string, sort_order = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(store_gallery_images).values({
    store_id,
    url,
    public_id,
    sort_order,
  });
}

export async function getStoreGalleryImages(store_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(store_gallery_images).where(eq(store_gallery_images.store_id, store_id));
}

export async function deleteStoreGalleryImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(store_gallery_images).where(eq(store_gallery_images.id, id));
}

export async function addTacoraImage(tacora_post_id: number, url: string, public_id: string, sort_order = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.insert(tacora_images).values({
    tacora_post_id,
    url,
    public_id,
    sort_order,
  });
}

export async function getTacoraImages(tacora_post_id: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(tacora_images).where(eq(tacora_images.tacora_post_id, tacora_post_id));
}

export async function deleteTacoraImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(tacora_images).where(eq(tacora_images.id, id));
}

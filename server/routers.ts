import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { uploadRouter } from "./upload-routes";
import * as db from "./db";

// Helper to create vendor-only procedures
const vendorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "vendor" && ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only vendors can access this",
    });
  }
  return next({ ctx });
});

// Helper to create admin-only procedures
const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only admins can access this",
    });
  }
  return next({ ctx });
});

import { stores, products, tacora_posts } from "../drizzle/schema";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export async function getUniqueSlug(table: any, baseValue: string, defaultSlug: string) {
  const baseSlug = slugify(baseValue) || defaultSlug;
  const existingSlugs = await db.getExistingSlugsStartingWith(table, baseSlug);

  if (existingSlugs.length === 0 || !existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let slug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(slug)) {
    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
}

export const appRouter = router({
  system: systemRouter,
  upload: uploadRouter,

  // ============================================================================
  // ADMIN ROUTES
  // ============================================================================
  admin: router({
    getAllStores: adminProcedure.query(async () => {
      return await db.listAllStores();
    }),

    getAllProducts: adminProcedure.query(async () => {
      return await db.listAllProducts();
    }),
  }),

  // ============================================================================
  // AUTH ROUTES
  // ============================================================================
  auth: router({
    me: publicProcedure.query(({ ctx }) => {
      return ctx.user;
    }),

    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, {
        ...cookieOptions,
        maxAge: -1,
      });

      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // USER ROUTES
  // ============================================================================
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      return ctx.user;
    }),

    updateProfile: protectedProcedure
      .input(
        z.object({
          name: z.string().optional(),
          phone: z.string().optional(),
          avatar_url: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await db.updateUser(ctx.user.id, input);
        return { success: true };
      }),

becomeVendor: protectedProcedure
  .input(
    z.object({
      storeName: z.string().min(3).max(100),
      description: z.string().optional(),
      mainCategoryId: z.number().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const existingStore = await db.getStoreByUserId(ctx.user.id);
    if (existingStore) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "You already have a store",
      });
    }

    const totalStores = await db.countStores();
    if (totalStores >= 200) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Se alcanzó el límite máximo de 200 tiendas",
      });
    }

    const slug = await getUniqueSlug(stores, input.storeName, "tienda");

    await db.createStore({
      user_id: ctx.user.id,
      name: input.storeName,
      slug,
      description: input.description,
      main_category_id: input.mainCategoryId,
    });

    await db.updateUser(ctx.user.id, { role: "vendor" });

    return { success: true, slug };
  }),
}),
  // ============================================================================
  // STORE ROUTES
  // ============================================================================
  stores: router({
    getMyStore: vendorProcedure.query(async ({ ctx }) => {
      const store = await db.getStoreByUserId(ctx.user.id);
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }

      const images = await db.getStoreGalleryImages(store.id);
      return { ...store, gallery: images };
    }),

    getStore: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const store = await db.getStoreBySlug(input.slug);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Store not found",
          });
        }

        const images = await db.getStoreGalleryImages(store.id);
        const products = await db.getProductsByStoreWithImages(store.id);

        return { ...store, gallery: images, products };
      }),

    listStores: publicProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await db.listActiveStores(input.limit, input.offset);
      }),

    updateStore: vendorProcedure
      .input(
        z.object({
          name: z.string().optional(),
          description: z.string().optional(),
          logo_url: z.string().optional(),
          logo_public_id: z.string().optional(),
          banner_url: z.string().optional(),
          banner_public_id: z.string().optional(),
          whatsapp: z.string().optional(),
          location: z.string().optional(),
          schedule: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getStoreByUserId(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Store not found",
          });
        }

        await db.updateStore(store.id, input);
        return { success: true };
      }),
  }),

  // ============================================================================
  // CATEGORY ROUTES
  // ============================================================================
  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getCategories();
    }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getCategoryBySlug(input.slug);
      }),

    create: adminProcedure
      .input(
        z.object({
          name: z.string(),
          slug: z.string(),
          icon: z.string().optional(),
          description: z.string().optional(),
          parent_id: z.number().optional(),
        })
      )
      .mutation(async ({ input }) => {
        return await db.createCategory(input);
      }),
  }),

  // ============================================================================
  // PRODUCT ROUTES
  // ============================================================================
  products: router({
    search: publicProcedure
      .input(
        z.object({
          query: z.string(),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await db.searchProducts(input.query, input.limit, input.offset);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const product = await db.getProductBySlug(input.slug);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const images = await db.getProductImages(product.id);
        const store = await db.getStoreById(product.store_id);

        return { ...product, images, store };
      }),

    getByCategory: publicProcedure
      .input(
        z.object({
          categoryId: z.number(),
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await db.getProductsByCategory(input.categoryId, input.limit, input.offset);
      }),

    getMyProducts: vendorProcedure.query(async ({ ctx }) => {
      const store = await db.getStoreByUserId(ctx.user.id);
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }

      const includeInactive = ctx.user.role === "admin";
      return await db.getProductsByStoreWithImages(store.id, includeInactive);
    }),

    create: vendorProcedure
      .input(
        z.object({
          categoryId: z.number(),
          name: z.string(),
          description: z.string().optional(),
          price: z.string(),
          offerPrice: z.string().optional(),
          stock: z.number().optional(),
          unit: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const store = await db.getStoreByUserId(ctx.user.id);
        if (!store) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Store not found",
          });
        }

        const products = await db.getProductsByStoreForAdmin(store.id);
        if (products.length >= 15) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Maximum 15 products per store",
          });
        }

        const slug = await getUniqueSlug(products, input.name, "producto");

        await db.createProduct({
          store_id: store.id,
          category_id: input.categoryId,
          name: input.name,
          slug,
          description: input.description,
          price: input.price,
          offer_price: input.offerPrice,
          stock: input.stock,
          unit: input.unit,
        });

        return { success: true, slug };
      }),

    update: vendorProcedure
      .input(
        z.object({
          productId: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          offerPrice: z.string().optional(),
          stock: z.number().optional(),
          status: z.enum(["active", "inactive"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const store = await db.getStoreByUserId(ctx.user.id);
        if (!store || product.store_id !== store.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot update this product",
          });
        }

        await db.updateProduct(input.productId, {
          name: input.name,
          description: input.description,
          price: input.price,
          offer_price: input.offerPrice,
          stock: input.stock,
          status: input.status,
        });

        return { success: true };
      }),

    delete: vendorProcedure
      .input(z.object({ productId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const product = await db.getProductById(input.productId);
        if (!product) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Product not found",
          });
        }

        const store = await db.getStoreByUserId(ctx.user.id);
        if (!store || product.store_id !== store.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot delete this product",
          });
        }

        await db.deleteProduct(input.productId);
        return { success: true };
      }),
  }),

  // ============================================================================
  // TACORA ROUTES
  // ============================================================================
  tacora: router({
    list: publicProcedure
      .input(
        z.object({
          limit: z.number().default(20),
          offset: z.number().default(0),
        })
      )
      .query(async ({ input }) => {
        return await db.listTacoraPosts(input.limit, input.offset);
      }),

    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        const post = await db.getTacoraPostBySlug(input.slug);
        if (!post) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Post not found",
          });
        }

        const images = await db.getTacoraImages(post.id);
        const user = await db.getUserById(post.user_id);

        return { ...post, images, user };
      }),

    getMyPosts: protectedProcedure.query(async ({ ctx }) => {
      return await db.getTacoraPostsByUser(ctx.user.id);
    }),

create: vendorProcedure
  .input(
    z.object({
      categoryId: z.number(),
      title: z.string(),
      description: z.string().optional(),
      price: z.string(),
      condition: z.enum(["new", "like_new", "good", "fair", "poor"]),
      location: z.string().optional(),
    })
  )
  .mutation(async ({ ctx, input }) => {
    const store = await db.getStoreByUserId(ctx.user.id);
    if (!store) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Store not found",
      });
    }

    const totalTacora = await db.countTacoraPostsByStore(store.id);
    if (totalTacora >= 5) {
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: "Máximo 5 publicaciones Tacora por tienda",
      });
    }

    const slug = await getUniqueSlug(tacora_posts, input.title, "publicacion");

    await db.createTacoraPost({
      user_id: ctx.user.id,
      store_id: store.id,
      category_id: input.categoryId,
      title: input.title,
      slug,
      description: input.description,
      price: input.price,
      condition: input.condition,
      location: input.location,
    });

    return { success: true, slug };
  }),

    update: protectedProcedure
      .input(
        z.object({
          postId: z.number(),
          title: z.string().optional(),
          description: z.string().optional(),
          price: z.string().optional(),
          condition: z.enum(["new", "like_new", "good", "fair", "poor"]).optional(),
          location: z.string().optional(),
          status: z.enum(["active", "sold", "inactive"]).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const post = await db.getTacoraPostById(input.postId);
        if (!post || post.user_id !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot update this post",
          });
        }

        await db.updateTacoraPost(input.postId, {
          title: input.title,
          description: input.description,
          price: input.price,
          condition: input.condition,
          location: input.location,
          status: input.status,
        });

        return { success: true };
      }),

    delete: protectedProcedure
      .input(z.object({ postId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        const post = await db.getTacoraPostById(input.postId);
        if (!post || post.user_id !== ctx.user.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot delete this post",
          });
        }

        await db.updateTacoraPost(input.postId, { status: "inactive" });
        return { success: true };
      }),
  }),

  // ============================================================================
  // FAVORITES ROUTES
  // ============================================================================
  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getUserFavorites(ctx.user.id);
    }),

    add: protectedProcedure
      .input(
        z.object({
          productId: z.number().optional(),
          tacoraPostId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!input.productId && !input.tacoraPostId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "productId or tacoraPostId is required",
          });
        }

        await db.addFavorite(ctx.user.id, input.productId, input.tacoraPostId);
        return { success: true };
      }),

    remove: protectedProcedure
      .input(
        z.object({
          productId: z.number().optional(),
          tacoraPostId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        if (!input.productId && !input.tacoraPostId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "productId or tacoraPostId is required",
          });
        }

        await db.removeFavorite(ctx.user.id, input.productId, input.tacoraPostId);
        return { success: true };
      }),
  }),

  // ============================================================================
  // ORDER ROUTES
  // ============================================================================
  orders: router({
    getMyOrders: protectedProcedure.query(async ({ ctx }) => {
      return await db.getOrdersByBuyer(ctx.user.id);
    }),

    getStoreOrders: vendorProcedure.query(async ({ ctx }) => {
      const store = await db.getStoreByUserId(ctx.user.id);
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }

      return await db.getOrdersByStore(store.id);
    }),

    create: protectedProcedure
      .input(
        z.object({
          storeId: z.number(),
          items: z
            .array(
              z.object({
                productId: z.number(),
                quantity: z.number().min(1),
                unitPrice: z.string(),
              })
            )
            .min(1),
          totalAmount: z.string(),
          deliveryType: z.enum(["pickup", "delivery"]),
          deliveryAddress: z.string().optional(),
          notes: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const order = await db.createOrderWithItems(
          {
            buyer_id: ctx.user.id,
            store_id: input.storeId,
            total_amount: input.totalAmount,
            delivery_type: input.deliveryType,
            delivery_address: input.deliveryAddress,
            notes: input.notes,
          },
          input.items.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPrice,
          }))
        );

        return {
          success: true,
          orderId: order.id,
        };
      }),

    updateStatus: vendorProcedure
      .input(
        z.object({
          orderId: z.number(),
          status: z.enum(["pending", "processing", "completed", "cancelled"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const order = await db.getOrderById(input.orderId);
        if (!order) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Order not found",
          });
        }

        const store = await db.getStoreByUserId(ctx.user.id);
        if (!store || order.store_id !== store.id) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Cannot update this order",
          });
        }

        await db.updateOrderStatus(input.orderId, input.status);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

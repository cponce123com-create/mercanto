import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import type { TrpcContext } from "./_core/context";
import * as upload from "./upload";
import { deleteImage } from "./cloudinary";
import * as db from "./db";

// Create vendor-only procedure
const vendorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user?.role !== "vendor" && ctx.user?.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only vendors can access this",
    });
  }
  return next({ ctx });
});

export const uploadRouter = router({
  // ============================================================================
  // PRODUCT IMAGE UPLOADS
  // ============================================================================
  uploadProductImage: vendorProcedure
    .input(
      z.object({
        productId: z.number(),
        file: z.string(), // Base64 encoded file
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { productId: number; file: string; mimeType: string } }) => {
      // Verify product belongs to vendor's store
      const product = await db.getProductById(input.productId);
      if (!product) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Product not found",
        });
      }

      const store = await db.getStoreByUserId(ctx.user!.id);
      if (!store || product.store_id !== store.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot upload image for this product",
        });
      }

      // Check image limit (max 5 per product)
      const images = await db.getProductImages(input.productId);
      if (images.length >= 5) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Maximum 5 images per product",
        });
      }

      // Convert base64 to buffer
      const buffer = Buffer.from(input.file, "base64");

      const result = await upload.uploadProductImage(input.productId, buffer, input.mimeType);

      return {
        success: true,
        url: result.url,
        public_id: result.public_id,
      };
    }),

  deleteProductImage: vendorProcedure
    .input(z.object({ imageId: z.number() }))
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { imageId: number } }) => {
      // TODO: Verify ownership before deleting
      await upload.deleteProductImage(input.imageId);
      return { success: true };
    }),

  // ============================================================================
  // STORE LOGO & BANNER UPLOADS
  // ============================================================================
  uploadStoreLogo: vendorProcedure
    .input(
      z.object({
        file: z.string(), // Base64 encoded file
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { file: string; mimeType: string } }) => {
      const store = await db.getStoreByUserId(ctx.user!.id);
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }

      // Delete old logo if exists
      if (store.logo_public_id) {
        try {
          await deleteImage(store.logo_public_id);
        } catch (error) {
          console.warn("[Upload] Failed to delete old logo:", error);
        }
      }

      const buffer = Buffer.from(input.file, "base64");
      const result = await upload.uploadStoreLogo(store.id, buffer, input.mimeType);

      return {
        success: true,
        url: result.url,
        public_id: result.public_id,
      };
    }),

  uploadStoreBanner: vendorProcedure
    .input(
      z.object({
        file: z.string(), // Base64 encoded file
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { file: string; mimeType: string } }) => {
      const store = await db.getStoreByUserId(ctx.user!.id);
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }

      // Delete old banner if exists
      if (store.banner_public_id) {
        try {
          await deleteImage(store.banner_public_id);
        } catch (error) {
          console.warn("[Upload] Failed to delete old banner:", error);
        }
      }

      const buffer = Buffer.from(input.file, "base64");
      const result = await upload.uploadStoreBanner(store.id, buffer, input.mimeType);

      return {
        success: true,
        url: result.url,
        public_id: result.public_id,
      };
    }),

  // ============================================================================
  // STORE GALLERY UPLOADS
  // ============================================================================
  uploadStoreGalleryImage: vendorProcedure
    .input(
      z.object({
        file: z.string(), // Base64 encoded file
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { file: string; mimeType: string } }) => {
      const store = await db.getStoreByUserId(ctx.user!.id);
      if (!store) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Store not found",
        });
      }

      const buffer = Buffer.from(input.file, "base64");
      const result = await upload.uploadStoreGalleryImage(store.id, buffer, input.mimeType);

      return {
        success: true,
        url: result.url,
        public_id: result.public_id,
      };
    }),

  deleteStoreGalleryImage: vendorProcedure
    .input(z.object({ imageId: z.number() }))
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { imageId: number } }) => {
      // TODO: Verify ownership before deleting
      await upload.deleteStoreGalleryImage(input.imageId);
      return { success: true };
    }),

  // ============================================================================
  // TACORA IMAGE UPLOADS
  // ============================================================================
  uploadTacoraImage: protectedProcedure
    .input(
      z.object({
        tacoraPostId: z.number(),
        file: z.string(), // Base64 encoded file
        mimeType: z.string(),
      })
    )
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { tacoraPostId: number; file: string; mimeType: string } }) => {
      // Verify post belongs to user
      const post = await db.getTacoraPostById(input.tacoraPostId);
      if (!post || post.user_id !== ctx.user!.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Cannot upload image for this post",
        });
      }

      const buffer = Buffer.from(input.file, "base64");
      const result = await upload.uploadTacoraImage(input.tacoraPostId, buffer, input.mimeType);

      return {
        success: true,
        url: result.url,
        public_id: result.public_id,
      };
    }),

  deleteTacoraImage: protectedProcedure
    .input(z.object({ imageId: z.number() }))
    .mutation(async ({ ctx, input }: { ctx: TrpcContext; input: { imageId: number } }) => {
      // TODO: Verify ownership before deleting
      await upload.deleteTacoraImage(input.imageId);
      return { success: true };
    }),
});

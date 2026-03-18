import { TRPCError } from "@trpc/server";
import { uploadImage, deleteImage } from "./cloudinary";
import * as db from "./db";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = ["image/jpeg", "image/png", "image/webp"];

export interface UploadOptions {
  userId: number;
  type: "product" | "store-logo" | "store-banner" | "store-gallery" | "tacora";
  file: Buffer;
  mimeType: string;
}

/**
 * Validate and upload an image
 */
export async function handleImageUpload(options: UploadOptions) {
  // Validate file size
  if (options.file.length > MAX_FILE_SIZE) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "File size exceeds 5MB limit",
    });
  }

  // Validate file type
  if (!ALLOWED_FORMATS.includes(options.mimeType)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Only JPEG, PNG, and WebP formats are allowed",
    });
  }

  // Determine folder based on type
  const folders: Record<string, string> = {
    product: "mercanto/products",
    "store-logo": "mercanto/stores/logos",
    "store-banner": "mercanto/stores/banners",
    "store-gallery": "mercanto/stores/gallery",
    tacora: "mercanto/tacora",
  };

  const folder = folders[options.type];
  if (!folder) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Invalid upload type",
    });
  }

  try {
    const result = await uploadImage(options.file, folder, {
      quality: "auto",
      fetch_format: "auto",
    });

    return result;
  } catch (error) {
    console.error("[Upload] Failed to upload image:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to upload image",
    });
  }
}

/**
 * Upload product image
 */
export async function uploadProductImage(productId: number, file: Buffer, mimeType: string) {
  const result = await handleImageUpload({
    userId: 0, // Not used for products
    type: "product",
    file,
    mimeType,
  });

  // Save to database
  await db.addProductImage(productId, result.url, result.public_id);

  return result;
}

/**
 * Upload store logo
 */
export async function uploadStoreLogo(storeId: number, file: Buffer, mimeType: string) {
  const result = await handleImageUpload({
    userId: 0,
    type: "store-logo",
    file,
    mimeType,
  });

  // Update store in database
  await db.updateStore(storeId, {
    logo_url: result.url,
    logo_public_id: result.public_id,
  });

  return result;
}

/**
 * Upload store banner
 */
export async function uploadStoreBanner(storeId: number, file: Buffer, mimeType: string) {
  const result = await handleImageUpload({
    userId: 0,
    type: "store-banner",
    file,
    mimeType,
  });

  // Update store in database
  await db.updateStore(storeId, {
    banner_url: result.url,
    banner_public_id: result.public_id,
  });

  return result;
}

/**
 * Upload store gallery image
 */
export async function uploadStoreGalleryImage(storeId: number, file: Buffer, mimeType: string) {
  // Check gallery limit (max 5 images)
  const images = await db.getStoreGalleryImages(storeId);
  if (images.length >= 5) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Maximum 5 gallery images per store",
    });
  }

  const result = await handleImageUpload({
    userId: 0,
    type: "store-gallery",
    file,
    mimeType,
  });

  // Save to database
  await db.addStoreGalleryImage(storeId, result.url, result.public_id, images.length);

  return result;
}

/**
 * Upload Tacora image
 */
export async function uploadTacoraImage(tacoraPostId: number, file: Buffer, mimeType: string) {
  const result = await handleImageUpload({
    userId: 0,
    type: "tacora",
    file,
    mimeType,
  });

  // Save to database
  await db.addTacoraImage(tacoraPostId, result.url, result.public_id);

  return result;
}

/**
 * Delete image from Cloudinary and database
 */
export async function deleteProductImage(imageId: number) {
  const images = await db.getProductImages(0); // This is a workaround, ideally we'd query by ID
  const image = images.find((img) => img.id === imageId);

  if (!image) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Image not found",
    });
  }

  try {
    await deleteImage(image.public_id);
    await db.deleteProductImage(imageId);
  } catch (error) {
    console.error("[Upload] Failed to delete image:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete image",
    });
  }
}

/**
 * Delete store gallery image
 */
export async function deleteStoreGalleryImage(imageId: number) {
  const images = await db.getStoreGalleryImages(0); // Workaround
  const image = images.find((img) => img.id === imageId);

  if (!image) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Image not found",
    });
  }

  try {
    await deleteImage(image.public_id);
    await db.deleteStoreGalleryImage(imageId);
  } catch (error) {
    console.error("[Upload] Failed to delete image:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete image",
    });
  }
}

/**
 * Delete Tacora image
 */
export async function deleteTacoraImage(imageId: number) {
  const images = await db.getTacoraImages(0); // Workaround
  const image = images.find((img) => img.id === imageId);

  if (!image) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Image not found",
    });
  }

  try {
    await deleteImage(image.public_id);
    await db.deleteTacoraImage(imageId);
  } catch (error) {
    console.error("[Upload] Failed to delete image:", error);
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to delete image",
    });
  }
}

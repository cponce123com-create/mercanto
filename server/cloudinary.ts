import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
}

/**
 * Upload an image to Cloudinary
 * @param file - File buffer or data URL
 * @param folder - Cloudinary folder path (e.g., "mercanto/products")
 * @param options - Additional upload options
 */
export async function uploadImage(
  file: Buffer | string,
  folder: string,
  options: {
    resource_type?: "auto" | "image" | "video" | "raw";
    quality?: "auto";
    fetch_format?: "auto";
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "thumb";
  } = {}
): Promise<UploadResult> {
  try {
    const result = await cloudinary.uploader.upload(
      typeof file === "string" ? file : `data:image/jpeg;base64,${file.toString("base64")}`,
      {
        folder,
        resource_type: options.resource_type || "auto",
        quality: "auto",
        fetch_format: "auto",
        ...options,
      }
    );

    return {
      url: result.secure_url,
      public_id: result.public_id,
      width: result.width,
      height: result.height,
      format: result.format,
    };
  } catch (error) {
    console.error("[Cloudinary] Upload failed:", error);
    throw new Error(`Failed to upload image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Delete an image from Cloudinary
 * @param public_id - The public ID of the image to delete
 */
export async function deleteImage(public_id: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(public_id);
  } catch (error) {
    console.error("[Cloudinary] Delete failed:", error);
    throw new Error(`Failed to delete image: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Generate a signed URL for direct upload from client
 * This allows the client to upload directly to Cloudinary without going through the server
 */
export function generateUploadSignature(folder: string) {
  const timestamp = Math.floor(Date.now() / 1000);
  const params = {
    folder,
    timestamp,
  };

  const paramsStr = Object.entries(params)
    .map(([key, value]) => `${key}=${value}`)
    .sort()
    .join("&");

  const signature = require("crypto")
    .createHash("sha1")
    .update(paramsStr + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");

  return {
    timestamp,
    signature,
    api_key: process.env.CLOUDINARY_API_KEY,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  };
}

/**
 * Get a transformed URL for an image
 * @param public_id - The public ID of the image
 * @param options - Transformation options
 */
export function getImageUrl(
  public_id: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
  } = {}
): string {
  const transformations = [];

  if (options.width || options.height) {
    const t = [];
    if (options.width) t.push(`w_${options.width}`);
    if (options.height) t.push(`h_${options.height}`);
    if (options.crop) t.push(`c_${options.crop}`);
    transformations.push(t.join(","));
  }

  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }

  if (options.format) {
    transformations.push(`f_${options.format}`);
  }

  const transformPath = transformations.length > 0 ? `/${transformations.join("/")}` : "";

  return `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload${transformPath}/${public_id}`;
}

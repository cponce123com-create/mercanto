import { describe, it, expect } from "vitest";
import { generateUploadSignature, getImageUrl } from "./cloudinary";

describe("Cloudinary Integration", () => {
  it("should generate upload signature with correct structure", () => {
    const signature = generateUploadSignature("mercanto/products");

    expect(signature).toHaveProperty("timestamp");
    expect(signature).toHaveProperty("signature");
    expect(signature).toHaveProperty("api_key");
    expect(signature).toHaveProperty("cloud_name");
    expect(signature).toHaveProperty("folder");

    expect(signature.api_key).toBe(process.env.CLOUDINARY_API_KEY);
    expect(signature.cloud_name).toBe(process.env.CLOUDINARY_CLOUD_NAME);
    expect(signature.folder).toBe("mercanto/products");
    expect(signature.signature).toMatch(/^[a-f0-9]{40}$/); // SHA1 hash
  });

  it("should generate correct image URL with transformations", () => {
    const url = getImageUrl("mercanto/products/test-image", {
      width: 400,
      height: 300,
      crop: "fill",
      quality: "auto",
      format: "webp",
    });

    expect(url).toContain(process.env.CLOUDINARY_CLOUD_NAME);
    expect(url).toContain("w_400");
    expect(url).toContain("h_300");
    expect(url).toContain("c_fill");
    expect(url).toContain("q_auto");
    expect(url).toContain("f_webp");
    expect(url).toContain("mercanto/products/test-image");
  });

  it("should generate URL without transformations", () => {
    const url = getImageUrl("mercanto/products/test-image");

    expect(url).toContain(process.env.CLOUDINARY_CLOUD_NAME);
    expect(url).toContain("mercanto/products/test-image");
    expect(url).not.toContain("w_");
    expect(url).not.toContain("h_");
  });

  it("should have Cloudinary credentials configured", () => {
    expect(process.env.CLOUDINARY_CLOUD_NAME).toBeDefined();
    expect(process.env.CLOUDINARY_API_KEY).toBeDefined();
    expect(process.env.CLOUDINARY_API_SECRET).toBeDefined();

    expect(process.env.CLOUDINARY_CLOUD_NAME).toBe("de1tsdvwe");
    expect(process.env.CLOUDINARY_API_KEY).toBe("742739251762235");
  });
});

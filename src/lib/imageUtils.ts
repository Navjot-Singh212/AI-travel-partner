/**
 * Image processing, compression, and validation utilities
 * Keeps payloads well under Vercel's 4.5 MB request limit
 */

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_RAW_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB raw limit
export const MAX_COMPRESSED_PAYLOAD_BYTES = 2.5 * 1024 * 1024; // 2.5 MB compressed

export interface CompressionResult {
  base64Data: string; // Raw base64 string without data URI prefix
  dataUrl: string; // Full data URL for preview
  mimeType: string;
  originalSize: number;
  compressedSize: number;
  dimensions: { width: number; height: number };
}

/**
 * Validate image file before processing
 */
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No image file provided." };
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported image format (${file.type || "unknown"}). Please upload a JPEG, PNG, or WebP photo.`,
    };
  }

  // Allow up to 15MB for initial selection since we compress it on canvas
  const MAX_PRE_COMPRESSION_SIZE = 15 * 1024 * 1024;
  if (file.size > MAX_PRE_COMPRESSION_SIZE) {
    return {
      valid: false,
      error: "File is too large (over 15MB). Please choose a smaller photo.",
    };
  }

  return { valid: true };
}

/**
 * Compresses and downscales an image file using browser HTML5 canvas
 * Produces high quality visual fidelity while drastically reducing payload size (< 1MB)
 */
export async function compressAndEncodeImage(
  file: File,
  maxWidth = 1600,
  maxHeight = 1600,
  quality = 0.82
): Promise<CompressionResult> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Calculate aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Unable to create canvas rendering context."));
        return;
      }

      // Draw with smoothing
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Export as JPEG (universal compatibility for Gemini multimodal)
      const mimeType = "image/jpeg";
      const dataUrl = canvas.toDataURL(mimeType, quality);
      const base64Data = dataUrl.split(",")[1];

      // Approximate byte size of base64 string
      const compressedSize = Math.round((base64Data.length * 3) / 4);

      if (compressedSize > MAX_COMPRESSED_PAYLOAD_BYTES) {
        // If still large, try a more aggressive compression
        const lowerQualityUrl = canvas.toDataURL(mimeType, 0.65);
        const lowerBase64 = lowerQualityUrl.split(",")[1];
        resolve({
          base64Data: lowerBase64,
          dataUrl: lowerQualityUrl,
          mimeType,
          originalSize: file.size,
          compressedSize: Math.round((lowerBase64.length * 3) / 4),
          dimensions: { width, height },
        });
        return;
      }

      resolve({
        base64Data,
        dataUrl,
        mimeType,
        originalSize: file.size,
        compressedSize,
        dimensions: { width, height },
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load and decode image. The file may be corrupted."));
    };

    img.src = objectUrl;
  });
}

/**
 * Server-side validation of incoming base64 payload
 */
export function validateServerPayload(
  base64Data: string,
  mimeType: string
): { valid: boolean; error?: string } {
  if (!base64Data || typeof base64Data !== "string") {
    return { valid: false, error: "Missing or invalid image base64 data." };
  }

  if (!mimeType || !ALLOWED_IMAGE_TYPES.includes(mimeType)) {
    return {
      valid: false,
      error: `Unsupported image MIME type: ${mimeType}. Allowed: ${ALLOWED_IMAGE_TYPES.join(", ")}`,
    };
  }

  const byteSize = Math.round((base64Data.length * 3) / 4);
  // Cap at 3.5 MB to strictly ensure Vercel body limits are never exceeded
  if (byteSize > 3.5 * 1024 * 1024) {
    return {
      valid: false,
      error: `Image payload too large (${(byteSize / 1024 / 1024).toFixed(1)} MB). Must be under 3.5 MB.`,
    };
  }

  return { valid: true };
}

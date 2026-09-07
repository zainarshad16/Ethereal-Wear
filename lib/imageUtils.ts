import { getPlaiceholder } from "plaiceholder";
import fs from "fs/promises";
import path from "path";

// Minimal fallback: solid #E5E7EB gray placeholder
const FALLBACK_BLUR_DATA_URL =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxIDEiPjxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNlNTVlN2ViIi8+PC9zdmc+";

/**
 * Generates a base64 blurDataURL for remote or local image paths.
 * Uses plaiceholder and sharp under the hood.
 */
export async function getBlurPlaceholder(imageUrl?: string | null): Promise<string> {
  if (!imageUrl || typeof imageUrl !== "string") {
    return FALLBACK_BLUR_DATA_URL;
  }

  const cleanUrl = imageUrl.trim();
  if (!cleanUrl) {
    return FALLBACK_BLUR_DATA_URL;
  }

  // Already a base64 string
  if (cleanUrl.startsWith("data:image/")) {
    return cleanUrl;
  }

  try {
    let buffer: Buffer;

    if (cleanUrl.startsWith("http://") || cleanUrl.startsWith("https://")) {
      // Remote image fetch with cache revalidation
      const res = await fetch(cleanUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; EtherealWear/1.0)",
        },
        cache: "force-cache",
      });

      if (!res.ok) {
        return FALLBACK_BLUR_DATA_URL;
      }

      const arrayBuffer = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuffer);
    } else {
      // Local static image in /public directory
      const normalizedPath = cleanUrl.startsWith("/") ? cleanUrl.slice(1) : cleanUrl;
      const filePath = path.join(process.cwd(), "public", normalizedPath);
      buffer = await fs.readFile(filePath);
    }

    const { base64 } = await getPlaiceholder(buffer, { size: 10 });
    return base64 || FALLBACK_BLUR_DATA_URL;
  } catch (err) {
    // Non-blocking graceful fallback
    return FALLBACK_BLUR_DATA_URL;
  }
}

/**
 * Concurrently resolves blur placeholders for an array of image URLs.
 * Returns a map of imageUrl -> blurDataURL.
 */
export async function getBlurPlaceholdersMap(
  imageUrls: (string | null | undefined)[]
): Promise<Record<string, string>> {
  const uniqueUrls = Array.from(new Set(imageUrls.filter((url): url is string => Boolean(url))));
  const entries = await Promise.all(
    uniqueUrls.map(async (url) => {
      const blur = await getBlurPlaceholder(url);
      return [url, blur] as const;
    })
  );

  return Object.fromEntries(entries);
}

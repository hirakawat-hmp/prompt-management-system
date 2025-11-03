/**
 * Storage Utility
 *
 * Handles downloading and saving generated assets to local storage.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';
import type { AssetType } from '@prisma/client';
import type { DownloadResult, DownloadAssetParams } from '@/types/storage';

/**
 * Downloads an asset from a URL and saves it to local storage
 *
 * @param params - Download parameters
 * @returns Download result with local path and API URL
 *
 * @example
 * ```typescript
 * const result = await downloadAndSaveAsset({
 *   sourceUrl: 'https://tempfile.aiquickdraw.com/image.jpg',
 *   taskId: 'task123',
 *   index: 0,
 *   assetType: 'IMAGE'
 * });
 *
 * console.log(result.apiUrl); // "/api/assets/images/task123_0.jpg"
 * console.log(result.localPath); // "storage/images/task123_0.jpg"
 * ```
 */
export async function downloadAndSaveAsset(
  params: DownloadAssetParams
): Promise<DownloadResult> {
  const { sourceUrl, taskId, index, assetType } = params;

  // 1. Fetch from source URL
  const response = await fetch(sourceUrl);
  if (!response.ok) {
    throw new Error(`Failed to download asset: HTTP ${response.status}`);
  }

  const buffer = await response.arrayBuffer();

  // 2. Determine file extension from content type
  const contentType = response.headers.get('content-type');
  const ext = getExtensionFromContentType(contentType, assetType);

  // 3. Build paths
  const type = assetType === 'IMAGE' ? 'images' : 'videos';
  const filename = `${taskId}_${index}.${ext}`;
  const storageDir = process.env.STORAGE_DIR || './storage';
  const typeDir = join(storageDir, type);
  const localPath = join(typeDir, filename);

  // 4. Ensure directory exists
  if (!existsSync(typeDir)) {
    await mkdir(typeDir, { recursive: true });
  }

  // 5. Write file to disk
  await writeFile(localPath, Buffer.from(buffer));

  // 6. Return result
  return {
    localPath,
    apiUrl: `/api/assets/${type}/${filename}`,
    fileSize: buffer.byteLength,
    mimeType: contentType || 'application/octet-stream',
  };
}

/**
 * Determines file extension from Content-Type header
 *
 * @param contentType - Content-Type header value
 * @param assetType - Asset type (IMAGE or VIDEO)
 * @returns File extension without dot (e.g., "jpg", "mp4")
 *
 * @example
 * ```typescript
 * getExtensionFromContentType('image/jpeg', 'IMAGE'); // "jpg"
 * getExtensionFromContentType('video/mp4', 'VIDEO'); // "mp4"
 * getExtensionFromContentType('unknown', 'IMAGE'); // "jpg" (default)
 * ```
 */
export function getExtensionFromContentType(
  contentType: string | null,
  assetType: AssetType
): string {
  if (!contentType) {
    return assetType === 'IMAGE' ? 'jpg' : 'mp4';
  }

  // Image types
  if (contentType.includes('jpeg')) return 'jpg';
  if (contentType.includes('png')) return 'png';
  if (contentType.includes('webp')) return 'webp';
  if (contentType.includes('gif')) return 'gif';

  // Video types
  if (contentType.includes('mp4')) return 'mp4';
  if (contentType.includes('webm')) return 'webm';
  if (contentType.includes('quicktime')) return 'mov';

  // Default fallback
  return assetType === 'IMAGE' ? 'jpg' : 'mp4';
}

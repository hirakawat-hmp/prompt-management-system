/**
 * Storage Type Definitions
 *
 * Types for local asset storage and download operations.
 */

import type { AssetType } from '@prisma/client';

/**
 * Result of downloading and saving an asset locally
 */
export interface DownloadResult {
  /**
   * Local file system path (e.g., "storage/images/task123_0.jpg")
   * Relative to project root or absolute path based on STORAGE_DIR
   */
  localPath: string;

  /**
   * API URL for serving the asset via Next.js API route
   * Format: "/api/assets/{type}/{filename}"
   * Example: "/api/assets/images/task123_0.jpg"
   */
  apiUrl: string;

  /**
   * File size in bytes
   */
  fileSize: number;

  /**
   * MIME type of the downloaded file
   * Examples: "image/jpeg", "video/mp4"
   */
  mimeType: string;
}

/**
 * Parameters for downloading an asset
 */
export interface DownloadAssetParams {
  /**
   * Source URL to download from (e.g., Kie.ai temporary URL)
   */
  sourceUrl: string;

  /**
   * Generation task ID (used in filename)
   */
  taskId: string;

  /**
   * Index of the asset (for multiple results)
   */
  index: number;

  /**
   * Type of asset (IMAGE or VIDEO)
   */
  assetType: AssetType;
}

/**
 * Asset type definitions
 */

export type AssetType = "image" | "video";

export type AssetProvider =
  | "midjourney"
  | "veo";

export interface AssetMetadata {
  width?: number;
  height?: number;
  duration?: number; // For video assets (in seconds)
  fileSize?: number; // In bytes
  mimeType?: string;
}

export interface Asset {
  id: string;
  promptId: string; // Reference to the parent Prompt
  type: AssetType;
  url: string; // Filesystem path or URL
  provider: AssetProvider;
  metadata?: AssetMetadata;
  createdAt: Date;
}

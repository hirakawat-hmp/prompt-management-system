/**
 * Type Adapters
 *
 * Converts between Prisma types (uppercase enums, flattened metadata) and
 * frontend types (lowercase strings, nested metadata).
 *
 * ## Why Type Adapters?
 *
 * Prisma generates types from database schema (snake_case, SQL conventions),
 * while our frontend uses TypeScript conventions (camelCase, string literals).
 * These adapters bridge the gap, allowing:
 * - Type-safe database operations via Prisma
 * - Clean, consistent types in React components
 * - Easy migration between database providers
 *
 * ## Prisma Schema:
 * - Enums: IMAGE, VIDEO, MIDJOURNEY, VEO (uppercase)
 * - Metadata: Flattened fields (width, height, duration, fileSize, mimeType)
 * - Nullable fields: userFeedback, aiComment, mastraMessageId, parentId
 *
 * ## Frontend Types:
 * - Enums: "image", "video", "midjourney", "veo" (lowercase string literals)
 * - Metadata: Nested object { width?, height?, duration?, fileSize?, mimeType? }
 * - Optional fields: Use `undefined` instead of `null` for TypeScript consistency
 *
 * ## Usage Example:
 *
 * ```typescript
 * // Query with Prisma
 * const prismaPrompt = await prisma.prompt.findUnique({ where: { id } });
 *
 * // Convert to frontend type
 * const frontendPrompt = toFrontendPrompt(prismaPrompt);
 *
 * // Use in React component
 * <PromptCard prompt={frontendPrompt} />
 * ```
 *
 * @module type-adapters
 */

import type {
  Project as PrismaProject,
  Prompt as PrismaPrompt,
  Asset as PrismaAsset,
  PromptType as PrismaPromptType,
  AssetType as PrismaAssetType,
  AssetProvider as PrismaAssetProvider,
} from '@prisma/client';
import type { Project, Prompt, Asset } from '@/types/project';

// ============================================================================
// Enum Converters
// ============================================================================

/**
 * Converts frontend prompt type to Prisma enum
 *
 * @param type - Frontend prompt type ("image" | "video")
 * @returns Prisma prompt type enum (IMAGE | VIDEO)
 *
 * @example
 * ```typescript
 * toPrismaPromptType('image') // Returns: IMAGE (PrismaPromptType)
 * ```
 */
export function toPrismaPromptType(type: 'image' | 'video'): PrismaPromptType {
  return type.toUpperCase() as PrismaPromptType;
}

/**
 * Converts Prisma prompt type enum to frontend type
 *
 * @param type - Prisma prompt type enum (IMAGE | VIDEO)
 * @returns Frontend prompt type ("image" | "video")
 *
 * @example
 * ```typescript
 * toFrontendPromptType('IMAGE') // Returns: "image"
 * ```
 */
export function toFrontendPromptType(type: PrismaPromptType): 'image' | 'video' {
  return type.toLowerCase() as 'image' | 'video';
}

/**
 * Converts frontend asset type to Prisma enum
 */
export function toPrismaAssetType(type: 'image' | 'video'): PrismaAssetType {
  return type.toUpperCase() as PrismaAssetType;
}

/**
 * Converts Prisma asset type enum to frontend type
 */
export function toFrontendAssetType(type: PrismaAssetType): 'image' | 'video' {
  return type.toLowerCase() as 'image' | 'video';
}

/**
 * Converts frontend asset provider to Prisma enum
 */
export function toPrismaAssetProvider(provider: 'midjourney' | 'veo'): PrismaAssetProvider {
  return provider.toUpperCase() as PrismaAssetProvider;
}

/**
 * Converts Prisma asset provider enum to frontend type
 */
export function toFrontendAssetProvider(provider: PrismaAssetProvider): 'midjourney' | 'veo' {
  return provider.toLowerCase() as 'midjourney' | 'veo';
}

// ============================================================================
// Entity Converters
// ============================================================================

/**
 * Converts Prisma Project to frontend Project
 */
export function toFrontendProject(prismaProject: PrismaProject): Project {
  return {
    id: prismaProject.id,
    name: prismaProject.name,
    createdAt: prismaProject.createdAt,
    updatedAt: prismaProject.updatedAt,
  };
}

/**
 * Converts Prisma Prompt to frontend Prompt
 *
 * @param prismaPrompt - Prisma prompt object (may include parent relation)
 * @returns Frontend prompt with lowercase type enum and undefined for null values
 *
 * @remarks
 * - Converts `null` values to `undefined` for TypeScript consistency
 * - Sets `assets` to empty array by default (populate via relation if needed)
 * - Converts `mastraMessageId` reference to string | undefined
 * - Converts `parent` relation to simplified { id, content } object if included
 *
 * @example
 * ```typescript
 * const prismaPrompt = await prisma.prompt.findUnique({
 *   where: { id: 'prompt_123' },
 *   include: { assets: true, parent: true }
 * });
 *
 * const frontendPrompt = toFrontendPrompt(prismaPrompt);
 * // frontendPrompt.type === "image" (not "IMAGE")
 * // frontendPrompt.userFeedback === undefined (not null)
 * // frontendPrompt.parent === { id: "parent_id", content: "..." }
 * ```
 */
export function toFrontendPrompt(
  prismaPrompt: PrismaPrompt & { parent?: PrismaPrompt | null }
): Prompt {
  return {
    id: prismaPrompt.id,
    projectId: prismaPrompt.projectId,
    type: toFrontendPromptType(prismaPrompt.type),
    content: prismaPrompt.content,
    userFeedback: prismaPrompt.userFeedback ?? undefined,
    aiComment: prismaPrompt.aiComment ?? undefined,
    mastraMessageId: prismaPrompt.mastraMessageId ?? undefined,
    parentId: prismaPrompt.parentId ?? undefined,
    parent: prismaPrompt.parent
      ? { id: prismaPrompt.parent.id, content: prismaPrompt.parent.content }
      : undefined,
    createdAt: prismaPrompt.createdAt,
    updatedAt: prismaPrompt.updatedAt,
    assets: [], // Default to empty array, populate via relation if needed
  };
}

/**
 * Converts Prisma Asset to frontend Asset
 * Transforms flattened metadata fields into nested metadata object
 */
export function toFrontendAsset(prismaAsset: PrismaAsset): Asset {
  // Build metadata object from non-null fields
  const metadata: Record<string, number | string> = {};

  if (prismaAsset.width !== null) metadata.width = prismaAsset.width;
  if (prismaAsset.height !== null) metadata.height = prismaAsset.height;
  if (prismaAsset.duration !== null) metadata.duration = prismaAsset.duration;
  if (prismaAsset.fileSize !== null) metadata.fileSize = prismaAsset.fileSize;
  if (prismaAsset.mimeType !== null) metadata.mimeType = prismaAsset.mimeType;

  return {
    id: prismaAsset.id,
    promptId: prismaAsset.promptId,
    type: toFrontendAssetType(prismaAsset.type),
    url: prismaAsset.url,
    provider: toFrontendAssetProvider(prismaAsset.provider),
    metadata,
    createdAt: prismaAsset.createdAt,
  };
}

// ============================================================================
// Reverse Converters (for mutations)
// ============================================================================

/**
 * Converts frontend Asset metadata to Prisma Asset fields
 * Used when creating or updating assets
 *
 * @param metadata - Frontend metadata object
 * @returns Prisma-compatible flattened metadata fields
 *
 * @example
 * ```typescript
 * const metadata = { width: 1920, height: 1080, mimeType: 'image/jpeg' };
 * const prismaMetadata = toPrismaAssetMetadata(metadata);
 *
 * await prisma.asset.create({
 *   data: {
 *     ...otherFields,
 *     ...prismaMetadata, // Spreads: width, height, duration, fileSize, mimeType
 *   }
 * });
 * ```
 */
export function toPrismaAssetMetadata(metadata: Record<string, number | string>) {
  return {
    width: typeof metadata.width === 'number' ? metadata.width : null,
    height: typeof metadata.height === 'number' ? metadata.height : null,
    duration: typeof metadata.duration === 'number' ? metadata.duration : null,
    fileSize: typeof metadata.fileSize === 'number' ? metadata.fileSize : null,
    mimeType: typeof metadata.mimeType === 'string' ? metadata.mimeType : null,
  };
}

// ============================================================================
// Batch Converters (Performance Optimization)
// ============================================================================

/**
 * Converts array of Prisma Projects to frontend Projects
 *
 * @param prismaProjects - Array of Prisma project objects
 * @returns Array of frontend projects
 *
 * @example
 * ```typescript
 * const prismaProjects = await prisma.project.findMany();
 * const frontendProjects = toFrontendProjects(prismaProjects);
 * ```
 */
export function toFrontendProjects(prismaProjects: PrismaProject[]): Project[] {
  return prismaProjects.map(toFrontendProject);
}

/**
 * Converts array of Prisma Prompts to frontend Prompts
 *
 * @param prismaPrompts - Array of Prisma prompt objects
 * @returns Array of frontend prompts
 *
 * @example
 * ```typescript
 * const prismaPrompts = await prisma.prompt.findMany({
 *   where: { projectId: 'proj_123' }
 * });
 * const frontendPrompts = toFrontendPrompts(prismaPrompts);
 * ```
 */
export function toFrontendPrompts(prismaPrompts: PrismaPrompt[]): Prompt[] {
  return prismaPrompts.map(toFrontendPrompt);
}

/**
 * Converts array of Prisma Assets to frontend Assets
 *
 * @param prismaAssets - Array of Prisma asset objects
 * @returns Array of frontend assets
 *
 * @example
 * ```typescript
 * const prismaAssets = await prisma.asset.findMany({
 *   where: { promptId: 'prompt_123' }
 * });
 * const frontendAssets = toFrontendAssets(prismaAssets);
 * ```
 */
export function toFrontendAssets(prismaAssets: PrismaAsset[]): Asset[] {
  return prismaAssets.map(toFrontendAsset);
}

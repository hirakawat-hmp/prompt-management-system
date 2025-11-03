/**
 * Generation System Type Definitions
 *
 * Unified types for multi-service AI generation system.
 * Uses discriminated unions for type-safe service+model specific parameters.
 */

import { z } from 'zod';
import { isValidServiceModelCombination } from './generation-compatibility';

// ============================================================================
// Kie.ai - Imagen4 (Image Generation)
// ============================================================================

export interface KieImagen4Params {
  service: 'KIE';
  model: 'IMAGEN4';
  apiModel: 'google/imagen4-fast';
  input: {
    prompt: string;
    negative_prompt?: string;
    aspect_ratio?: '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
    num_images?: '1' | '2' | '3' | '4';
    seed?: number;
  };
  callBackUrl?: string;
}

export const KieImagen4Schema = z
  .object({
    service: z.literal('KIE'),
    model: z.literal('IMAGEN4'),
    apiModel: z.literal('google/imagen4-fast'),
    input: z.object({
      prompt: z.string().min(1).max(5000),
      negative_prompt: z.string().max(5000).optional(),
      aspect_ratio: z.enum(['1:1', '16:9', '9:16', '3:4', '4:3']).optional(),
      num_images: z.enum(['1', '2', '3', '4']).optional(),
      seed: z.number().optional(),
    }),
    callBackUrl: z.string().url().optional(),
  })
  .refine(
    (data) => isValidServiceModelCombination(data.service, data.model),
    (data) => ({
      message: `Invalid combination: ${data.service} does not support ${data.model}`,
      path: ['service', 'model'],
    })
  );

// ============================================================================
// Kie.ai - Veo3 (Video Generation)
// ============================================================================

export interface KieVeo3Params {
  service: 'KIE';
  model: 'VEO3';
  prompt: string;
  modelVariant: 'veo3' | 'veo3_fast';
  generationType?:
    | 'TEXT_2_VIDEO'
    | 'FIRST_AND_LAST_FRAMES_2_VIDEO'
    | 'REFERENCE_2_VIDEO';
  imageUrls?: string[]; // 0-3 images depending on generationType
  aspectRatio?: '16:9' | '9:16' | 'Auto';
  seeds?: number; // 10000-99999
  watermark?: string;
  callBackUrl?: string;
  enableTranslation?: boolean;
}

export const KieVeo3Schema = z
  .object({
    service: z.literal('KIE'),
    model: z.literal('VEO3'),
    prompt: z.string().min(1).max(5000),
    modelVariant: z.enum(['veo3', 'veo3_fast']),
    generationType: z
      .enum(['TEXT_2_VIDEO', 'FIRST_AND_LAST_FRAMES_2_VIDEO', 'REFERENCE_2_VIDEO'])
      .optional(),
    imageUrls: z.array(z.string().url()).max(3).optional(),
    aspectRatio: z.enum(['16:9', '9:16', 'Auto']).optional(),
    seeds: z.number().min(10000).max(99999).optional(),
    watermark: z.string().optional(),
    callBackUrl: z.string().url().optional(),
    enableTranslation: z.boolean().optional(),
  })
  .refine(
    (data) => isValidServiceModelCombination(data.service, data.model),
    (data) => ({
      message: `Invalid combination: ${data.service} does not support ${data.model}`,
      path: ['service', 'model'],
    })
  );

// ============================================================================
// Kie.ai - Midjourney (Image/Video Generation)
// ============================================================================

export interface KieMidjourneyParams {
  service: 'KIE';
  model: 'MIDJOURNEY';
  taskType:
    | 'mj_txt2img'
    | 'mj_img2img'
    | 'mj_style_reference'
    | 'mj_omni_reference'
    | 'mj_video'
    | 'mj_video_hd';
  prompt: string;
  speed?: 'relaxed' | 'fast' | 'turbo';
  fileUrls?: string[];
  aspectRatio?:
    | '1:2'
    | '9:16'
    | '2:3'
    | '3:4'
    | '5:6'
    | '6:5'
    | '4:3'
    | '3:2'
    | '1:1'
    | '16:9'
    | '2:1';
  version?: '7' | '6.1' | '6' | '5.2' | '5.1' | 'niji6';
  variety?: number; // 0-100, increment by 5
  stylization?: number; // 0-1000, multiple of 50
  weirdness?: number; // 0-3000, multiple of 100
  ow?: number; // 1-1000, for omni_reference only
  waterMark?: string;
  enableTranslation?: boolean;
  callBackUrl?: string;
  videoBatchSize?: 1 | 2 | 4; // For video generation only
  motion?: 'high' | 'low'; // Required for video generation
}

export const KieMidjourneySchema = z
  .object({
    service: z.literal('KIE'),
    model: z.literal('MIDJOURNEY'),
    taskType: z.enum([
      'mj_txt2img',
      'mj_img2img',
      'mj_style_reference',
      'mj_omni_reference',
      'mj_video',
      'mj_video_hd',
    ]),
    prompt: z.string().min(1).max(2000),
    speed: z.enum(['relaxed', 'fast', 'turbo']).optional(),
    fileUrls: z.array(z.string().url()).optional(),
    aspectRatio: z
      .enum(['1:2', '9:16', '2:3', '3:4', '5:6', '6:5', '4:3', '3:2', '1:1', '16:9', '2:1'])
      .optional(),
    version: z.enum(['7', '6.1', '6', '5.2', '5.1', 'niji6']).optional(),
    variety: z.number().min(0).max(100).optional(),
    stylization: z.number().min(0).max(1000).optional(),
    weirdness: z.number().min(0).max(3000).optional(),
    ow: z.number().min(1).max(1000).optional(),
    waterMark: z.string().optional(),
    enableTranslation: z.boolean().optional(),
    callBackUrl: z.string().url().optional(),
    videoBatchSize: z.enum([1, 2, 4]).optional(),
    motion: z.enum(['high', 'low']).optional(),
  })
  .refine(
    (data) => isValidServiceModelCombination(data.service, data.model),
    (data) => ({
      message: `Invalid combination: ${data.service} does not support ${data.model}`,
      path: ['service', 'model'],
    })
  );

// ============================================================================
// Kie.ai - Sora2 (Video Generation)
// ============================================================================

export interface KieSora2Params {
  service: 'KIE';
  model: 'SORA2';
  apiModel: 'sora-2-text-to-video';
  input: {
    prompt: string;
    aspect_ratio?: 'portrait' | 'landscape';
    n_frames?: '10' | '15'; // 10s or 15s
    remove_watermark?: boolean;
  };
  callBackUrl?: string;
}

export const KieSora2Schema = z
  .object({
    service: z.literal('KIE'),
    model: z.literal('SORA2'),
    apiModel: z.literal('sora-2-text-to-video'),
    input: z.object({
      prompt: z.string().min(1).max(5000),
      aspect_ratio: z.enum(['portrait', 'landscape']).optional(),
      n_frames: z.enum(['10', '15']).optional(),
      remove_watermark: z.boolean().optional(),
    }),
    callBackUrl: z.string().url().optional(),
  })
  .refine(
    (data) => isValidServiceModelCombination(data.service, data.model),
    (data) => ({
      message: `Invalid combination: ${data.service} does not support ${data.model}`,
      path: ['service', 'model'],
    })
  );

// ============================================================================
// Discriminated Union: All Provider Parameters
// ============================================================================

/**
 * Union type of all provider-specific parameters
 * TypeScript will enforce correct parameters based on service+model combination
 */
export type ProviderParams =
  | KieImagen4Params
  | KieVeo3Params
  | KieMidjourneyParams
  | KieSora2Params;
// Future: | GoogleImagen4Params | AzureDallE3Params | ...

/**
 * Zod schema for runtime validation of provider parameters
 * Uses discriminated union on 'model' field (since all current providers use 'KIE' service)
 */
export const ProviderParamsSchema = z.discriminatedUnion('model', [
  KieImagen4Schema,
  KieVeo3Schema,
  KieMidjourneySchema,
  KieSora2Schema,
  // Future: GoogleImagen4Schema, AzureDallE3Schema, ...
]);

// ============================================================================
// Type Guards
// ============================================================================

export function isKieImagen4Params(params: ProviderParams): params is KieImagen4Params {
  return params.service === 'KIE' && params.model === 'IMAGEN4';
}

export function isKieVeo3Params(params: ProviderParams): params is KieVeo3Params {
  return params.service === 'KIE' && params.model === 'VEO3';
}

export function isKieMidjourneyParams(
  params: ProviderParams
): params is KieMidjourneyParams {
  return params.service === 'KIE' && params.model === 'MIDJOURNEY';
}

export function isKieSora2Params(params: ProviderParams): params is KieSora2Params {
  return params.service === 'KIE' && params.model === 'SORA2';
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Common response structure from Kie.ai createTask API
 */
export interface KieCreateTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
  };
}

/**
 * Common response structure from Kie.ai query API
 */
export interface KieQueryTaskResponse {
  code: number;
  msg: string;
  data: {
    taskId: string;
    model: string;
    state?: 'waiting' | 'success' | 'fail'; // String-based (Imagen4, Sora2)
    successFlag?: 0 | 1 | 2 | 3; // Integer-based (Veo3, Midjourney)
    param: string; // JSON string
    resultJson?: string; // JSON string
    response?: {
      // Veo3/Midjourney format
      resultUrls?: string[];
    };
    failCode?: string;
    failMsg?: string;
    errorCode?: string;
    errorMessage?: string;
    costTime?: number;
    completeTime?: number;
    createTime: number;
  };
}

/**
 * File upload response from Kie.ai
 */
export interface KieUploadResponse {
  success: boolean;
  code: number;
  msg: string;
  data: {
    fileName: string;
    filePath: string;
    downloadUrl: string;
    fileSize: number;
    mimeType: string;
    uploadedAt: string;
  };
}

/**
 * Normalized upload result for internal use
 */
export interface UploadResult {
  downloadUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  expiresAt: Date; // 3 days from uploadedAt
}

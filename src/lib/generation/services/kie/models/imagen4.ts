/**
 * Kie.ai Imagen4 Model Implementation
 *
 * Handles image generation using Google's Imagen4 model via Kie.ai API.
 * Supports text-to-image generation with optional negative prompts,
 * aspect ratio control, and seed-based reproducibility.
 *
 * Features:
 * - Text-to-image generation with natural language prompts
 * - Optional negative prompts to exclude unwanted elements
 * - Configurable aspect ratios (1:1, 16:9, 9:16, 3:4, 4:3)
 * - Batch generation (1-4 images per task)
 * - Reproducible results via seed parameter
 * - Optional webhook callbacks for task completion
 *
 * Task Flow:
 * 1. Create task with createImagen4Task() -> returns taskId
 * 2. Poll with queryImagen4Task(taskId) -> check status
 * 3. When status='success', extract URLs with transformImagen4Result()
 *
 * Status Values:
 * - 'waiting': Task is still generating
 * - 'success': Task completed, results available
 * - 'fail': Task failed (check failCode/failMsg for details)
 *
 * @see KieImagen4Params for input parameters
 * @see KieQueryTaskResponse for response structure
 */

import type { KieImagen4Params } from '@/types/generation';
import type { KieQueryTaskResponse } from '../client';
import { createKieTask, queryKieTask } from '../client';

// ============================================================================
// Types
// ============================================================================

/**
 * Response from createImagen4Task
 *
 * Contains the task ID needed for polling task status.
 */
export interface CreateImagen4TaskResponse {
  /**
   * External task ID from Kie.ai
   * Use this to query task status with queryImagen4Task()
   */
  taskId: string;
}

/**
 * Parsed result from Imagen4 API
 *
 * Structure of the resultJson field from query response
 */
interface Imagen4ResultJson {
  /** Array of generated image URLs */
  resultUrls: string[];
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create an Imagen4 image generation task on Kie.ai
 *
 * Initiates a text-to-image generation task using Imagen4.
 * Returns immediately with a task ID for asynchronous polling.
 *
 * The actual image generation happens asynchronously on Kie.ai servers.
 * Poll the returned taskId with queryImagen4Task() to track progress.
 *
 * Cost: Each image generation task consumes credits based on parameters
 * (aspect ratio, quantity, etc). Check your account balance before creating.
 *
 * @param params Imagen4 generation parameters
 * @returns Promise resolving to task creation response with taskId
 * @throws {KieApiError} If API call fails (e.g., invalid params, insufficient credits)
 *
 * @example
 * ```typescript
 * // Simple text-to-image
 * const { taskId } = await createImagen4Task({
 *   service: 'KIE',
 *   model: 'IMAGEN4',
 *   apiModel: 'google/imagen4-fast',
 *   input: {
 *     prompt: 'A serene landscape at sunset over mountains',
 *   },
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Advanced usage with all options
 * const { taskId } = await createImagen4Task({
 *   service: 'KIE',
 *   model: 'IMAGEN4',
 *   apiModel: 'google/imagen4-fast',
 *   input: {
 *     prompt: 'A modern minimalist living room with natural lighting',
 *     negative_prompt: 'cluttered, dark, poor lighting',
 *     aspect_ratio: '16:9',
 *     num_images: '4',
 *     seed: 42, // For reproducible results
 *   },
 *   callBackUrl: 'https://yourdomain.com/webhook/imagen4',
 * });
 * ```
 */
export async function createImagen4Task(
  params: KieImagen4Params
): Promise<CreateImagen4TaskResponse> {
  const response = await createKieTask(params);
  return {
    taskId: response.taskId,
  };
}

/**
 * Query the status of an Imagen4 generation task
 *
 * Polls the Kie.ai API to check task status and retrieve results when complete.
 * Use this in a polling loop to track generation progress.
 *
 * Typical polling pattern:
 * 1. Create task with createImagen4Task()
 * 2. Wait 2-5 seconds
 * 3. Call queryImagen4Task() to check status
 * 4. If state='waiting', repeat from step 2
 * 5. If state='success', extract URLs with transformImagen4Result()
 * 6. If state='fail', handle error with failCode/failMsg
 *
 * @param taskId External task ID returned from createImagen4Task()
 * @returns Promise resolving to task status response
 * @throws {KieApiError} If API call fails or task not found
 *
 * @example
 * ```typescript
 * const response = await queryImagen4Task('task_abc123');
 *
 * switch (response.data.state) {
 *   case 'success':
 *     const urls = transformImagen4Result(response.data.resultJson!);
 *     console.log('Generated images:', urls);
 *     break;
 *   case 'waiting':
 *     console.log('Still generating, please wait...');
 *     break;
 *   case 'fail':
 *     console.error('Generation failed:', response.data.failMsg);
 *     break;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Polling with exponential backoff
 * async function waitForGeneration(taskId: string, maxWaitMs = 300000) {
 *   let elapsedMs = 0;
 *   let delayMs = 2000; // Start with 2s
 *
 *   while (elapsedMs < maxWaitMs) {
 *     const response = await queryImagen4Task(taskId);
 *
 *     if (response.data.state === 'success') {
 *       return transformImagen4Result(response.data.resultJson!);
 *     }
 *
 *     if (response.data.state === 'fail') {
 *       throw new Error(`Generation failed: ${response.data.failMsg}`);
 *     }
 *
 *     // Exponential backoff: 2s, 4s, 8s... up to 10s
 *     delayMs = Math.min(delayMs * 1.5, 10000);
 *     await new Promise(resolve => setTimeout(resolve, delayMs));
 *     elapsedMs += delayMs;
 *   }
 *
 *   throw new Error('Generation timeout');
 * }
 * ```
 */
export async function queryImagen4Task(taskId: string): Promise<KieQueryTaskResponse> {
  return queryKieTask('IMAGEN4', taskId);
}

/**
 * Transform Imagen4 result JSON into array of image URLs
 *
 * Parses the resultJson string from the Imagen4 API response and extracts
 * the array of generated image URLs.
 *
 * Call this only when queryImagen4Task() returns state='success'.
 *
 * Image URLs are temporary (valid for ~3 days). Store them persistently
 * in your database immediately after generation.
 *
 * @param resultJson JSON string from Imagen4 API response data.resultJson
 * @returns Array of generated image URLs (1-4 URLs depending on num_images param)
 * @throws {Error} If resultJson is invalid JSON or missing resultUrls array
 *
 * @example
 * ```typescript
 * const response = await queryImagen4Task(taskId);
 *
 * if (response.data.state === 'success' && response.data.resultJson) {
 *   const urls = transformImagen4Result(response.data.resultJson);
 *   // urls: ['https://file.aiquickdraw.com/img1.jpg', ...]
 *
 *   // Download and store images immediately
 *   for (const url of urls) {
 *     await downloadAndStoreImage(url);
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Safe extraction with error handling
 * try {
 *   const urls = transformImagen4Result(response.data.resultJson!);
 *   return urls;
 * } catch (error) {
 *   console.error('Failed to parse Imagen4 result:', error);
 *   throw new Error('Invalid generation result format');
 * }
 * ```
 */
export function transformImagen4Result(resultJson: string): string[] {
  try {
    const parsed: unknown = JSON.parse(resultJson);

    // Type guard: ensure parsed is an object with resultUrls
    if (
      typeof parsed !== 'object' ||
      parsed === null ||
      !('resultUrls' in parsed) ||
      !Array.isArray((parsed as any).resultUrls)
    ) {
      throw new Error('Invalid result format: missing or invalid resultUrls array');
    }

    return (parsed as Imagen4ResultJson).resultUrls;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse result JSON: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Kie.ai Midjourney Model
 *
 * Handles Midjourney image/video generation through Kie.ai API.
 * Supports 6 task types: mj_txt2img, mj_img2img, mj_style_reference,
 * mj_omni_reference, mj_video, mj_video_hd.
 *
 * API Endpoints:
 * - Create: POST /api/v1/mj/generate
 * - Query: GET /api/v1/mj/record-info
 *
 * Response Format: Integer-based status (successFlag: 0/1/2/3)
 */

import type { KieMidjourneyParams, KieQueryTaskResponse } from '@/types/generation';
import { createKieTask, queryKieTask } from '../client';

// ============================================================================
// Types
// ============================================================================

/**
 * Result of creating a Midjourney task
 */
export interface CreateMidjourneyTaskResult {
  taskId: string;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a Midjourney generation task on Kie.ai
 *
 * Supports 6 task types:
 * - mj_txt2img: Text-to-image generation
 * - mj_img2img: Image-to-image generation
 * - mj_style_reference: Style reference transformation
 * - mj_omni_reference: Omni reference with strength control
 * - mj_video: Image-to-video generation (standard)
 * - mj_video_hd: Image-to-video generation (high quality)
 *
 * @param params Midjourney generation parameters
 * @returns Task ID for status polling
 * @throws {KieApiError} If API call fails
 *
 * @example
 * // Text-to-image generation
 * const result = await createMidjourneyTask({
 *   service: 'KIE',
 *   model: 'MIDJOURNEY',
 *   taskType: 'mj_txt2img',
 *   prompt: 'A beautiful sunset over mountains',
 *   version: '7',
 *   speed: 'fast',
 * });
 * console.log(result.taskId); // 'mj_task_abc123'
 *
 * @example
 * // Image-to-image generation with style
 * const result = await createMidjourneyTask({
 *   service: 'KIE',
 *   model: 'MIDJOURNEY',
 *   taskType: 'mj_img2img',
 *   prompt: 'Transform into watercolor painting',
 *   fileUrls: ['https://example.com/image.jpg'],
 *   aspectRatio: '16:9',
 *   stylization: 500,
 * });
 *
 * @example
 * // Video generation with motion control
 * const result = await createMidjourneyTask({
 *   service: 'KIE',
 *   model: 'MIDJOURNEY',
 *   taskType: 'mj_video',
 *   prompt: 'Animated transition',
 *   fileUrls: ['https://example.com/image.jpg'],
 *   motion: 'high',
 *   videoBatchSize: 2,
 * });
 */
export async function createMidjourneyTask(
  params: KieMidjourneyParams
): Promise<CreateMidjourneyTaskResult> {
  const response = await createKieTask(params);
  return {
    taskId: response.taskId,
  };
}

/**
 * Query Midjourney task status and results
 *
 * Polls the Kie.ai API to check task status and retrieve generated URLs
 * when complete.
 *
 * Status values:
 * - successFlag: 0 = PENDING (generating)
 * - successFlag: 1 = SUCCESS (completed with results)
 * - successFlag: 2 = FAILED (error occurred)
 * - successFlag: 3 = FAILED (parameter error)
 *
 * @param taskId Task ID from createMidjourneyTask
 * @returns Task status and results when available
 * @throws {KieApiError} If API call fails
 *
 * @example
 * const response = await queryMidjourneyTask('mj_task_abc123');
 *
 * if (response.data.successFlag === 1) {
 *   // Success - results are ready
 *   const urls = response.data.response?.resultUrls || [];
 *   console.log('Generated images:', urls);
 * } else if (response.data.successFlag === 0) {
 *   // Still generating
 *   console.log('Still generating...');
 * } else if (response.data.successFlag === 2 || response.data.successFlag === 3) {
 *   // Failed
 *   console.log('Error:', response.data.failMsg || response.data.errorMessage);
 * }
 */
export async function queryMidjourneyTask(
  taskId: string
): Promise<KieQueryTaskResponse> {
  const response = await queryKieTask('MIDJOURNEY', taskId);
  return response;
}

/**
 * Transform Midjourney API response to array of result URLs
 *
 * Extracts the result URLs from the Kie.ai query response.
 * Returns empty array if:
 * - Task is still pending (no results yet)
 * - Task failed (resultUrls not in response)
 * - Response is malformed
 *
 * @param responseData Task data from queryMidjourneyTask
 * @returns Array of generated image/video URLs
 *
 * @example
 * const response = await queryMidjourneyTask(taskId);
 * if (response.data.successFlag === 1) {
 *   const urls = transformMidjourneyResult(response.data);
 *   console.log('Download URLs:', urls);
 * }
 */
export function transformMidjourneyResult(
  responseData: KieQueryTaskResponse['data']
): string[] {
  try {
    // Check if response object exists and has resultUrls
    if (!responseData.response) {
      return [];
    }

    const { resultUrls } = responseData.response;

    // Return empty array if resultUrls is not defined or not an array
    if (!Array.isArray(resultUrls)) {
      return [];
    }

    // Filter out null/undefined values and ensure all are strings
    return resultUrls.filter((url): url is string => {
      return typeof url === 'string' && url.length > 0;
    });
  } catch {
    // If any error occurs during transformation, return empty array
    return [];
  }
}

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if params are Midjourney parameters
 */
export function isMidjourneyParams(
  params: any
): params is KieMidjourneyParams {
  return (
    params &&
    params.service === 'KIE' &&
    params.model === 'MIDJOURNEY' &&
    typeof params.taskType === 'string' &&
    typeof params.prompt === 'string'
  );
}

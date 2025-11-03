/**
 * Kie.ai Veo3 Model - Video Generation
 *
 * Implements Veo3 video generation tasks with support for:
 * - TEXT_2_VIDEO: Generate videos from text prompts
 * - FIRST_AND_LAST_FRAMES_2_VIDEO: Generate transition videos between images
 * - REFERENCE_2_VIDEO: Generate videos based on reference images
 *
 * Model variants: veo3 (quality), veo3_fast (speed)
 */

import type { KieVeo3Params, KieQueryTaskResponse } from '@/types/generation';
import { createKieTask, queryKieTask } from '../client';

// ============================================================================
// Types
// ============================================================================

/**
 * Veo3 task creation response
 */
export interface CreateVeo3TaskResponse {
  taskId: string;
}

/**
 * Veo3 result data structure
 */
export interface Veo3ResultData {
  taskId: string;
  successFlag?: number;
  response?: {
    resultUrls?: string[];
  };
  failCode?: string;
  failMsg?: string;
  createTime: number;
}

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a Veo3 video generation task
 *
 * Initiates an asynchronous video generation task using the Veo3 AI model.
 * Supports three generation modes with different parameter requirements.
 *
 * Generation modes:
 * - TEXT_2_VIDEO: Generate from text prompt alone
 * - FIRST_AND_LAST_FRAMES_2_VIDEO: Generate transition between 1-2 images
 * - REFERENCE_2_VIDEO: Generate from 1-3 reference images (veo3_fast only)
 *
 * @param params Veo3 generation parameters
 * @returns Object containing the external task ID from Kie.ai
 * @throws {KieApiError} If API call fails
 *
 * @example
 * const { taskId } = await createVeo3Task({
 *   service: 'KIE',
 *   model: 'VEO3',
 *   prompt: 'A dog playing in a park',
 *   modelVariant: 'veo3_fast',
 * });
 *
 * @example
 * // Image-to-video with first and last frames
 * const { taskId } = await createVeo3Task({
 *   service: 'KIE',
 *   model: 'VEO3',
 *   prompt: 'Transform between the two images',
 *   modelVariant: 'veo3',
 *   generationType: 'FIRST_AND_LAST_FRAMES_2_VIDEO',
 *   imageUrls: [
 *     'https://example.com/start.jpg',
 *     'https://example.com/end.jpg'
 *   ],
 *   aspectRatio: '16:9',
 * });
 */
export async function createVeo3Task(params: KieVeo3Params): Promise<CreateVeo3TaskResponse> {
  // Delegate to client which handles request transformation
  const response = await createKieTask(params);

  return {
    taskId: response.taskId,
  };
}

/**
 * Query the status of a Veo3 video generation task
 *
 * Polls the status of a previously created video generation task.
 * Response includes status indicators and result URLs upon completion.
 *
 * Status indicators (successFlag):
 * - 0: Task is pending/processing
 * - 1: Task completed successfully
 * - 2 or 3: Task failed
 *
 * @param taskId External task ID from createVeo3Task response
 * @returns Full task response including status and results
 * @throws {KieApiError} If API call fails
 *
 * @example
 * const response = await queryVeo3Task('veo_task_abc123');
 *
 * if (response.data.successFlag === 1) {
 *   const videoUrls = response.data.response?.resultUrls || [];
 *   console.log('Videos ready:', videoUrls);
 * } else if (response.data.successFlag === 0) {
 *   console.log('Video still generating...');
 * } else {
 *   console.log('Generation failed:', response.data.failMsg);
 * }
 */
export async function queryVeo3Task(taskId: string): Promise<KieQueryTaskResponse> {
  // Delegate to client which handles model-specific endpoint routing
  return queryKieTask('VEO3', taskId);
}

/**
 * Transform Veo3 API response data into result URLs
 *
 * Extracts video URLs from the API response structure.
 * Handles various response states (pending, success, failed).
 *
 * @param responseData Task data from Veo3 API query response
 * @returns Array of generated video URLs (empty if not ready or failed)
 *
 * @example
 * const response = await queryVeo3Task('veo_task_abc123');
 * const videoUrls = transformVeo3Result(response.data);
 * // Returns: ['https://tempfile.redpandaai.co/xxx/videos/output.mp4']
 */
export function transformVeo3Result(responseData: Veo3ResultData): string[] {
  // Extract result URLs from response structure
  const resultUrls = responseData.response?.resultUrls;

  // Return URLs if available, otherwise empty array
  return resultUrls || [];
}

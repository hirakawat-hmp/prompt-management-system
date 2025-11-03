/**
 * Sora2 Model Implementation
 *
 * Implements Sora2 text-to-video generation model for Kie.ai service.
 * Handles task creation, status querying, and result transformation.
 */

import type { KieSora2Params, KieQueryTaskResponse } from '@/types/generation';
import { createKieTask, queryKieTask } from '../client';

// ============================================================================
// Type Exports
// ============================================================================

/**
 * Sora2 task creation response
 */
export interface Sora2CreateTaskResponse {
  taskId: string;
}

/**
 * Sora2 task query response
 */
export type Sora2QueryTaskResponse = KieQueryTaskResponse;

// ============================================================================
// API Functions
// ============================================================================

/**
 * Create a Sora2 text-to-video generation task on Kie.ai
 *
 * Sora2 generates videos from text prompts with flexible aspect ratios and durations.
 * The task runs asynchronously and requires polling for results.
 *
 * @param params Sora2 generation parameters including prompt, aspect ratio, and duration
 * @returns Task creation response with unique task ID for polling
 * @throws {KieApiError} If API call fails (validation errors, auth issues, rate limits, etc.)
 *
 * @example
 * const result = await createSora2Task({
 *   service: 'KIE',
 *   model: 'SORA2',
 *   apiModel: 'sora-2-text-to-video',
 *   input: {
 *     prompt: 'A professor stands at the front of a classroom giving a lecture',
 *     aspect_ratio: 'landscape',
 *     n_frames: '10',
 *     remove_watermark: true,
 *   },
 * });
 * console.log(result.taskId); // 'sora2_task_abc123...'
 */
export async function createSora2Task(params: KieSora2Params): Promise<Sora2CreateTaskResponse> {
  const response = await createKieTask(params);
  return {
    taskId: response.taskId,
  };
}

/**
 * Query the status of a Sora2 generation task
 *
 * Polls the Kie.ai API for task status and results. Returns complete task data
 * including state, result URLs (on success), and error details (on failure).
 *
 * @param taskId External task ID returned from createSora2Task
 * @returns Task status response with state and results
 * @throws {KieApiError} If API call fails
 *
 * @example
 * const response = await querySora2Task('sora2_task_abc123...');
 * if (response.data.state === 'success') {
 *   const urls = transformSora2Result(response.data.resultJson!);
 *   console.log('Video URLs:', urls);
 * } else if (response.data.state === 'fail') {
 *   console.error('Generation failed:', response.data.failMsg);
 * }
 */
export async function querySora2Task(taskId: string): Promise<Sora2QueryTaskResponse> {
  return queryKieTask('SORA2', taskId) as Promise<Sora2QueryTaskResponse>;
}

/**
 * Transform Sora2 result JSON into array of video URLs
 *
 * Parses the resultJson string from the query response and extracts
 * the array of generated video URLs.
 *
 * @param resultJson JSON string from query response containing resultUrls array
 * @returns Array of video URLs
 * @throws {SyntaxError} If JSON parsing fails
 * @throws {Error} If resultUrls field is missing from JSON
 *
 * @example
 * const urls = transformSora2Result('{"resultUrls":["https://example.com/video.mp4"]}');
 * // Returns: ['https://example.com/video.mp4']
 */
export function transformSora2Result(resultJson: string): string[] {
  try {
    const parsed = JSON.parse(resultJson);

    if (!Array.isArray(parsed.resultUrls)) {
      throw new Error('resultUrls field is missing or not an array in result JSON');
    }

    return parsed.resultUrls;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new SyntaxError(`Failed to parse result JSON: ${error.message}`);
    }
    throw error;
  }
}

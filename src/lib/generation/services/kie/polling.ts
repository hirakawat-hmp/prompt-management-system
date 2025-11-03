/**
 * Kie.ai Polling Strategy
 *
 * Implements async task monitoring with:
 * - Interval escalation: 2s → 5s → 10s (max)
 * - 5-minute timeout
 * - Status normalization for both string-based and integer-based statuses
 * - Database updates via Prisma
 *
 * Status Mapping:
 * - Imagen4/Sora2: `state: "wait"/"queueing"/"generating"/"waiting"/"success"/"fail"` → PENDING/SUCCESS/FAILED
 * - Veo3/Midjourney: `successFlag: 0/1/2/3` → PENDING/SUCCESS/FAILED/FAILED
 */

import { prisma } from '@/lib/prisma';
import type { GenerationModel } from '@prisma/client';

/**
 * Polling interval configuration (in milliseconds)
 */
const POLLING_INTERVALS = {
  initial: 2000,    // 2 seconds
  standard: 5000,   // 5 seconds (after 3 attempts)
  max: 10000,       // 10 seconds (maximum)
};

/**
 * Maximum polling duration before timeout (5 minutes)
 */
const MAX_POLLING_DURATION = 5 * 60 * 1000;

/**
 * Kie.ai API response data type
 */
interface KieQueryTaskResponse {
  data: {
    taskId?: string;
    state?: 'waiting' | 'success' | 'fail';
    successFlag?: number;
    resultJson?: string;
    resultInfoJson?: {
      resultUrls?: string[];
      [key: string]: any;
    };
    response?: {
      resultUrls?: string[];
      [key: string]: any;
    };
    failCode?: string;
    failMsg?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

/**
 * Normalized task status
 */
type NormalizedStatus = 'PENDING' | 'SUCCESS' | 'FAILED';

/**
 * Normalize status from different Kie.ai API models
 *
 * String-based (Imagen4, Sora2):
 * - "wait" | "queueing" | "generating" | "waiting" → PENDING
 * - "success" → SUCCESS
 * - "fail" → FAILED
 *
 * Integer-based (Veo3, Midjourney):
 * - 0 → PENDING (generating)
 * - 1 → SUCCESS
 * - 2 → FAILED
 * - 3 → FAILED (generation failed)
 *
 * @param model Generation model type
 * @param data API response data
 * @returns Normalized status
 * @throws Error if status cannot be determined
 */
export function normalizeStatus(
  model: GenerationModel,
  data: KieQueryTaskResponse['data']
): NormalizedStatus {
  // String-based models (Imagen4, Sora2)
  // States can be: wait, queueing, generating, waiting, success, fail
  if (model === 'IMAGEN4' || model === 'SORA2') {
    const state = data.state;
    console.log(`[normalizeStatus:${model}] String-based state: "${state}"`);
    // All intermediate/pending states
    if (state === 'wait' || state === 'queueing' || state === 'generating' || state === 'waiting') {
      return 'PENDING';
    }
    if (state === 'success') return 'SUCCESS';
    if (state === 'fail') return 'FAILED';
    throw new Error(`Unknown state: ${state}`);
  }

  // Integer-based models (Veo3, Midjourney)
  if (model === 'VEO3' || model === 'MIDJOURNEY') {
    const successFlag = data.successFlag;
    console.log(`[normalizeStatus:${model}] Integer-based successFlag: ${successFlag}`);
    if (successFlag === 0) return 'PENDING';
    if (successFlag === 1) return 'SUCCESS';
    if (successFlag === 2 || successFlag === 3) return 'FAILED';
    throw new Error(`Unknown successFlag: ${successFlag}`);
  }

  throw new Error(`Unsupported model: ${model}`);
}

/**
 * Extract result URLs from API response data
 *
 * Handles three different response formats:
 * - JSON string in `resultJson` field (Imagen4, Sora2)
 *   Format: `{resultUrls: ["url1", "url2"]}`
 * - Object array in `resultInfoJson.resultUrls` (Midjourney)
 *   Format: `{resultUrls: [{resultUrl: "url1"}, {resultUrl: "url2"}]}`
 * - Direct array in `response.resultUrls` (Veo3)
 *   Format: `{response: {resultUrls: ["url1", "url2"]}}`
 *
 * @param data API response data
 * @returns Array of result URLs (strings)
 * @throws Error if resultUrls cannot be found
 */
export function extractResultUrls(data: KieQueryTaskResponse['data']): string[] {
  // Try resultJson field (Imagen4, Sora2) - JSON string
  if (data.resultJson) {
    try {
      const parsed = JSON.parse(data.resultJson);
      if (Array.isArray(parsed.resultUrls)) {
        return parsed.resultUrls;
      }
      throw new Error('resultUrls not found in parsed resultJson');
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error(`Failed to parse resultJson: ${error.message}`);
      }
      throw error;
    }
  }

  // Try resultInfoJson object (Midjourney)
  // Note: Midjourney returns array of objects with {resultUrl: string} structure
  if (data.resultInfoJson && Array.isArray(data.resultInfoJson.resultUrls)) {
    // Check if it's array of objects with resultUrl property
    const urls = data.resultInfoJson.resultUrls;
    if (urls.length > 0 && typeof urls[0] === 'object' && 'resultUrl' in urls[0]) {
      return urls.map((item: any) => item.resultUrl);
    }
    // Fallback: assume it's array of strings
    return urls as string[];
  }

  // Try response object (Veo3)
  if (data.response && Array.isArray(data.response.resultUrls)) {
    return data.response.resultUrls;
  }

  throw new Error('Could not extract resultUrls from response');
}

/**
 * Calculate polling interval based on attempt count
 *
 * Escalation strategy:
 * - Attempts 1-3: 2s interval
 * - Attempts 4+: 5s interval
 * - After many attempts: 10s interval (maximum)
 *
 * @param attemptCount Number of polling attempts made
 * @returns Interval in milliseconds
 */
function getPollingInterval(attemptCount: number): number {
  if (attemptCount < 3) {
    return POLLING_INTERVALS.initial;
  }
  if (attemptCount < 20) {
    return POLLING_INTERVALS.standard;
  }
  return POLLING_INTERVALS.max;
}

/**
 * Start polling for async task completion
 *
 * Monitors task status with escalating intervals:
 * - 2s for first 3 attempts
 * - 5s for subsequent attempts
 * - 10s maximum interval
 * - 5 minute total timeout
 *
 * Updates database with:
 * - SUCCESS: resultJson and completedAt
 * - FAILED: failCode, failMsg, and completedAt
 * - TIMEOUT: error status and message
 *
 * @param taskId Prisma GenerationTask ID
 * @param model Generation model type
 * @param externalTaskId External service task ID
 * @throws Error if polling fails or times out
 */
export async function startPolling(
  taskId: string,
  model: GenerationModel,
  externalTaskId: string
): Promise<void> {
  console.log(`[Polling:${model}] Starting polling for task ${taskId}, externalTaskId: ${externalTaskId}`);

  const startTime = Date.now();
  let attemptCount = 0;

  while (true) {
    // Check timeout
    const elapsedTime = Date.now() - startTime;
    if (elapsedTime > MAX_POLLING_DURATION) {
      // Update task with timeout error
      await prisma.generationTask.update({
        where: { id: taskId },
        data: {
          status: 'FAILED',
          failCode: 'TIMEOUT',
          failMsg: 'Polling timeout after 5 minutes',
          completedAt: new Date(),
        },
      });
      throw new Error('Polling timeout: Task did not complete within 5 minutes');
    }

    // Wait before polling (except first attempt)
    if (attemptCount > 0) {
      const interval = getPollingInterval(attemptCount);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }

    attemptCount++;

    // Query task status
    let response: Response;
    const queryUrl = `https://api.kie.ai/api/v1/${getApiPathForModel(model)}?taskId=${externalTaskId}`;
    console.log(`[Polling:${model}] Querying URL: ${queryUrl}`);

    try {
      response = await fetch(
        queryUrl,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      throw new Error(
        `Failed to query task status: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    // Handle API error responses
    if (!response.ok) {
      throw new Error(`API error: HTTP ${response.status}`);
    }

    const responseData = (await response.json()) as KieQueryTaskResponse;

    console.log(`[Polling:${model}] Task ${taskId} - API Response:`, {
      code: responseData.code,
      taskId: externalTaskId,
      data: responseData.data,
    });

    // Check API response code
    if (responseData.code !== 200) {
      throw new Error(
        `API returned error code: ${responseData.code} - ${responseData.message || 'Unknown error'}`
      );
    }

    const data = responseData.data;

    // Normalize status
    const status = normalizeStatus(model, data);
    console.log(`[Polling:${model}] Task ${taskId} - Normalized status: ${status}`);

    // Handle pending state
    if (status === 'PENDING') {
      continue;
    }

    // Handle success state
    if (status === 'SUCCESS') {
      try {
        const resultUrls = extractResultUrls(data);
        const resultJson = data.resultJson || JSON.stringify({ resultUrls });

        // 1. Update GenerationTask and fetch associated prompt
        const task = await prisma.generationTask.update({
          where: { id: taskId },
          data: {
            status: 'SUCCESS',
            resultJson,
            completedAt: new Date(),
          },
          include: { prompt: true },
        });

        console.log(`[Polling:${model}] Task ${taskId} - Downloading ${resultUrls.length} assets...`);

        // 2. Download and save each asset locally
        const { downloadAndSaveAsset } = await import('@/lib/generation/storage');
        const assetType = task.prompt.type; // IMAGE or VIDEO
        const provider = getProviderFromModel(model);

        for (let i = 0; i < resultUrls.length; i++) {
          const sourceUrl = resultUrls[i];

          try {
            // Download and save to local storage
            const downloadResult = await downloadAndSaveAsset({
              sourceUrl,
              taskId,
              index: i,
              assetType,
            });

            // 3. Create Asset record in database
            await prisma.asset.create({
              data: {
                promptId: task.promptId,
                generationTaskId: task.id,
                type: assetType,
                url: downloadResult.apiUrl, // e.g., "/api/assets/images/task123_0.jpg"
                provider,
                fileSize: downloadResult.fileSize,
                mimeType: downloadResult.mimeType,
              },
            });

            console.log(`[Polling:${model}] Asset ${i + 1}/${resultUrls.length} saved: ${downloadResult.apiUrl}`);
          } catch (assetError) {
            console.error(`[Polling:${model}] Failed to save asset ${i}:`, assetError);
            // Continue with next asset instead of failing entire task
          }
        }

        console.log(`[Polling:${model}] Task ${taskId} completed with ${resultUrls.length} assets`);
        return;
      } catch (error) {
        throw new Error(
          `Failed to process success response: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    // Handle failed state
    if (status === 'FAILED') {
      await prisma.generationTask.update({
        where: { id: taskId },
        data: {
          status: 'FAILED',
          failCode: data.failCode || 'UNKNOWN_ERROR',
          failMsg: data.failMsg || 'Task failed without details',
          completedAt: new Date(),
        },
      });
      throw new Error(
        `Task failed: ${data.failCode || 'Unknown error'} - ${data.failMsg || 'No details'}`
      );
    }
  }
}

/**
 * Get API path segment for polling endpoint based on model
 *
 * Maps models to their respective API paths:
 * - Imagen4: /jobs/recordInfo (camelCase)
 * - Sora2: /jobs/recordInfo (camelCase)
 * - Veo3: /veo/record-info (kebab-case)
 * - Midjourney: /mj/record-info (kebab-case)
 *
 * @param model Generation model type
 * @returns API path segment including endpoint name
 * @throws Error if model is not supported
 */
function getApiPathForModel(model: GenerationModel): string {
  switch (model) {
    case 'IMAGEN4':
    case 'SORA2':
      return 'jobs/recordInfo';
    case 'VEO3':
      return 'veo/record-info';
    case 'MIDJOURNEY':
      return 'mj/record-info';
    default:
      throw new Error(`Unsupported model for polling: ${model}`);
  }
}

/**
 * Maps GenerationModel to AssetProvider
 *
 * Determines which provider to attribute the asset to based on generation model:
 * - MIDJOURNEY → MIDJOURNEY provider
 * - VEO3 → VEO provider
 * - IMAGEN4, SORA2 → MIDJOURNEY (default, as they use Kie.ai's infrastructure)
 *
 * @param model Generation model type
 * @returns Asset provider enum value
 */
function getProviderFromModel(model: GenerationModel): 'MIDJOURNEY' | 'VEO' {
  if (model === 'VEO3') {
    return 'VEO';
  }
  // MIDJOURNEY, IMAGEN4, SORA2 all use MIDJOURNEY provider
  return 'MIDJOURNEY';
}

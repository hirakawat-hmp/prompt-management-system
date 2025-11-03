/**
 * Server Action: Create Generation Task
 *
 * Creates a new image/video generation task using AI services (Kie.ai).
 * Validates parameters, initiates generation, stores task in database,
 * and starts background polling for completion.
 *
 * @module actions/generation/create-task
 */

'use server';

import { prisma } from '@/lib/prisma';
import type { ProviderParams } from '@/types/generation';
import { ProviderParamsSchema } from '@/types/generation';
import { createImagen4Task } from '@/lib/generation/services/kie/models/imagen4';
import { createVeo3Task } from '@/lib/generation/services/kie/models/veo3';
import { createMidjourneyTask } from '@/lib/generation/services/kie/models/midjourney';
import { createSora2Task } from '@/lib/generation/services/kie/models/sora2';
import { startPolling } from '@/lib/generation/services/kie/polling';
import type { GenerationTask } from '@prisma/client';

/**
 * Action result type for type-safe error handling
 */
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Input parameters for creating a generation task
 */
export interface CreateGenerationTaskInput {
  /** Prompt ID to associate with this generation task */
  promptId: string;
  /** Service and model-specific parameters (validated with Zod) */
  providerParams: ProviderParams;
}

/**
 * Creates a new generation task for image or video generation
 *
 * Workflow:
 * 1. Validates promptId and providerParams (Zod schema validation)
 * 2. Verifies prompt exists in database
 * 3. Calls appropriate model create function (imagen4/veo3/midjourney/sora2)
 * 4. Stores GenerationTask in database with status: PENDING
 * 5. Starts background polling to track completion
 * 6. Returns task data immediately (non-blocking)
 *
 * The task will be updated asynchronously by the polling process when complete.
 * Use queryGenerationTask() to check status and retrieve results.
 *
 * @param input - Task creation parameters
 * @returns Action result with created task or error message
 *
 * @example
 * ```typescript
 * // Create Imagen4 image generation task
 * const result = await createGenerationTask({
 *   promptId: 'prompt_123',
 *   providerParams: {
 *     service: 'KIE',
 *     model: 'IMAGEN4',
 *     apiModel: 'google/imagen4-fast',
 *     input: {
 *       prompt: 'A serene mountain landscape at sunset',
 *       aspect_ratio: '16:9',
 *       num_images: '2',
 *     },
 *   },
 * });
 *
 * if (result.success) {
 *   console.log('Task created:', result.data.id);
 *   console.log('External task ID:', result.data.externalTaskId);
 *   console.log('Status:', result.data.status); // PENDING
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Create Veo3 video generation task with image reference
 * const result = await createGenerationTask({
 *   promptId: 'prompt_456',
 *   providerParams: {
 *     service: 'KIE',
 *     model: 'VEO3',
 *     prompt: 'Transform this landscape into a moving scene',
 *     modelVariant: 'veo3_fast',
 *     generationType: 'REFERENCE_2_VIDEO',
 *     imageUrls: ['https://tempfile.redpandaai.co/xxx/user-uploads/ref.jpg'],
 *     aspectRatio: '16:9',
 *   },
 * });
 * ```
 */
export async function createGenerationTask(
  input: CreateGenerationTaskInput
): Promise<ActionResult<GenerationTask>> {
  try {
    // ========================================================================
    // Step 1: Validate Input
    // ========================================================================

    if (!input.promptId || input.promptId.trim() === '') {
      return {
        success: false,
        error: 'Prompt ID is required',
      };
    }

    // Validate providerParams with Zod schema
    const validationResult = ProviderParamsSchema.safeParse(input.providerParams);
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues
        .map((issue) => issue.message)
        .join(', ');
      return {
        success: false,
        error: `Invalid provider parameters: ${errorMessages}`,
      };
    }

    const providerParams = validationResult.data;

    // ========================================================================
    // Step 2: Verify Prompt Exists
    // ========================================================================

    const prompt = await prisma.prompt.findUnique({
      where: { id: input.promptId },
    });

    if (!prompt) {
      return {
        success: false,
        error: `Prompt not found: ${input.promptId}`,
      };
    }

    // ========================================================================
    // Step 3: Call Appropriate Model Create Function
    // ========================================================================

    let externalTaskId: string;

    switch (providerParams.model) {
      case 'IMAGEN4': {
        const response = await createImagen4Task(providerParams);
        externalTaskId = response.taskId;
        break;
      }

      case 'VEO3': {
        const response = await createVeo3Task(providerParams);
        externalTaskId = response.taskId;
        break;
      }

      case 'MIDJOURNEY': {
        const response = await createMidjourneyTask(providerParams);
        externalTaskId = response.taskId;
        break;
      }

      case 'SORA2': {
        const response = await createSora2Task(providerParams);
        externalTaskId = response.taskId;
        break;
      }

      default: {
        // TypeScript exhaustiveness check
        const _exhaustive: never = providerParams;
        return {
          success: false,
          error: `Unsupported model: ${(providerParams as ProviderParams).model}`,
        };
      }
    }

    // ========================================================================
    // Step 4: Store Task in Database
    // ========================================================================

    const generationTask = await prisma.generationTask.create({
      data: {
        promptId: input.promptId,
        service: providerParams.service,
        model: providerParams.model,
        externalTaskId,
        status: 'PENDING',
        providerParams: JSON.stringify(providerParams),
      },
    });

    // ========================================================================
    // Step 5: Start Background Polling (Non-blocking)
    // ========================================================================

    // Fire-and-forget: polling runs in background
    // Updates database when task completes (SUCCESS/FAILED)
    startPolling(generationTask.id, providerParams.model, externalTaskId).catch((error) => {
      console.error('Polling error for task', generationTask.id, ':', error);
    });

    // ========================================================================
    // Step 6: Return Task Data Immediately
    // ========================================================================

    return {
      success: true,
      data: generationTask,
    };
  } catch (error) {
    console.error('Failed to create generation task:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

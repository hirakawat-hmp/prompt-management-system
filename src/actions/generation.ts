/**
 * Generation Task Server Actions
 *
 * Server actions for managing generation tasks (image/video generation).
 *
 * TODO: These actions need to be implemented by the backend-implementor agent.
 *
 * Implementation requirements:
 * 1. createGenerationTask: Create a task in DB, call Kie.ai API, store externalTaskId
 * 2. uploadGenerationFile: Upload file to Kie.ai, return temporary URL (expires in 3 days)
 *
 * Related hooks: src/hooks/use-generation-tasks.ts
 * Related types: src/types/generation.ts
 */

'use server';

import { ProviderParamsSchema } from '@/types/generation';
import type { ProviderParams, UploadResult } from '@/types/generation';

/**
 * Action result type for type-safe error handling
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Generation task data structure
 */
export interface GenerationTask {
  id: string;
  promptId: string;
  service: string;
  model: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  externalTaskId?: string | null;
  providerParams: Record<string, unknown>;
  resultJson?: string | null;
  failCode?: string | null;
  failMsg?: string | null;
  createdAt: string;
  completedAt?: string | null;
}

/**
 * Input for creating a generation task
 */
export interface CreateGenerationTaskInput {
  promptId: string;
  providerParams: ProviderParams;
}

/**
 * Creates a new generation task
 *
 * @param input - Generation task parameters
 * @returns Action result with created task
 *
 * @example
 * ```typescript
 * const result = await createGenerationTask({
 *   promptId: 'prompt_123',
 *   providerParams: {
 *     service: 'KIE',
 *     model: 'IMAGEN4',
 *     apiModel: 'google/imagen4-fast',
 *     input: { prompt: 'A beautiful sunset' }
 *   }
 * });
 * ```
 */
export async function createGenerationTask(
  input: CreateGenerationTaskInput
): Promise<ActionResult<GenerationTask>> {
  try {
    console.log('[createGenerationTask] Input:', {
      promptId: input.promptId,
      service: input.providerParams.service,
      model: input.providerParams.model,
    });

    // Step 1: Validate providerParams using Zod schema
    const validation = ProviderParamsSchema.safeParse(input.providerParams);
    if (!validation.success) {
      console.error('[createGenerationTask] Validation failed:', validation.error);
      const errorMessages = validation.error?.issues
        ?.map((e: { message: string }) => e.message)
        .join(', ') || 'Invalid parameters';
      return {
        success: false,
        error: `Validation failed: ${errorMessages}`,
      };
    }

    const validatedParams = validation.data;
    console.log('[createGenerationTask] Validated params:', validatedParams);

    // Step 2: Verify promptId exists in database
    const { prisma } = await import('@/lib/prisma');
    const prompt = await prisma.prompt.findUnique({
      where: { id: input.promptId },
    });

    if (!prompt) {
      return {
        success: false,
        error: `Prompt not found: ${input.promptId}`,
      };
    }

    // Step 3: Call Kie.ai API using service layer
    const { createKieTask } = await import('@/lib/generation/services/kie/client');
    console.log('[createGenerationTask] Calling Kie.ai API...');
    const kieResponse = await createKieTask(validatedParams);
    console.log('[createGenerationTask] Kie.ai response:', kieResponse);

    // Step 4: Create GenerationTask record in Prisma
    const generationTask = await prisma.generationTask.create({
      data: {
        promptId: input.promptId,
        service: validatedParams.service,
        model: validatedParams.model,
        externalTaskId: kieResponse.taskId,
        status: 'PENDING',
        providerParams: JSON.stringify(validatedParams),
      },
    });

    // Step 5: Start background polling (don't await)
    console.log('[createGenerationTask] Starting polling for task:', {
      taskId: generationTask.id,
      model: generationTask.model,
      externalTaskId: kieResponse.taskId,
    });
    const { startPolling } = await import('@/lib/generation/services/kie/polling');
    startPolling(generationTask.id, generationTask.model, kieResponse.taskId).catch((error) => {
      console.error('[createGenerationTask] Polling error:', error);
    });

    // Step 6: Return normalized result
    console.log('[createGenerationTask] Task created successfully:', generationTask.id);
    return {
      success: true,
      data: {
        id: generationTask.id,
        promptId: generationTask.promptId,
        service: generationTask.service,
        model: generationTask.model,
        status: generationTask.status,
        externalTaskId: generationTask.externalTaskId,
        providerParams: JSON.parse(generationTask.providerParams),
        resultJson: generationTask.resultJson,
        failCode: generationTask.failCode,
        failMsg: generationTask.failMsg,
        createdAt: generationTask.createdAt.toISOString(),
        completedAt: generationTask.completedAt?.toISOString() || null,
      },
    };
  } catch (error) {
    console.error('createGenerationTask error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Uploads a file to Kie.ai temporary storage
 *
 * @param formData - FormData containing the file
 * @returns Action result with upload information
 *
 * @example
 * ```typescript
 * const formData = new FormData();
 * formData.append('file', file);
 * const result = await uploadGenerationFile(formData);
 * ```
 */
export async function uploadGenerationFile(
  formData: FormData
): Promise<ActionResult<UploadResult>> {
  try {
    // Step 1: Extract file from FormData
    const file = formData.get('file');

    // Step 2: Validate file exists
    if (!file) {
      return {
        success: false,
        error: 'File is required',
      };
    }

    // Step 3: Validate file is a File-like object
    // Note: In production, formData.get('file') returns a File object
    // In test environments (jsdom), it may return a string representation
    // We validate by checking if it's NOT a simple string (which would be invalid user input)
    if (typeof file === 'string') {
      return {
        success: false,
        error: 'Invalid file: Expected File object',
      };
    }

    // Additional type safety: ensure it's an object
    if (typeof file !== 'object' || file === null) {
      return {
        success: false,
        error: 'Invalid file: Expected File object',
      };
    }

    // Step 4: Extract optional uploadPath (default: 'user-uploads')
    const uploadPath = formData.get('uploadPath');
    const uploadPathStr =
      typeof uploadPath === 'string' && uploadPath.trim() ? uploadPath.trim() : 'user-uploads';

    // Step 5: Call Kie.ai upload API
    const { uploadFileToKie } = await import('@/lib/generation/upload');
    const uploadResult = await uploadFileToKie(file as File, uploadPathStr);

    // Step 6: Return result
    return {
      success: true,
      data: uploadResult,
    };
  } catch (error) {
    console.error('uploadGenerationFile error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

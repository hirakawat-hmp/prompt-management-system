/**
 * Server Actions: Prompt Mutations
 *
 * Create and update operations for prompts.
 * These actions run on the server and can be called from Client Components.
 */

'use server';

import { prisma } from '@/lib/prisma';
import {
  toFrontendPrompt,
  toFrontendAssets,
  toPrismaPromptType,
} from '@/lib/type-adapters';
import type { Prompt } from '@/types/project';

/**
 * Action result type for type-safe error handling
 */
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Input data for creating a prompt
 */
export interface CreatePromptInput {
  projectId: string;
  type: 'image' | 'video';
  content: string;
  mastraMessageId?: string;
  parentId?: string;
  userFeedback?: string; // User's instruction/feedback for derivative prompts
}

/**
 * Input data for updating a prompt
 */
export interface UpdatePromptInput {
  userFeedback?: string;
  aiComment?: string;
}

/**
 * Creates a new prompt in the database.
 *
 * @param input - Prompt creation data
 * @returns Action result with created prompt or error
 *
 * @example
 * ```typescript
 * const result = await createPrompt({
 *   projectId: 'proj_123',
 *   type: 'image',
 *   content: 'A beautiful sunset',
 *   mastraMessageId: 'msg_123',
 * });
 * ```
 */
export async function createPrompt(
  input: CreatePromptInput
): Promise<ActionResult<Prompt>> {
  try {
    // Validation
    if (!input.projectId || input.projectId.trim() === '') {
      return {
        success: false,
        error: 'Project ID is required',
      };
    }

    if (!input.content || input.content.trim() === '') {
      return {
        success: false,
        error: 'Prompt content is required',
      };
    }

    // Build Prisma data object
    const data: any = {
      projectId: input.projectId,
      type: toPrismaPromptType(input.type),
      content: input.content.trim(),
    };

    if (input.mastraMessageId) {
      data.mastraMessageId = input.mastraMessageId;
    }

    if (input.parentId) {
      data.parentId = input.parentId;
    }

    if (input.userFeedback) {
      data.userFeedback = input.userFeedback.trim();
    }

    // Create Prisma prompt
    const prismaPrompt = await prisma.prompt.create({
      data,
      include: { assets: true },
    });

    // Convert to frontend type
    const prompt = toFrontendPrompt(prismaPrompt);

    // Convert assets if they exist
    if (prismaPrompt.assets && prismaPrompt.assets.length > 0) {
      prompt.assets = toFrontendAssets(prismaPrompt.assets);
    }

    return {
      success: true,
      data: prompt,
    };
  } catch (error) {
    console.error('Failed to create prompt:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Updates an existing prompt's feedback or AI comment.
 *
 * @param promptId - Prompt ID to update
 * @param input - Fields to update
 * @returns Action result with updated prompt or error
 *
 * @example
 * ```typescript
 * const result = await updatePrompt('prompt_123', {
 *   userFeedback: 'Too bright',
 *   aiComment: 'Adjusting brightness',
 * });
 * ```
 */
export async function updatePrompt(
  promptId: string,
  input: UpdatePromptInput
): Promise<ActionResult<Prompt>> {
  try {
    // Validation
    if (!input.userFeedback && !input.aiComment) {
      return {
        success: false,
        error: 'No fields to update',
      };
    }

    // Build update data
    const data: any = {};

    if (input.userFeedback !== undefined) {
      data.userFeedback = input.userFeedback.trim();
    }

    if (input.aiComment !== undefined) {
      data.aiComment = input.aiComment.trim();
    }

    // Update Prisma prompt
    const prismaPrompt = await prisma.prompt.update({
      where: { id: promptId },
      data,
      include: { assets: true },
    });

    // Convert to frontend type
    const prompt = toFrontendPrompt(prismaPrompt);

    // Convert assets if they exist
    if (prismaPrompt.assets && prismaPrompt.assets.length > 0) {
      prompt.assets = toFrontendAssets(prismaPrompt.assets);
    }

    return {
      success: true,
      data: prompt,
    };
  } catch (error) {
    console.error('Failed to update prompt:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

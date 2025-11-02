/**
 * Server Action: AI Prompt Generation
 *
 * Generate optimized prompts for image/video generation using AI.
 * This action can be called from Client Components.
 */

'use server';

import {
  generatePrompt,
  PromptGenerationError,
  type PromptContentType,
} from '@/mastra/agents/prompt-generator-agent';

/**
 * Action result type for type-safe error handling
 */
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Input data for generating a prompt with AI
 */
export interface GeneratePromptInput {
  requirements: string;
  type: PromptContentType;
}

/**
 * Generates an optimized prompt using AI based on user requirements.
 *
 * @param input - Requirements and content type
 * @returns Action result with generated prompt text or error
 *
 * @example
 * ```typescript
 * const result = await generatePromptWithAI({
 *   requirements: 'A peaceful garden with cherry blossoms',
 *   type: 'image',
 * });
 *
 * if (result.success) {
 *   console.log(result.data); // "A serene Japanese garden..."
 * }
 * ```
 */
export async function generatePromptWithAI(
  input: GeneratePromptInput
): Promise<ActionResult<string>> {
  try {
    // Validate input
    if (!input.requirements || input.requirements.trim() === '') {
      return {
        success: false,
        error: 'Requirements cannot be empty',
      };
    }

    // Validate type
    if (!input.type || !['image', 'video'].includes(input.type)) {
      return {
        success: false,
        error: 'Invalid content type. Must be "image" or "video".',
      };
    }

    // Generate prompt using AI agent
    const promptText = await generatePrompt(
      input.requirements.trim(),
      input.type
    );

    return {
      success: true,
      data: promptText,
    };
  } catch (error) {
    // Handle PromptGenerationError specifically
    if (error instanceof PromptGenerationError) {
      console.error(
        `Prompt generation error (${error.code}):`,
        error.message,
        error.originalError
      );

      return {
        success: false,
        error: error.message, // Already user-friendly
      };
    }

    // Handle other errors
    console.error('Unexpected error in generatePromptWithAI:', error);

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'An unexpected error occurred while generating the prompt',
    };
  }
}

/**
 * Client-side API helpers for prompt generation
 */

// Supported models
export const IMAGE_MODELS = ['imagen4', 'midjourney'] as const;
export const VIDEO_MODELS = ['veo3', 'sora2'] as const;
export const ALL_MODELS = [...IMAGE_MODELS, ...VIDEO_MODELS] as const;

export type ImageModel = typeof IMAGE_MODELS[number];
export type VideoModel = typeof VIDEO_MODELS[number];
export type Model = typeof ALL_MODELS[number];
export type Mode = 'generate' | 'improve';

// Request types
export interface GeneratePromptRequest {
  mode: Mode;
  model: Model;
  userMessage: string;
  existingPrompt?: string;
}

// Response types
export interface GeneratePromptResponse {
  prompt: string;
  parameters?: string;
  explanation?: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

// Result type (discriminated union)
export type GeneratePromptResult =
  | { success: true; data: GeneratePromptResponse }
  | { success: false; error: string; code?: string };

/**
 * Generates a new prompt from user requirements
 *
 * @param model - Target AI model
 * @param userMessage - User's description of what they want
 * @returns Generated prompt with optional parameters and explanation
 *
 * @example
 * ```typescript
 * const result = await generatePrompt('midjourney', '夕暮れの富士山');
 * if (result.success) {
 *   console.log(result.data.prompt);
 *   console.log(result.data.parameters); // e.g., "--ar 16:9 --s 300"
 * }
 * ```
 */
export async function generatePrompt(
  model: Model,
  userMessage: string
): Promise<GeneratePromptResult> {
  return callPromptGenerationAPI({
    mode: 'generate',
    model,
    userMessage,
  });
}

/**
 * Improves an existing prompt based on user feedback
 *
 * @param model - Target AI model (can differ from original prompt's model)
 * @param existingPrompt - The prompt to improve
 * @param userMessage - User's modification request
 * @returns Improved prompt with optional parameters and explanation
 *
 * @example
 * ```typescript
 * const result = await improvePrompt(
 *   'midjourney',
 *   'a beautiful sunset',
 *   'もっと具体的に、カメラ設定も含めて'
 * );
 * if (result.success) {
 *   console.log(result.data.prompt);
 * }
 * ```
 */
export async function improvePrompt(
  model: Model,
  existingPrompt: string,
  userMessage: string
): Promise<GeneratePromptResult> {
  return callPromptGenerationAPI({
    mode: 'improve',
    model,
    userMessage,
    existingPrompt,
  });
}

/**
 * Internal function to call the prompt generation API
 */
async function callPromptGenerationAPI(
  request: GeneratePromptRequest
): Promise<GeneratePromptResult> {
  try {
    const response = await fetch('/api/prompts/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    if (!response.ok) {
      // Server returned an error
      const errorData = data as ErrorResponse;
      return {
        success: false,
        error: errorData.error || 'Unknown error',
        code: errorData.code,
      };
    }

    // Success response
    return {
      success: true,
      data: data as GeneratePromptResponse,
    };
  } catch (error) {
    // Network or parsing error
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate prompt',
      code: 'NETWORK_ERROR',
    };
  }
}

/**
 * Type guard to check if a model is an image model
 */
export function isImageModel(model: Model): model is ImageModel {
  return IMAGE_MODELS.includes(model as ImageModel);
}

/**
 * Type guard to check if a model is a video model
 */
export function isVideoModel(model: Model): model is VideoModel {
  return VIDEO_MODELS.includes(model as VideoModel);
}

/**
 * Gets the content type (image or video) for a given model
 */
export function getContentType(model: Model): 'image' | 'video' {
  return isImageModel(model) ? 'image' : 'video';
}

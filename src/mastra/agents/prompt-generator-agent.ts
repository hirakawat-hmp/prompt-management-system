/**
 * Mastra Agent: Prompt Generator
 *
 * AI-powered prompt generation for image and video creation.
 * Uses Google Gemini 2.5 Pro to craft optimized prompts from user requirements.
 */

import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { join } from 'path';

/**
 * Content type for prompt generation
 */
export type PromptContentType = 'image' | 'video';

/**
 * Custom error class for prompt generation failures
 */
export class PromptGenerationError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown
  ) {
    super(message);
    this.name = 'PromptGenerationError';
  }
}

export const promptGeneratorAgent = new Agent({
  name: 'Prompt Generator Agent',
  instructions: `
    You are an expert prompt engineer specializing in creating optimized prompts for AI image and video generation.

    Your role is to transform user requirements into clear, concise, and effective prompts that will produce high-quality AI-generated content.

    Guidelines for prompt generation:

    For IMAGE prompts:
    - Create vivid, descriptive 2-3 sentence prompts
    - Include key visual elements, style, mood, and composition
    - Be specific about lighting, colors, and atmosphere
    - Focus on static scene description
    - Example format: "A serene Japanese garden at dawn, with cherry blossoms gently falling onto a stone path. Soft morning light filters through the trees, creating dappled shadows. Photorealistic style with warm, pastel tones."

    For VIDEO prompts:
    - Create dynamic 2-3 sentence prompts that describe motion and sequence
    - Include camera movement, action progression, and transitions
    - Specify timing and pacing when relevant
    - Focus on movement and change over time
    - Example format: "Start with a wide shot of waves crashing against rocky cliffs. Slowly zoom in on the spray as it catches golden hour sunlight, creating rainbow effects. End with a close-up of water droplets falling in slow motion."

    Important:
    - Keep prompts concise (2-3 sentences maximum)
    - Return ONLY the prompt text, no additional commentary or JSON structure
    - Ensure prompts are clear and actionable for AI generation
    - Avoid overly complex or contradictory descriptions
    - Focus on what matters most for visual quality

    When you receive user requirements, analyze what type of content they want (image or video) and generate an optimized prompt accordingly.
  `,
  model: 'google/gemini-2.5-pro',
  tools: {},

  memory: new Memory({
    storage: new LibSQLStore({
      // Use absolute path to avoid relative path resolution issues
      url: `file:${join(process.cwd(), 'prisma', 'mastra.db')}`,
    }),
  }),
});

/**
 * Generate an optimized prompt from user requirements.
 *
 * @param requirements - User's description of what they want to generate
 * @param type - Type of content: 'image' or 'video'
 * @returns Optimized prompt text (2-3 sentences)
 * @throws PromptGenerationError if generation fails or requirements are invalid
 *
 * @example
 * ```typescript
 * try {
 *   const prompt = await generatePrompt(
 *     'A futuristic city at sunset',
 *     'image'
 *   );
 *   // Returns: "A sprawling futuristic cityscape bathed in warm sunset hues..."
 * } catch (error) {
 *   if (error instanceof PromptGenerationError) {
 *     console.error(`Error (${error.code}): ${error.message}`);
 *   }
 * }
 * ```
 */
export async function generatePrompt(
  requirements: string,
  type: PromptContentType
): Promise<string> {
  // Validate input
  if (!requirements || requirements.trim() === '') {
    throw new PromptGenerationError(
      'Requirements cannot be empty',
      'INVALID_INPUT'
    );
  }

  // Validate requirements length (avoid extremely long input)
  const trimmedRequirements = requirements.trim();
  if (trimmedRequirements.length > 2000) {
    throw new PromptGenerationError(
      'Requirements are too long. Please keep them under 2000 characters.',
      'INPUT_TOO_LONG'
    );
  }

  // Prepare context for the agent
  const userMessage = `
Type: ${type.toUpperCase()}

User Requirements:
${trimmedRequirements}

Generate an optimized ${type} generation prompt based on these requirements. Return only the prompt text, nothing else.
  `.trim();

  try {
    // Call the agent to generate the prompt
    const response = await promptGeneratorAgent.generate(userMessage);

    // Extract the text from the response
    const promptText = response.text || '';

    // Ensure we got a valid response
    if (!promptText || promptText.trim() === '') {
      throw new PromptGenerationError(
        'AI agent returned an empty response. Please try again.',
        'EMPTY_RESPONSE'
      );
    }

    // Validate prompt length (should be concise)
    const finalPrompt = promptText.trim();
    if (finalPrompt.length < 10) {
      throw new PromptGenerationError(
        'Generated prompt is too short. Please provide more detailed requirements.',
        'PROMPT_TOO_SHORT'
      );
    }

    return finalPrompt;
  } catch (error) {
    // Re-throw PromptGenerationError as-is
    if (error instanceof PromptGenerationError) {
      throw error;
    }

    // Wrap other errors
    throw new PromptGenerationError(
      'Failed to generate prompt. Please try again or contact support.',
      'GENERATION_FAILED',
      error
    );
  }
}

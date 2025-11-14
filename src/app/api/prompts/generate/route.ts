/**
 * API Route: POST /api/prompts/generate
 *
 * Generates optimized prompts for AI image/video generation models.
 * Uses model-specific tips and supports both generate and improve modes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { mastra } from '@/mastra';
import type { CoreMessage } from 'ai';

// Supported models
const IMAGE_MODELS = ['imagen4', 'midjourney'] as const;
const VIDEO_MODELS = ['veo3', 'sora2'] as const;
const ALL_MODELS = [...IMAGE_MODELS, ...VIDEO_MODELS] as const;

type ImageModel = typeof IMAGE_MODELS[number];
type VideoModel = typeof VIDEO_MODELS[number];
type Model = typeof ALL_MODELS[number];
type Mode = 'generate' | 'improve';

// Request body type
interface GeneratePromptRequest {
  mode: Mode;
  model: Model;
  userMessage: string;
  existingPrompt?: string;
}

// Response type
interface GeneratePromptResponse {
  prompt: string;
  parameters?: string;
  explanation?: string;
}

// Error response
interface ErrorResponse {
  error: string;
  code?: string;
}

/**
 * Validates the request body
 */
function validateRequest(body: any): { valid: true; data: GeneratePromptRequest } | { valid: false; error: string; code: string } {
  if (!body) {
    return { valid: false, error: 'Request body is required', code: 'MISSING_BODY' };
  }

  const { mode, model, userMessage, existingPrompt } = body;

  // Validate mode
  if (!mode || !['generate', 'improve'].includes(mode)) {
    return { valid: false, error: 'Mode must be "generate" or "improve"', code: 'INVALID_MODE' };
  }

  // Validate model
  if (!model || !ALL_MODELS.includes(model)) {
    return {
      valid: false,
      error: `Model must be one of: ${ALL_MODELS.join(', ')}`,
      code: 'INVALID_MODEL',
    };
  }

  // Validate userMessage
  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
    return { valid: false, error: 'User message is required', code: 'MISSING_USER_MESSAGE' };
  }

  if (userMessage.length > 2000) {
    return {
      valid: false,
      error: 'User message is too long (max 2000 characters)',
      code: 'USER_MESSAGE_TOO_LONG',
    };
  }

  // Validate existingPrompt for improve mode
  if (mode === 'improve' && (!existingPrompt || existingPrompt.trim() === '')) {
    return {
      valid: false,
      error: 'Existing prompt is required for improve mode',
      code: 'MISSING_EXISTING_PROMPT',
    };
  }

  return {
    valid: true,
    data: { mode, model, userMessage, existingPrompt },
  };
}

/**
 * Reads model-specific tips from docs/prompt_tips
 */
async function loadModelTips(model: Model): Promise<string> {
  try {
    const tipsPath = join(process.cwd(), 'docs', 'prompt_tips', `${model}.md`);
    const tips = await readFile(tipsPath, 'utf-8');
    return tips;
  } catch (error) {
    throw new Error(`Failed to load tips for model ${model}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Determines which agent to use based on model type
 */
function getAgentName(model: Model): 'imagePromptAgent' | 'videoPromptAgent' {
  return IMAGE_MODELS.includes(model as ImageModel) ? 'imagePromptAgent' : 'videoPromptAgent';
}

/**
 * Builds context messages for the agent
 */
function buildContext(
  mode: Mode,
  model: Model,
  tips: string,
  existingPrompt?: string
): CoreMessage[] {
  const context: CoreMessage[] = [
    { role: 'user', content: `Mode: ${mode}` },
    { role: 'user', content: `Model: ${model}` },
    { role: 'user', content: `Tips:\n${tips}` },
  ];

  if (mode === 'improve' && existingPrompt) {
    context.push({ role: 'user', content: `Existing prompt: ${existingPrompt}` });
  }

  return context;
}

/**
 * Parses agent response to extract prompt, parameters, and explanation
 */
function parseAgentResponse(responseText: string): GeneratePromptResponse {
  // Expected format:
  // Prompt: [text]
  // Parameters: [text] (optional)
  // Explanation: [text] (optional)

  const promptMatch = responseText.match(/Prompt:\s*(.+?)(?=\n(?:Parameters|Explanation|$))/s);
  const parametersMatch = responseText.match(/Parameters:\s*(.+?)(?=\n(?:Explanation|$))/s);
  const explanationMatch = responseText.match(/Explanation:\s*(.+?)$/s);

  const prompt = promptMatch?.[1]?.trim() || responseText.trim();
  const parameters = parametersMatch?.[1]?.trim();
  const explanation = explanationMatch?.[1]?.trim();

  return {
    prompt,
    ...(parameters && { parameters }),
    ...(explanation && { explanation }),
  };
}

/**
 * POST handler for prompt generation
 */
export async function POST(req: NextRequest): Promise<NextResponse<GeneratePromptResponse | ErrorResponse>> {
  try {
    // Parse and validate request body
    const body = await req.json();
    const validation = validateRequest(body);

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error, code: validation.code },
        { status: 400 }
      );
    }

    const { mode, model, userMessage, existingPrompt } = validation.data;

    // Load model-specific tips
    let tips: string;
    try {
      tips = await loadModelTips(model);
    } catch (error) {
      return NextResponse.json(
        {
          error: 'Failed to load model tips',
          code: 'TIPS_LOAD_ERROR',
        },
        { status: 500 }
      );
    }

    // Build context messages
    const context = buildContext(mode, model, tips, existingPrompt);

    // Get appropriate agent
    const agentName = getAgentName(model);
    const agent = mastra.getAgent(agentName);

    if (!agent) {
      return NextResponse.json(
        {
          error: `Agent ${agentName} not found`,
          code: 'AGENT_NOT_FOUND',
        },
        { status: 500 }
      );
    }

    // Generate prompt
    const response = await agent.generate(userMessage, { context });

    if (!response.text || response.text.trim() === '') {
      return NextResponse.json(
        {
          error: 'Agent returned empty response',
          code: 'EMPTY_RESPONSE',
        },
        { status: 500 }
      );
    }

    // Parse and return response
    const parsedResponse = parseAgentResponse(response.text);

    return NextResponse.json(parsedResponse, { status: 200 });
  } catch (error) {
    console.error('Error generating prompt:', error);

    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

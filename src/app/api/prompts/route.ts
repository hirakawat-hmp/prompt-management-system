/**
 * API Route: GET /api/prompts
 *
 * Fetches prompts for a specific project, including their assets.
 *
 * Query Parameters:
 * - projectId (required): The project ID to fetch prompts for
 *
 * @returns JSON array of prompts with assets, using frontend types
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toFrontendPrompt, toFrontendAssets } from '@/lib/type-adapters';

/**
 * GET /api/prompts?projectId=xxx
 *
 * Fetches all prompts for a specific project, including their assets.
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/prompts?projectId=proj_123');
 * const prompts = await response.json();
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Extract projectId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const projectId = searchParams.get('projectId');

    if (!projectId) {
      return NextResponse.json(
        { error: 'Missing required parameter: projectId' },
        { status: 400 }
      );
    }

    // Fetch prompts with their assets and parent relationship
    const prismaPrompts = await prisma.prompt.findMany({
      where: { projectId },
      include: {
        assets: true,
        parent: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Convert to frontend types
    const prompts = prismaPrompts.map((prismaPrompt) => {
      const prompt = toFrontendPrompt(prismaPrompt);

      // Convert assets if they exist
      if (prismaPrompt.assets && prismaPrompt.assets.length > 0) {
        prompt.assets = toFrontendAssets(prismaPrompt.assets);
      }

      return prompt;
    });

    return NextResponse.json(prompts);
  } catch (error) {
    console.error('Failed to fetch prompts:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch prompts',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

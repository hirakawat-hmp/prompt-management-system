/**
 * API Route: GET /api/generation/tasks
 *
 * Fetches generation tasks for a specific prompt, including their assets.
 *
 * Query Parameters:
 * - promptId (required): The prompt ID to fetch generation tasks for
 *
 * @returns JSON array of generation tasks with assets and metadata
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/generation/tasks?promptId=xxx
 *
 * Fetches all generation tasks for a specific prompt, including their assets.
 * Tasks are ordered by creation date (newest first).
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/generation/tasks?promptId=prompt_123');
 * const tasks = await response.json();
 * // [{ id, service, model, status, assets, ... }]
 * ```
 */
export async function GET(request: NextRequest) {
  try {
    // Extract promptId from query parameters
    const searchParams = request.nextUrl.searchParams;
    const promptId = searchParams.get('promptId');

    if (!promptId) {
      return NextResponse.json(
        { error: 'Missing required parameter: promptId' },
        { status: 400 }
      );
    }

    // Fetch generation tasks with their assets
    const tasks = await prisma.generationTask.findMany({
      where: { promptId },
      include: {
        assets: true,
        prompt: {
          select: {
            id: true,
            type: true,
            content: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // Newest first
    });

    // Parse providerParams from JSON string to object
    const tasksWithParsedParams = tasks.map((task) => ({
      ...task,
      providerParams: JSON.parse(task.providerParams),
      resultJson: task.resultJson ? JSON.parse(task.resultJson) : null,
    }));

    return NextResponse.json(tasksWithParsedParams);
  } catch (error) {
    console.error('Failed to fetch generation tasks:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch generation tasks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

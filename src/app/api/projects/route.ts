/**
 * API Route: GET /api/projects
 *
 * Fetches all projects ordered by most recently updated.
 *
 * @returns JSON array of projects with frontend types
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { toFrontendProjects } from '@/lib/type-adapters';

/**
 * GET /api/projects
 *
 * Fetches all projects from the database.
 *
 * @example
 * ```typescript
 * const response = await fetch('/api/projects');
 * const projects = await response.json();
 * ```
 */
export async function GET() {
  try {
    // Fetch all projects ordered by most recently updated, including prompt count
    const prismaProjects = await prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { prompts: true },
        },
      },
    });

    // Convert to frontend types and preserve _count
    const projects = prismaProjects.map((project) => ({
      ...toFrontendProjects([project])[0],
      _count: project._count,
    }));

    return NextResponse.json(projects);
  } catch (error) {
    console.error('Failed to fetch projects:', error);

    return NextResponse.json(
      {
        error: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

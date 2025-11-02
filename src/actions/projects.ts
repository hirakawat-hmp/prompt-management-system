/**
 * Server Actions: Project Mutations
 *
 * Create and update operations for projects.
 * These actions run on the server and can be called from Client Components.
 */

'use server';

import { prisma } from '@/lib/prisma';
import { mastra } from '@/mastra';
import { toFrontendProject } from '@/lib/type-adapters';
import { createId } from '@paralleldrive/cuid2';
import type { Project } from '@/types/project';

/**
 * Action result type for type-safe error handling
 */
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Creates a new project with a corresponding Mastra thread.
 *
 * The project ID is used as the Mastra threadId to link conversations
 * with project data.
 *
 * @param name - Project name
 * @returns Action result with created project or error
 *
 * @example
 * ```typescript
 * const result = await createProject('My New Project');
 * if (result.success) {
 *   console.log('Created project:', result.data);
 * } else {
 *   console.error('Error:', result.error);
 * }
 * ```
 */
export async function createProject(
  name: string
): Promise<ActionResult<Project>> {
  try {
    // Validation
    if (!name || name.trim() === '') {
      return {
        success: false,
        error: 'Project name is required',
      };
    }

    if (name.length > 255) {
      return {
        success: false,
        error: 'Project name must be less than 255 characters',
      };
    }

    // Generate project ID
    const projectId = createId();

    // Create Mastra thread first (using projectId as threadId)
    await mastra.memory.createThread({
      threadId: projectId,
      resourceid: 'default',
    });

    // Create Prisma project
    const prismaProject = await prisma.project.create({
      data: {
        id: projectId,
        name: name.trim(),
      },
    });

    // Convert to frontend type
    const project = toFrontendProject(prismaProject);

    return {
      success: true,
      data: project,
    };
  } catch (error) {
    console.error('Failed to create project:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Updates an existing project's name.
 *
 * @param projectId - Project ID to update
 * @param name - New project name
 * @returns Action result with updated project or error
 *
 * @example
 * ```typescript
 * const result = await updateProject('proj_123', 'Updated Name');
 * if (result.success) {
 *   console.log('Updated project:', result.data);
 * }
 * ```
 */
export async function updateProject(
  projectId: string,
  name: string
): Promise<ActionResult<Project>> {
  try {
    // Validation
    if (!name || name.trim() === '') {
      return {
        success: false,
        error: 'Project name is required',
      };
    }

    if (name.length > 255) {
      return {
        success: false,
        error: 'Project name must be less than 255 characters',
      };
    }

    // Update Prisma project
    const prismaProject = await prisma.project.update({
      where: { id: projectId },
      data: { name: name.trim() },
    });

    // Convert to frontend type
    const project = toFrontendProject(prismaProject);

    return {
      success: true,
      data: project,
    };
  } catch (error) {
    console.error('Failed to update project:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

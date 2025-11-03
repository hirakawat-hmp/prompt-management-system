/**
 * Server Action: Query Generation Task
 *
 * Retrieves the current status and results of a generation task from the database.
 * Use this to check if a task has completed and retrieve generated asset URLs.
 *
 * @module actions/generation/query-task
 */

'use server';

import { prisma } from '@/lib/prisma';
import type { GenerationTask } from '@prisma/client';

/**
 * Action result type for type-safe error handling
 */
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Queries a generation task by ID and returns its current status and results
 *
 * The task status will be one of:
 * - PENDING: Task is still generating or waiting in queue
 * - SUCCESS: Task completed successfully, check resultJson for URLs
 * - FAILED: Task failed, check failCode and failMsg for details
 *
 * For successful tasks, resultJson contains:
 * ```json
 * {
 *   "resultUrls": ["https://file.example.com/image1.jpg", ...]
 * }
 * ```
 *
 * @param taskId - GenerationTask ID (Prisma database ID)
 * @returns Action result with full task data or error message
 *
 * @example
 * ```typescript
 * // Query task status
 * const result = await queryGenerationTask('gen_task_123');
 *
 * if (result.success) {
 *   const task = result.data;
 *
 *   switch (task.status) {
 *     case 'PENDING':
 *       console.log('Still generating...');
 *       break;
 *
 *     case 'SUCCESS':
 *       if (task.resultJson) {
 *         const results = JSON.parse(task.resultJson);
 *         console.log('Generated assets:', results.resultUrls);
 *       }
 *       break;
 *
 *     case 'FAILED':
 *       console.error('Generation failed:', task.failMsg);
 *       break;
 *   }
 * }
 * ```
 *
 * @example
 * ```typescript
 * // Polling pattern
 * async function waitForCompletion(taskId: string) {
 *   const maxAttempts = 60; // 5 minutes with 5s intervals
 *   let attempts = 0;
 *
 *   while (attempts < maxAttempts) {
 *     const result = await queryGenerationTask(taskId);
 *
 *     if (!result.success) {
 *       throw new Error(result.error);
 *     }
 *
 *     if (result.data.status === 'SUCCESS') {
 *       return result.data;
 *     }
 *
 *     if (result.data.status === 'FAILED') {
 *       throw new Error(result.data.failMsg || 'Generation failed');
 *     }
 *
 *     // Still pending, wait and retry
 *     await new Promise(resolve => setTimeout(resolve, 5000));
 *     attempts++;
 *   }
 *
 *   throw new Error('Polling timeout');
 * }
 * ```
 */
export async function queryGenerationTask(taskId: string): Promise<ActionResult<GenerationTask>> {
  try {
    // ========================================================================
    // Step 1: Validate Input
    // ========================================================================

    if (!taskId || taskId.trim() === '') {
      return {
        success: false,
        error: 'Task ID is required',
      };
    }

    // ========================================================================
    // Step 2: Query Task from Database
    // ========================================================================

    const task = await prisma.generationTask.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return {
        success: false,
        error: `Task not found: ${taskId}`,
      };
    }

    // ========================================================================
    // Step 3: Return Task Data
    // ========================================================================

    return {
      success: true,
      data: task,
    };
  } catch (error) {
    console.error('Failed to query generation task:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

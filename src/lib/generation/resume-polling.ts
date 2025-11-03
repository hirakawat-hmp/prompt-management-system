/**
 * Resume Polling for Pending Tasks
 *
 * Automatically resumes polling for PENDING generation tasks when the server starts.
 * This ensures tasks are not left incomplete after server restarts or deployments.
 *
 * Features:
 * - Finds all PENDING tasks in the database
 * - Times out tasks older than 5 minutes
 * - Resumes polling for active tasks
 * - Limits to 50 most recent tasks to avoid overwhelming the system
 */

import { prisma } from '@/lib/prisma';
import { startPolling } from './services/kie/polling';

/**
 * Maximum age for a task to be considered "active" (5 minutes)
 * Tasks older than this will be marked as FAILED with timeout error
 */
const MAX_TASK_AGE_MS = 5 * 60 * 1000;

/**
 * Maximum number of tasks to resume at once
 * Prevents overwhelming the system with too many concurrent polls
 */
const MAX_TASKS_TO_RESUME = 50;

/**
 * Resume polling for all pending generation tasks
 *
 * This function should be called once when the server starts.
 * It will:
 * 1. Find all PENDING tasks in the database
 * 2. Mark tasks older than 5 minutes as FAILED (timeout)
 * 3. Resume polling for recent PENDING tasks
 *
 * @returns Number of tasks resumed
 *
 * @example
 * ```typescript
 * // In instrumentation.ts or server startup
 * import { resumePendingTasks } from '@/lib/generation/resume-polling';
 *
 * export async function register() {
 *   await resumePendingTasks();
 * }
 * ```
 */
export async function resumePendingTasks(): Promise<number> {
  try {
    console.log('[ResumePoll] Checking for pending tasks...');

    // Find all PENDING tasks, ordered by most recent first
    const pendingTasks = await prisma.generationTask.findMany({
      where: {
        status: 'PENDING',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: MAX_TASKS_TO_RESUME,
    });

    if (pendingTasks.length === 0) {
      console.log('[ResumePoll] No pending tasks found');
      return 0;
    }

    console.log(`[ResumePoll] Found ${pendingTasks.length} pending task(s)`);

    let resumedCount = 0;
    let timedOutCount = 0;

    for (const task of pendingTasks) {
      const taskAge = Date.now() - task.createdAt.getTime();

      // Check if task has exceeded maximum age (5 minutes)
      if (taskAge > MAX_TASK_AGE_MS) {
        console.log(
          `[ResumePoll] Task ${task.id} is too old (${Math.floor(taskAge / 1000)}s), marking as timed out`
        );

        await prisma.generationTask.update({
          where: { id: task.id },
          data: {
            status: 'FAILED',
            failCode: 'TIMEOUT',
            failMsg: 'Task timed out after server restart (exceeded 5 minutes)',
            completedAt: new Date(),
          },
        });

        timedOutCount++;
        continue;
      }

      // Verify that the task has an external task ID
      if (!task.externalTaskId) {
        console.warn(
          `[ResumePoll] Task ${task.id} has no externalTaskId, skipping`
        );
        continue;
      }

      // Resume polling for this task
      console.log(
        `[ResumePoll] Resuming polling for task ${task.id} (age: ${Math.floor(taskAge / 1000)}s)`
      );

      // Start polling asynchronously (don't await)
      startPolling(task.id, task.model, task.externalTaskId).catch((error) => {
        console.error(`[ResumePoll] Error resuming task ${task.id}:`, error);
      });

      resumedCount++;
    }

    console.log(
      `[ResumePoll] Resume summary: ${resumedCount} resumed, ${timedOutCount} timed out`
    );

    return resumedCount;
  } catch (error) {
    console.error('[ResumePoll] Error resuming pending tasks:', error);
    // Don't throw - we don't want to crash the server on startup
    return 0;
  }
}

/**
 * Check if there are any pending tasks that need attention
 *
 * Useful for monitoring or health checks
 *
 * @returns Number of PENDING tasks
 */
export async function getPendingTaskCount(): Promise<number> {
  try {
    return await prisma.generationTask.count({
      where: {
        status: 'PENDING',
      },
    });
  } catch (error) {
    console.error('[ResumePoll] Error counting pending tasks:', error);
    return 0;
  }
}

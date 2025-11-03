/**
 * Tests for Resume Polling Functionality
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { resumePendingTasks, getPendingTaskCount } from './resume-polling';
import { prisma } from '@/lib/prisma';
import * as polling from './services/kie/polling';

// Mock the polling module
vi.mock('./services/kie/polling', () => ({
  startPolling: vi.fn().mockResolvedValue(undefined),
}));

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    generationTask: {
      findMany: vi.fn(),
      count: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Resume Polling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress console logs during tests
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('resumePendingTasks', () => {
    it('should return 0 when no pending tasks exist', async () => {
      vi.mocked(prisma.generationTask.findMany).mockResolvedValue([]);

      const result = await resumePendingTasks();

      expect(result).toBe(0);
      expect(prisma.generationTask.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
      expect(polling.startPolling).not.toHaveBeenCalled();
    });

    it('should resume polling for recent pending tasks', async () => {
      const recentTask = {
        id: 'task-1',
        model: 'IMAGEN4',
        externalTaskId: 'ext-123',
        createdAt: new Date(Date.now() - 60 * 1000), // 1 minute ago
        status: 'PENDING',
      };

      vi.mocked(prisma.generationTask.findMany).mockResolvedValue([
        recentTask as any,
      ]);

      const result = await resumePendingTasks();

      expect(result).toBe(1);
      expect(polling.startPolling).toHaveBeenCalledWith(
        'task-1',
        'IMAGEN4',
        'ext-123'
      );
    });

    it('should timeout tasks older than 5 minutes', async () => {
      const oldTask = {
        id: 'task-old',
        model: 'IMAGEN4',
        externalTaskId: 'ext-old',
        createdAt: new Date(Date.now() - 6 * 60 * 1000), // 6 minutes ago
        status: 'PENDING',
      };

      vi.mocked(prisma.generationTask.findMany).mockResolvedValue([
        oldTask as any,
      ]);
      vi.mocked(prisma.generationTask.update).mockResolvedValue(oldTask as any);

      const result = await resumePendingTasks();

      expect(result).toBe(0); // No tasks resumed
      expect(prisma.generationTask.update).toHaveBeenCalledWith({
        where: { id: 'task-old' },
        data: {
          status: 'FAILED',
          failCode: 'TIMEOUT',
          failMsg: 'Task timed out after server restart (exceeded 5 minutes)',
          completedAt: expect.any(Date),
        },
      });
      expect(polling.startPolling).not.toHaveBeenCalled();
    });

    it('should skip tasks without externalTaskId', async () => {
      const taskWithoutExtId = {
        id: 'task-no-ext',
        model: 'IMAGEN4',
        externalTaskId: null,
        createdAt: new Date(Date.now() - 60 * 1000),
        status: 'PENDING',
      };

      vi.mocked(prisma.generationTask.findMany).mockResolvedValue([
        taskWithoutExtId as any,
      ]);

      const result = await resumePendingTasks();

      expect(result).toBe(0);
      expect(polling.startPolling).not.toHaveBeenCalled();
    });

    it('should handle mixed tasks (some recent, some old)', async () => {
      const tasks = [
        {
          id: 'task-recent-1',
          model: 'IMAGEN4',
          externalTaskId: 'ext-1',
          createdAt: new Date(Date.now() - 60 * 1000), // 1 min ago
          status: 'PENDING',
        },
        {
          id: 'task-old-1',
          model: 'VEO3',
          externalTaskId: 'ext-2',
          createdAt: new Date(Date.now() - 6 * 60 * 1000), // 6 min ago
          status: 'PENDING',
        },
        {
          id: 'task-recent-2',
          model: 'MIDJOURNEY',
          externalTaskId: 'ext-3',
          createdAt: new Date(Date.now() - 2 * 60 * 1000), // 2 min ago
          status: 'PENDING',
        },
      ];

      vi.mocked(prisma.generationTask.findMany).mockResolvedValue(tasks as any);
      vi.mocked(prisma.generationTask.update).mockResolvedValue(tasks[1] as any);

      const result = await resumePendingTasks();

      expect(result).toBe(2); // 2 recent tasks resumed
      expect(polling.startPolling).toHaveBeenCalledTimes(2);
      expect(polling.startPolling).toHaveBeenCalledWith(
        'task-recent-1',
        'IMAGEN4',
        'ext-1'
      );
      expect(polling.startPolling).toHaveBeenCalledWith(
        'task-recent-2',
        'MIDJOURNEY',
        'ext-3'
      );
      expect(prisma.generationTask.update).toHaveBeenCalledTimes(1); // 1 old task timed out
    });

    it('should limit to 50 tasks', async () => {
      const tasks = Array.from({ length: 60 }, (_, i) => ({
        id: `task-${i}`,
        model: 'IMAGEN4',
        externalTaskId: `ext-${i}`,
        createdAt: new Date(Date.now() - 60 * 1000),
        status: 'PENDING',
      }));

      vi.mocked(prisma.generationTask.findMany).mockResolvedValue(
        tasks.slice(0, 50) as any
      );

      await resumePendingTasks();

      expect(prisma.generationTask.findMany).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    });

    it('should handle errors gracefully', async () => {
      vi.mocked(prisma.generationTask.findMany).mockRejectedValue(
        new Error('Database error')
      );

      const result = await resumePendingTasks();

      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        '[ResumePoll] Error resuming pending tasks:',
        expect.any(Error)
      );
    });

    it('should continue if startPolling throws error', async () => {
      const tasks = [
        {
          id: 'task-1',
          model: 'IMAGEN4',
          externalTaskId: 'ext-1',
          createdAt: new Date(Date.now() - 60 * 1000),
          status: 'PENDING',
        },
        {
          id: 'task-2',
          model: 'VEO3',
          externalTaskId: 'ext-2',
          createdAt: new Date(Date.now() - 60 * 1000),
          status: 'PENDING',
        },
      ];

      vi.mocked(prisma.generationTask.findMany).mockResolvedValue(tasks as any);

      // First call succeeds, second throws error
      vi.mocked(polling.startPolling)
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Polling error'));

      const result = await resumePendingTasks();

      // Both tasks attempted, even though second one failed
      expect(result).toBe(2);
      expect(polling.startPolling).toHaveBeenCalledTimes(2);
    });
  });

  describe('getPendingTaskCount', () => {
    it('should return the count of pending tasks', async () => {
      vi.mocked(prisma.generationTask.count).mockResolvedValue(5);

      const result = await getPendingTaskCount();

      expect(result).toBe(5);
      expect(prisma.generationTask.count).toHaveBeenCalledWith({
        where: { status: 'PENDING' },
      });
    });

    it('should return 0 on error', async () => {
      vi.mocked(prisma.generationTask.count).mockRejectedValue(
        new Error('Database error')
      );

      const result = await getPendingTaskCount();

      expect(result).toBe(0);
      expect(console.error).toHaveBeenCalledWith(
        '[ResumePoll] Error counting pending tasks:',
        expect.any(Error)
      );
    });
  });
});

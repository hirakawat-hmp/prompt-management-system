/**
 * Tests: queryGenerationTask Server Action
 *
 * RED phase: Write failing tests for generation task queries
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { queryGenerationTask } from './query-task';
import { prisma } from '@/lib/prisma';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    generationTask: {
      findUnique: vi.fn(),
    },
  },
}));

describe('queryGenerationTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Validation', () => {
    it('should return error if taskId is missing', async () => {
      const result = await queryGenerationTask('');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Task ID is required');
      }
    });

    it('should return error if task does not exist', async () => {
      vi.mocked(prisma.generationTask.findUnique).mockResolvedValueOnce(null);

      const result = await queryGenerationTask('nonexistent_task');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Task not found');
      }
    });
  });

  describe('Successful Queries', () => {
    it('should return pending task', async () => {
      const mockTask = {
        id: 'gen_task_123',
        promptId: 'prompt_123',
        service: 'KIE' as const,
        model: 'IMAGEN4' as const,
        externalTaskId: 'kie_task_abc',
        status: 'PENDING' as const,
        providerParams: JSON.stringify({
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: { prompt: 'Test' },
        }),
        resultJson: null,
        failCode: null,
        failMsg: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        completedAt: null,
      };

      vi.mocked(prisma.generationTask.findUnique).mockResolvedValueOnce(mockTask);

      const result = await queryGenerationTask('gen_task_123');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('gen_task_123');
        expect(result.data.status).toBe('PENDING');
        expect(result.data.externalTaskId).toBe('kie_task_abc');
        expect(result.data.resultJson).toBeNull();
        expect(result.data.completedAt).toBeNull();
      }
    });

    it('should return successful task with results', async () => {
      const mockTask = {
        id: 'gen_task_456',
        promptId: 'prompt_456',
        service: 'KIE' as const,
        model: 'VEO3' as const,
        externalTaskId: 'kie_veo3_xyz',
        status: 'SUCCESS' as const,
        providerParams: JSON.stringify({
          service: 'KIE',
          model: 'VEO3',
          prompt: 'Video prompt',
          modelVariant: 'veo3',
        }),
        resultJson: JSON.stringify({
          resultUrls: ['https://example.com/video1.mp4', 'https://example.com/video2.mp4'],
        }),
        failCode: null,
        failMsg: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        completedAt: new Date('2025-01-01T00:05:00Z'),
      };

      vi.mocked(prisma.generationTask.findUnique).mockResolvedValueOnce(mockTask);

      const result = await queryGenerationTask('gen_task_456');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('gen_task_456');
        expect(result.data.status).toBe('SUCCESS');
        expect(result.data.resultJson).toBeDefined();
        expect(result.data.completedAt).toBeDefined();

        // Verify result JSON can be parsed
        if (result.data.resultJson) {
          const parsed = JSON.parse(result.data.resultJson);
          expect(parsed.resultUrls).toHaveLength(2);
        }
      }
    });

    it('should return failed task with error details', async () => {
      const mockTask = {
        id: 'gen_task_789',
        promptId: 'prompt_789',
        service: 'KIE' as const,
        model: 'MIDJOURNEY' as const,
        externalTaskId: 'kie_mj_fail',
        status: 'FAILED' as const,
        providerParams: JSON.stringify({
          service: 'KIE',
          model: 'MIDJOURNEY',
          taskType: 'mj_txt2img',
          prompt: 'Failed prompt',
        }),
        resultJson: null,
        failCode: 'TIMEOUT',
        failMsg: 'Generation timeout after 5 minutes',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        completedAt: new Date('2025-01-01T00:05:00Z'),
      };

      vi.mocked(prisma.generationTask.findUnique).mockResolvedValueOnce(mockTask);

      const result = await queryGenerationTask('gen_task_789');

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('gen_task_789');
        expect(result.data.status).toBe('FAILED');
        expect(result.data.failCode).toBe('TIMEOUT');
        expect(result.data.failMsg).toBe('Generation timeout after 5 minutes');
        expect(result.data.resultJson).toBeNull();
      }
    });
  });

  describe('Type Conversion', () => {
    it('should convert Prisma types to frontend types correctly', async () => {
      const mockTask = {
        id: 'gen_task_123',
        promptId: 'prompt_123',
        service: 'KIE' as const,
        model: 'IMAGEN4' as const,
        externalTaskId: 'kie_task_abc',
        status: 'PENDING' as const,
        providerParams: JSON.stringify({
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: { prompt: 'Test' },
        }),
        resultJson: null,
        failCode: null,
        failMsg: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        completedAt: null,
      };

      vi.mocked(prisma.generationTask.findUnique).mockResolvedValueOnce(mockTask);

      const result = await queryGenerationTask('gen_task_123');

      expect(result.success).toBe(true);
      if (result.success) {
        // Verify all fields are present
        expect(result.data).toHaveProperty('id');
        expect(result.data).toHaveProperty('promptId');
        expect(result.data).toHaveProperty('service');
        expect(result.data).toHaveProperty('model');
        expect(result.data).toHaveProperty('externalTaskId');
        expect(result.data).toHaveProperty('status');
        expect(result.data).toHaveProperty('providerParams');
        expect(result.data).toHaveProperty('resultJson');
        expect(result.data).toHaveProperty('failCode');
        expect(result.data).toHaveProperty('failMsg');
        expect(result.data).toHaveProperty('createdAt');
        expect(result.data).toHaveProperty('completedAt');
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors', async () => {
      vi.mocked(prisma.generationTask.findUnique).mockRejectedValueOnce(
        new Error('Database connection lost')
      );

      const result = await queryGenerationTask('gen_task_123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Database connection lost');
      }
    });

    it('should handle unexpected errors', async () => {
      vi.mocked(prisma.generationTask.findUnique).mockRejectedValueOnce('Unknown error');

      const result = await queryGenerationTask('gen_task_123');

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });
  });
});

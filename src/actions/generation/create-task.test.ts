/**
 * Tests: createGenerationTask Server Action
 *
 * RED phase: Write failing tests for generation task creation
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createGenerationTask } from './create-task';
import { prisma } from '@/lib/prisma';
import type { KieImagen4Params, KieVeo3Params } from '@/types/generation';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    generationTask: {
      create: vi.fn(),
    },
    prompt: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@/lib/generation/services/kie/models/imagen4', () => ({
  createImagen4Task: vi.fn(),
}));

vi.mock('@/lib/generation/services/kie/models/veo3', () => ({
  createVeo3Task: vi.fn(),
}));

vi.mock('@/lib/generation/services/kie/models/midjourney', () => ({
  createMidjourneyTask: vi.fn(),
}));

vi.mock('@/lib/generation/services/kie/models/sora2', () => ({
  createSora2Task: vi.fn(),
}));

vi.mock('@/lib/generation/services/kie/polling', () => ({
  startPolling: vi.fn(),
}));

describe('createGenerationTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Validation', () => {
    it('should return error if promptId is missing', async () => {
      const result = await createGenerationTask({
        promptId: '',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: {
            prompt: 'Test prompt',
          },
        } as KieImagen4Params,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Prompt ID is required');
      }
    });

    it('should return error if providerParams is invalid', async () => {
      const result = await createGenerationTask({
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: {
            prompt: '', // Invalid: empty prompt
          },
        } as KieImagen4Params,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toBeDefined();
      }
    });

    it('should return error if prompt does not exist', async () => {
      vi.mocked(prisma.prompt.findUnique).mockResolvedValueOnce(null);

      const result = await createGenerationTask({
        promptId: 'nonexistent_prompt',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: {
            prompt: 'Test prompt',
          },
        } as KieImagen4Params,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Prompt not found');
      }
    });
  });

  describe('Imagen4 Task Creation', () => {
    it('should create Imagen4 task successfully', async () => {
      const { createImagen4Task } = await import(
        '@/lib/generation/services/kie/models/imagen4'
      );
      const { startPolling } = await import('@/lib/generation/services/kie/polling');

      // Mock prompt exists
      vi.mocked(prisma.prompt.findUnique).mockResolvedValueOnce({
        id: 'prompt_123',
        projectId: 'proj_123',
        type: 'IMAGE',
        content: 'Test content',
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: null,
        userFeedback: null,
        aiComment: null,
        mastraMessageId: null,
      });

      // Mock Kie.ai API response
      vi.mocked(createImagen4Task).mockResolvedValueOnce({
        taskId: 'kie_task_abc123',
      });

      // Mock Prisma create
      const mockCreatedTask = {
        id: 'gen_task_123',
        promptId: 'prompt_123',
        service: 'KIE' as const,
        model: 'IMAGEN4' as const,
        externalTaskId: 'kie_task_abc123',
        status: 'PENDING' as const,
        providerParams: JSON.stringify({
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: {
            prompt: 'Test prompt',
          },
        }),
        resultJson: null,
        failCode: null,
        failMsg: null,
        createdAt: new Date(),
        completedAt: null,
      };

      vi.mocked(prisma.generationTask.create).mockResolvedValueOnce(mockCreatedTask);

      // Mock polling (starts in background)
      vi.mocked(startPolling).mockResolvedValueOnce(undefined);

      const providerParams: KieImagen4Params = {
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: {
          prompt: 'Test prompt',
        },
      };

      const result = await createGenerationTask({
        promptId: 'prompt_123',
        providerParams,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('gen_task_123');
        expect(result.data.status).toBe('PENDING');
        expect(result.data.externalTaskId).toBe('kie_task_abc123');
      }

      // Verify create was called with correct model function
      expect(createImagen4Task).toHaveBeenCalledWith(providerParams);

      // Verify Prisma create was called
      expect(prisma.generationTask.create).toHaveBeenCalledWith({
        data: {
          promptId: 'prompt_123',
          service: 'KIE',
          model: 'IMAGEN4',
          externalTaskId: 'kie_task_abc123',
          status: 'PENDING',
          providerParams: JSON.stringify(providerParams),
        },
      });

      // Verify polling was started
      expect(startPolling).toHaveBeenCalledWith('gen_task_123', 'IMAGEN4', 'kie_task_abc123');
    });
  });

  describe('Veo3 Task Creation', () => {
    it('should create Veo3 task successfully', async () => {
      const { createVeo3Task } = await import('@/lib/generation/services/kie/models/veo3');
      const { startPolling } = await import('@/lib/generation/services/kie/polling');

      // Mock prompt exists
      vi.mocked(prisma.prompt.findUnique).mockResolvedValueOnce({
        id: 'prompt_456',
        projectId: 'proj_123',
        type: 'VIDEO',
        content: 'Test video content',
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: null,
        userFeedback: null,
        aiComment: null,
        mastraMessageId: null,
      });

      // Mock Kie.ai API response
      vi.mocked(createVeo3Task).mockResolvedValueOnce({
        taskId: 'kie_veo3_task_xyz',
      });

      // Mock Prisma create
      vi.mocked(prisma.generationTask.create).mockResolvedValueOnce({
        id: 'gen_task_456',
        promptId: 'prompt_456',
        service: 'KIE' as const,
        model: 'VEO3' as const,
        externalTaskId: 'kie_veo3_task_xyz',
        status: 'PENDING' as const,
        providerParams: JSON.stringify({
          service: 'KIE',
          model: 'VEO3',
          prompt: 'Test video prompt',
          modelVariant: 'veo3_fast',
        }),
        resultJson: null,
        failCode: null,
        failMsg: null,
        createdAt: new Date(),
        completedAt: null,
      });

      vi.mocked(startPolling).mockResolvedValueOnce(undefined);

      const providerParams: KieVeo3Params = {
        service: 'KIE',
        model: 'VEO3',
        prompt: 'Test video prompt',
        modelVariant: 'veo3_fast',
      };

      const result = await createGenerationTask({
        promptId: 'prompt_456',
        providerParams,
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBe('VEO3');
        expect(result.data.status).toBe('PENDING');
      }

      expect(createVeo3Task).toHaveBeenCalledWith(providerParams);
      expect(startPolling).toHaveBeenCalledWith('gen_task_456', 'VEO3', 'kie_veo3_task_xyz');
    });
  });

  describe('Error Handling', () => {
    it('should handle Kie.ai API errors', async () => {
      const { createImagen4Task } = await import(
        '@/lib/generation/services/kie/models/imagen4'
      );

      // Mock prompt exists
      vi.mocked(prisma.prompt.findUnique).mockResolvedValueOnce({
        id: 'prompt_123',
        projectId: 'proj_123',
        type: 'IMAGE',
        content: 'Test content',
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: null,
        userFeedback: null,
        aiComment: null,
        mastraMessageId: null,
      });

      // Mock API error
      vi.mocked(createImagen4Task).mockRejectedValueOnce(
        new Error('Payment Required (402): Insufficient credits')
      );

      const result = await createGenerationTask({
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: {
            prompt: 'Test prompt',
          },
        } as KieImagen4Params,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insufficient credits');
      }
    });

    it('should handle database errors', async () => {
      const { createImagen4Task } = await import(
        '@/lib/generation/services/kie/models/imagen4'
      );

      // Mock prompt exists
      vi.mocked(prisma.prompt.findUnique).mockResolvedValueOnce({
        id: 'prompt_123',
        projectId: 'proj_123',
        type: 'IMAGE',
        content: 'Test content',
        createdAt: new Date(),
        updatedAt: new Date(),
        parentId: null,
        userFeedback: null,
        aiComment: null,
        mastraMessageId: null,
      });

      vi.mocked(createImagen4Task).mockResolvedValueOnce({
        taskId: 'kie_task_abc123',
      });

      // Mock database error
      vi.mocked(prisma.generationTask.create).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const result = await createGenerationTask({
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: {
            prompt: 'Test prompt',
          },
        } as KieImagen4Params,
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Database connection failed');
      }
    });
  });
});

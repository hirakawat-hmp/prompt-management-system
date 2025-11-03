/**
 * Tests: Generation Task Server Actions
 *
 * RED phase: Write failing tests for createGenerationTask and uploadGenerationFile
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { createGenerationTask, uploadGenerationFile } from './generation';
import type { KieImagen4Params } from '@/types/generation';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    prompt: {
      findUnique: vi.fn(),
    },
    generationTask: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@/lib/generation/services/kie/client', () => ({
  createKieTask: vi.fn(),
}));

vi.mock('@/lib/generation/services/kie/polling', () => ({
  startPolling: vi.fn(),
}));

vi.mock('@/lib/generation/upload', () => ({
  uploadFileToKie: vi.fn(),
}));

describe('createGenerationTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Validation', () => {
    it('should return error if providerParams validation fails', async () => {
      const invalidParams = {
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: {
            prompt: '', // Empty prompt (invalid)
          },
        } as any,
      };

      const result = await createGenerationTask(invalidParams);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Validation failed');
      }
    });

    it('should return error if promptId does not exist', async () => {
      const { prisma } = await import('@/lib/prisma');

      // Mock prompt not found
      vi.mocked(prisma.prompt.findUnique).mockResolvedValueOnce(null);

      const validParams = {
        promptId: 'nonexistent_prompt',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: {
            prompt: 'A beautiful sunset',
          },
        } as KieImagen4Params,
      };

      const result = await createGenerationTask(validParams);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Prompt not found');
      }
    });
  });

  describe('Successful Task Creation', () => {
    it('should create IMAGEN4 task successfully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createKieTask } = await import('@/lib/generation/services/kie/client');
      const { startPolling } = await import('@/lib/generation/services/kie/polling');

      // Mock prompt exists
      vi.mocked(prisma.prompt.findUnique).mockResolvedValueOnce({
        id: 'prompt_123',
        projectId: 'proj_123',
        type: 'IMAGE',
        content: 'A beautiful sunset',
        userFeedback: null,
        aiComment: null,
        mastraMessageId: null,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock Kie.ai API response
      vi.mocked(createKieTask).mockResolvedValueOnce({
        taskId: 'kie_task_abc123',
      });

      // Mock database insert
      const mockTask = {
        id: 'task_xyz789',
        promptId: 'prompt_123',
        service: 'KIE' as const,
        model: 'IMAGEN4' as const,
        externalTaskId: 'kie_task_abc123',
        status: 'PENDING' as const,
        providerParams: JSON.stringify({
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: { prompt: 'A beautiful sunset' },
        }),
        resultJson: null,
        failCode: null,
        failMsg: null,
        createdAt: new Date(),
        completedAt: null,
      };
      vi.mocked(prisma.generationTask.create).mockResolvedValueOnce(mockTask);

      // Mock polling (should not await)
      vi.mocked(startPolling).mockResolvedValueOnce(undefined);

      const params = {
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: {
            prompt: 'A beautiful sunset',
          },
        } as KieImagen4Params,
      };

      const result = await createGenerationTask(params);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.id).toBe('task_xyz789');
        expect(result.data.service).toBe('KIE');
        expect(result.data.model).toBe('IMAGEN4');
        expect(result.data.externalTaskId).toBe('kie_task_abc123');
        expect(result.data.status).toBe('PENDING');
      }

      // Verify polling was started (but not awaited)
      expect(startPolling).toHaveBeenCalledWith('task_xyz789', 'IMAGEN4', 'kie_task_abc123');
    });

    it('should create VEO3 task successfully', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createKieTask } = await import('@/lib/generation/services/kie/client');
      const { startPolling } = await import('@/lib/generation/services/kie/polling');

      vi.mocked(prisma.prompt.findUnique).mockResolvedValueOnce({
        id: 'prompt_456',
        projectId: 'proj_123',
        type: 'VIDEO',
        content: 'A dog running',
        userFeedback: null,
        aiComment: null,
        mastraMessageId: null,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(createKieTask).mockResolvedValueOnce({
        taskId: 'kie_veo_task_def456',
      });

      const mockTask = {
        id: 'task_veo_123',
        promptId: 'prompt_456',
        service: 'KIE' as const,
        model: 'VEO3' as const,
        externalTaskId: 'kie_veo_task_def456',
        status: 'PENDING' as const,
        providerParams: JSON.stringify({
          service: 'KIE',
          model: 'VEO3',
          prompt: 'A dog running',
          modelVariant: 'veo3_fast',
        }),
        resultJson: null,
        failCode: null,
        failMsg: null,
        createdAt: new Date(),
        completedAt: null,
      };
      vi.mocked(prisma.generationTask.create).mockResolvedValueOnce(mockTask);

      // Mock polling (should not await)
      vi.mocked(startPolling).mockResolvedValueOnce(undefined);

      const params = {
        promptId: 'prompt_456',
        providerParams: {
          service: 'KIE',
          model: 'VEO3',
          prompt: 'A dog running',
          modelVariant: 'veo3_fast',
        } as const,
      };

      const result = await createGenerationTask(params);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.model).toBe('VEO3');
      }

      // Verify polling was started
      expect(startPolling).toHaveBeenCalledWith('task_veo_123', 'VEO3', 'kie_veo_task_def456');
    });
  });

  describe('Error Handling', () => {
    it('should handle Kie.ai API errors', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createKieTask } = await import('@/lib/generation/services/kie/client');

      vi.mocked(prisma.prompt.findUnique).mockResolvedValueOnce({
        id: 'prompt_123',
        projectId: 'proj_123',
        type: 'IMAGE',
        content: 'Test',
        userFeedback: null,
        aiComment: null,
        mastraMessageId: null,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Mock API error
      vi.mocked(createKieTask).mockRejectedValueOnce(new Error('API Error: Insufficient credits'));

      const params = {
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: { prompt: 'Test' },
        } as KieImagen4Params,
      };

      const result = await createGenerationTask(params);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insufficient credits');
      }
    });

    it('should handle database errors', async () => {
      const { prisma } = await import('@/lib/prisma');
      const { createKieTask } = await import('@/lib/generation/services/kie/client');

      vi.mocked(prisma.prompt.findUnique).mockResolvedValueOnce({
        id: 'prompt_123',
        projectId: 'proj_123',
        type: 'IMAGE',
        content: 'Test',
        userFeedback: null,
        aiComment: null,
        mastraMessageId: null,
        parentId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      vi.mocked(createKieTask).mockResolvedValueOnce({
        taskId: 'kie_task_abc',
      });

      // Mock database error
      vi.mocked(prisma.generationTask.create).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const params = {
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: { prompt: 'Test' },
        } as KieImagen4Params,
      };

      const result = await createGenerationTask(params);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Database connection failed');
      }
    });
  });
});

describe('uploadGenerationFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Validation', () => {
    it('should return error if file is missing', async () => {
      const formData = new FormData();
      // No file added

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('File is required');
      }
    });

    it('should return error if file is not a File object', async () => {
      const formData = new FormData();
      formData.append('file', 'not a file');

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid file');
      }
    });
  });

  describe('Successful Upload', () => {
    it('should upload file successfully with default upload path', async () => {
      const { uploadFileToKie } = await import('@/lib/generation/upload');

      // Mock upload response
      const mockUploadResult = {
        downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/test.jpg',
        fileName: 'test.jpg',
        fileSize: 12345,
        mimeType: 'image/jpeg',
        expiresAt: new Date('2025-01-04T00:00:00Z'),
      };

      vi.mocked(uploadFileToKie).mockResolvedValueOnce(mockUploadResult);

      // Create a test file
      const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', testFile);

      // Mock FormData.get() to return the File object properly
      // (jsdom FormData serializes Files to strings, so we need to mock this)
      const originalGet = formData.get.bind(formData);
      formData.get = vi.fn((key: string) => {
        if (key === 'file') return testFile;
        return originalGet(key);
      });

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.downloadUrl).toBe(mockUploadResult.downloadUrl);
        expect(result.data.fileName).toBe('test.jpg');
        expect(result.data.fileSize).toBe(12345);
        expect(result.data.mimeType).toBe('image/jpeg');
        expect(result.data.expiresAt).toEqual(new Date('2025-01-04T00:00:00Z'));
      }

      // Verify uploadFileToKie was called with correct arguments
      expect(uploadFileToKie).toHaveBeenCalledWith(expect.any(Object), 'user-uploads');
    });

    it('should upload file with custom upload path', async () => {
      const { uploadFileToKie } = await import('@/lib/generation/upload');

      const mockUploadResult = {
        downloadUrl: 'https://tempfile.redpandaai.co/xxx/reference-images/ref.png',
        fileName: 'ref.png',
        fileSize: 54321,
        mimeType: 'image/png',
        expiresAt: new Date('2025-01-04T00:00:00Z'),
      };

      vi.mocked(uploadFileToKie).mockResolvedValueOnce(mockUploadResult);

      const testFile = new File(['reference image'], 'ref.png', { type: 'image/png' });
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('uploadPath', 'reference-images');

      // Mock FormData.get() to return proper values
      const originalGet = formData.get.bind(formData);
      formData.get = vi.fn((key: string) => {
        if (key === 'file') return testFile;
        return originalGet(key);
      });

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.downloadUrl).toContain('reference-images');
      }

      // Verify custom path was passed
      expect(uploadFileToKie).toHaveBeenCalledWith(expect.any(Object), 'reference-images');
    });
  });

  describe('Error Handling', () => {
    it('should handle upload API errors', async () => {
      const { uploadFileToKie } = await import('@/lib/generation/upload');

      vi.mocked(uploadFileToKie).mockRejectedValueOnce(
        new Error('File upload to Kie.ai failed with status 402: Insufficient credits')
      );

      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', testFile);

      // Mock FormData.get() to return proper values
      const originalGet = formData.get.bind(formData);
      formData.get = vi.fn((key: string) => {
        if (key === 'file') return testFile;
        return originalGet(key);
      });

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insufficient credits');
      }
    });
  });
});

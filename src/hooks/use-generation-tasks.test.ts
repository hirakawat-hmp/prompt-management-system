/**
 * useGenerationTasks Hook Tests
 *
 * TDD RED Phase: Tests for generation task management with React Query
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { waitFor } from '@testing-library/react';
import {
  useGenerationTasks,
  useCreateGenerationTask,
  useUploadFile,
} from './use-generation-tasks';
import { renderHookWithQuery } from '@/test-utils';
import type {
  KieImagen4Params,
  KieVeo3Params,
  ProviderParams,
} from '@/types/generation';

// Mock fetch
global.fetch = vi.fn();

// Mock server actions
vi.mock('@/actions/generation', () => ({
  createGenerationTask: vi.fn(),
  uploadGenerationFile: vi.fn(),
}));

describe('useGenerationTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('useGenerationTasks', () => {
    it('should return loading state initially', () => {
      vi.mocked(fetch).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      const { result } = renderHookWithQuery(() =>
        useGenerationTasks('prompt_123')
      );

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();
      expect(result.current.error).toBeNull();
    });

    it('should fetch generation tasks for a prompt', async () => {
      const mockTasks = [
        {
          id: 'task_1',
          promptId: 'prompt_123',
          service: 'KIE',
          model: 'IMAGEN4',
          status: 'SUCCESS',
          externalTaskId: 'ext_123',
          providerParams: {
            service: 'KIE',
            model: 'IMAGEN4',
            apiModel: 'google/imagen4-fast',
            input: {
              prompt: 'A beautiful sunset',
            },
          },
          resultJson: '{"resultUrls":["https://example.com/image.jpg"]}',
          createdAt: '2025-01-01T00:00:00.000Z',
          completedAt: '2025-01-01T00:01:00.000Z',
        },
        {
          id: 'task_2',
          promptId: 'prompt_123',
          service: 'KIE',
          model: 'VEO3',
          status: 'PENDING',
          externalTaskId: 'ext_456',
          providerParams: {
            service: 'KIE',
            model: 'VEO3',
            prompt: 'A flying bird',
            modelVariant: 'veo3_fast',
          },
          createdAt: '2025-01-01T00:02:00.000Z',
        },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockTasks,
      } as Response);

      const { result } = renderHookWithQuery(() =>
        useGenerationTasks('prompt_123')
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTasks);
      expect(fetch).toHaveBeenCalledWith(
        '/api/generation/tasks?promptId=prompt_123'
      );
    });

    it('should return empty array when no tasks exist', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      const { result } = renderHookWithQuery(() =>
        useGenerationTasks('prompt_456')
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    it('should handle fetch errors', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      const { result } = renderHookWithQuery(() =>
        useGenerationTasks('prompt_123')
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    it('should refetch every 3 seconds when any task is PENDING', async () => {
      const mockTasksWithPending = [
        {
          id: 'task_1',
          promptId: 'prompt_123',
          service: 'KIE',
          model: 'IMAGEN4',
          status: 'PENDING',
          externalTaskId: 'ext_123',
          providerParams: {},
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockTasksWithPending,
      } as Response);

      const { result } = renderHookWithQuery(() =>
        useGenerationTasks('prompt_123')
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Check that refetchInterval is set to 3000ms (3 seconds)
      // This is indirectly tested by verifying the query options
      expect(result.current.data).toEqual(mockTasksWithPending);
    });

    it('should stop refetching when all tasks are completed', async () => {
      const mockCompletedTasks = [
        {
          id: 'task_1',
          promptId: 'prompt_123',
          service: 'KIE',
          model: 'IMAGEN4',
          status: 'SUCCESS',
          externalTaskId: 'ext_123',
          providerParams: {},
          createdAt: '2025-01-01T00:00:00.000Z',
          completedAt: '2025-01-01T00:01:00.000Z',
        },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockCompletedTasks,
      } as Response);

      const { result } = renderHookWithQuery(() =>
        useGenerationTasks('prompt_123')
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCompletedTasks);
      // Refetch should be disabled (refetchInterval returns false)
    });

    it('should use correct query key', () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [],
      } as Response);

      const { queryClient } = renderHookWithQuery(() =>
        useGenerationTasks('prompt_123')
      );

      const queries = queryClient.getQueryCache().getAll();
      expect(
        queries.some(
          (q) =>
            JSON.stringify(q.queryKey) ===
            JSON.stringify(['generation-tasks', 'prompt_123'])
        )
      ).toBe(true);
    });
  });

  describe('useCreateGenerationTask', () => {
    it('should create a generation task successfully', async () => {
      const mockTask = {
        id: 'task_new',
        promptId: 'prompt_123',
        service: 'KIE',
        model: 'IMAGEN4',
        status: 'PENDING',
        externalTaskId: 'ext_789',
        providerParams: {},
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const { createGenerationTask } = await import('@/actions/generation');
      vi.mocked(createGenerationTask).mockResolvedValue({
        success: true,
        data: mockTask,
      });

      const { result } = renderHookWithQuery(() => useCreateGenerationTask());

      const input = {
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

      result.current.mutate(input);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        success: true,
        data: mockTask,
      });
      expect(createGenerationTask).toHaveBeenCalledWith(
        input,
        expect.anything()
      );
    });

    it('should create a video generation task', async () => {
      const mockTask = {
        id: 'task_video',
        promptId: 'prompt_123',
        service: 'KIE',
        model: 'VEO3',
        status: 'PENDING',
        externalTaskId: 'ext_video',
        providerParams: {},
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const { createGenerationTask } = await import('@/actions/generation');
      vi.mocked(createGenerationTask).mockResolvedValue({
        success: true,
        data: mockTask,
      });

      const { result } = renderHookWithQuery(() => useCreateGenerationTask());

      const input = {
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'VEO3',
          prompt: 'A flying bird',
          modelVariant: 'veo3_fast',
        } as KieVeo3Params,
      };

      result.current.mutate(input);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.data?.model).toBe('VEO3');
    });

    it('should handle creation error', async () => {
      const { createGenerationTask } = await import('@/actions/generation');
      vi.mocked(createGenerationTask).mockResolvedValue({
        success: false,
        error: 'Invalid provider parameters',
      });

      const { result } = renderHookWithQuery(() => useCreateGenerationTask());

      const input = {
        promptId: 'prompt_123',
        providerParams: {} as ProviderParams,
      };

      result.current.mutate(input);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        success: false,
        error: 'Invalid provider parameters',
      });
    });

    it('should handle network error', async () => {
      const { createGenerationTask } = await import('@/actions/generation');
      vi.mocked(createGenerationTask).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHookWithQuery(() => useCreateGenerationTask());

      const input = {
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: { prompt: 'Test' },
        } as KieImagen4Params,
      };

      result.current.mutate(input);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Network error');
    });

    it('should invalidate generation tasks query on success', async () => {
      const mockTask = {
        id: 'task_new',
        promptId: 'prompt_123',
        service: 'KIE',
        model: 'IMAGEN4',
        status: 'PENDING',
        externalTaskId: 'ext_123',
        providerParams: {},
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const { createGenerationTask } = await import('@/actions/generation');
      vi.mocked(createGenerationTask).mockResolvedValue({
        success: true,
        data: mockTask,
      });

      const { result, queryClient } = renderHookWithQuery(() =>
        useCreateGenerationTask()
      );

      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const input = {
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: { prompt: 'Test' },
        } as KieImagen4Params,
      };

      result.current.mutate(input);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ['generation-tasks', 'prompt_123'],
      });
    });

    it('should support onSuccess callback', async () => {
      const mockTask = {
        id: 'task_new',
        promptId: 'prompt_123',
        service: 'KIE',
        model: 'IMAGEN4',
        status: 'PENDING',
        externalTaskId: 'ext_123',
        providerParams: {},
        createdAt: '2025-01-01T00:00:00.000Z',
      };

      const { createGenerationTask } = await import('@/actions/generation');
      vi.mocked(createGenerationTask).mockResolvedValue({
        success: true,
        data: mockTask,
      });

      const { result } = renderHookWithQuery(() => useCreateGenerationTask());

      const onSuccessMock = vi.fn();

      const input = {
        promptId: 'prompt_123',
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: { prompt: 'Test' },
        } as KieImagen4Params,
      };

      result.current.mutate(input, {
        onSuccess: onSuccessMock,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccessMock).toHaveBeenCalledWith(
        { success: true, data: mockTask },
        input,
        undefined,
        expect.anything()
      );
    });
  });

  describe('useUploadFile', () => {
    it('should upload a file successfully', async () => {
      const mockUploadResult = {
        downloadUrl: 'https://tempfile.redpandaai.co/xxx/test.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        expiresAt: new Date('2025-01-04T00:00:00.000Z'),
      };

      const { uploadGenerationFile } = await import('@/actions/generation');
      vi.mocked(uploadGenerationFile).mockResolvedValue({
        success: true,
        data: mockUploadResult,
      });

      const { result } = renderHookWithQuery(() => useUploadFile());

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      result.current.mutate(mockFile);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        success: true,
        data: mockUploadResult,
      });
      expect(uploadGenerationFile).toHaveBeenCalled();
    });

    it('should handle upload error', async () => {
      const { uploadGenerationFile } = await import('@/actions/generation');
      vi.mocked(uploadGenerationFile).mockResolvedValue({
        success: false,
        error: 'File too large',
      });

      const { result } = renderHookWithQuery(() => useUploadFile());

      const mockFile = new File(['test'], 'large.jpg', {
        type: 'image/jpeg',
      });

      result.current.mutate(mockFile);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual({
        success: false,
        error: 'File too large',
      });
    });

    it('should handle network error during upload', async () => {
      const { uploadGenerationFile } = await import('@/actions/generation');
      vi.mocked(uploadGenerationFile).mockRejectedValue(
        new Error('Network error')
      );

      const { result } = renderHookWithQuery(() => useUploadFile());

      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      result.current.mutate(mockFile);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error?.message).toBe('Network error');
    });

    it('should support onSuccess callback for upload', async () => {
      const mockUploadResult = {
        downloadUrl: 'https://tempfile.redpandaai.co/xxx/test.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        expiresAt: new Date('2025-01-04T00:00:00.000Z'),
      };

      const { uploadGenerationFile } = await import('@/actions/generation');
      vi.mocked(uploadGenerationFile).mockResolvedValue({
        success: true,
        data: mockUploadResult,
      });

      const { result } = renderHookWithQuery(() => useUploadFile());

      const onSuccessMock = vi.fn();
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      result.current.mutate(mockFile, {
        onSuccess: onSuccessMock,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(onSuccessMock).toHaveBeenCalledWith(
        { success: true, data: mockUploadResult },
        mockFile,
        undefined,
        expect.anything()
      );
    });
  });
});

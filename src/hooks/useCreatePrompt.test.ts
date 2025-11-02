/**
 * Tests for useCreatePrompt hook
 *
 * Tests creating prompts with React Query mutations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useCreatePrompt } from './useCreatePrompt';
import { renderHookWithQuery } from '@/test-utils';
import * as promptActions from '@/actions/prompts';
import type { CreatePromptInput } from '@/actions/prompts';
import type { Prompt } from '@/types/prompt';

// Mock the server actions module
vi.mock('@/actions/prompts', () => ({
  createPrompt: vi.fn(),
}));

describe('useCreatePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should create a prompt successfully', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_new',
      type: 'image',
      content: 'A new prompt',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      assets: [],
    };

    vi.mocked(promptActions.createPrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useCreatePrompt());

    const input: CreatePromptInput = {
      projectId: 'proj_123',
      type: 'image',
      content: 'A new prompt',
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      success: true,
      data: mockPrompt,
    });
    expect(promptActions.createPrompt).toHaveBeenCalledWith(
      input,
      expect.anything()
    );
    expect(promptActions.createPrompt).toHaveBeenCalledTimes(1);
  });

  it('should create a video prompt', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_video',
      type: 'video',
      content: 'A video prompt',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      assets: [],
    };

    vi.mocked(promptActions.createPrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useCreatePrompt());

    const input: CreatePromptInput = {
      projectId: 'proj_123',
      type: 'video',
      content: 'A video prompt',
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data?.type).toBe('video');
  });

  it('should create a prompt with parent relationship', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_child',
      type: 'image',
      content: 'Child prompt',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      parent: {
        id: 'prompt_parent',
        content: 'Parent prompt',
      },
      assets: [],
    };

    vi.mocked(promptActions.createPrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useCreatePrompt());

    const input: CreatePromptInput = {
      projectId: 'proj_123',
      type: 'image',
      content: 'Child prompt',
      parentId: 'prompt_parent',
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data?.parent).toBeDefined();
    expect(result.current.data?.data?.parent?.id).toBe('prompt_parent');
  });

  it('should create a prompt with mastraMessageId', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_mastra',
      type: 'image',
      content: 'Prompt with Mastra ID',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      assets: [],
    };

    vi.mocked(promptActions.createPrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useCreatePrompt());

    const input: CreatePromptInput = {
      projectId: 'proj_123',
      type: 'image',
      content: 'Prompt with Mastra ID',
      mastraMessageId: 'msg_123',
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(promptActions.createPrompt).toHaveBeenCalledWith(
      expect.objectContaining({
        mastraMessageId: 'msg_123',
      }),
      expect.anything()
    );
  });

  it('should handle creation error', async () => {
    vi.mocked(promptActions.createPrompt).mockResolvedValue({
      success: false,
      error: 'Prompt content is required',
    });

    const { result } = renderHookWithQuery(() => useCreatePrompt());

    const input: CreatePromptInput = {
      projectId: 'proj_123',
      type: 'image',
      content: '',
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Server action returns error in data
    expect(result.current.data).toEqual({
      success: false,
      error: 'Prompt content is required',
    });
  });

  it('should handle network error', async () => {
    vi.mocked(promptActions.createPrompt).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHookWithQuery(() => useCreatePrompt());

    const input: CreatePromptInput = {
      projectId: 'proj_123',
      type: 'image',
      content: 'Test prompt',
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Network error');
  });

  it('should invalidate prompts queries on success', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_new',
      type: 'image',
      content: 'A new prompt',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      assets: [],
    };

    vi.mocked(promptActions.createPrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result, queryClient } = renderHookWithQuery(() =>
      useCreatePrompt()
    );

    // Spy on invalidateQueries
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const input: CreatePromptInput = {
      projectId: 'proj_123',
      type: 'image',
      content: 'A new prompt',
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should invalidate all prompts queries
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['prompts'],
    });
  });

  it('should support onSuccess callback', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_new',
      type: 'image',
      content: 'A new prompt',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      assets: [],
    };

    vi.mocked(promptActions.createPrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useCreatePrompt());

    const onSuccessMock = vi.fn();

    const input: CreatePromptInput = {
      projectId: 'proj_123',
      type: 'image',
      content: 'A new prompt',
    };

    result.current.mutate(input, {
      onSuccess: onSuccessMock,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(onSuccessMock).toHaveBeenCalledWith(
      { success: true, data: mockPrompt },
      input,
      undefined,
      expect.anything()
    );
  });

  it('should support onError callback', async () => {
    vi.mocked(promptActions.createPrompt).mockRejectedValue(
      new Error('Server error')
    );

    const { result } = renderHookWithQuery(() => useCreatePrompt());

    const onErrorMock = vi.fn();

    const input: CreatePromptInput = {
      projectId: 'proj_123',
      type: 'image',
      content: 'Test prompt',
    };

    result.current.mutate(input, {
      onError: onErrorMock,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Server error' }),
      input,
      undefined,
      expect.anything()
    );
  });

  it('should reset mutation state', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_new',
      type: 'image',
      content: 'A new prompt',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
      assets: [],
    };

    vi.mocked(promptActions.createPrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useCreatePrompt());

    const input: CreatePromptInput = {
      projectId: 'proj_123',
      type: 'image',
      content: 'A new prompt',
    };

    result.current.mutate(input);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toBeDefined();

    // Reset the mutation
    result.current.reset();

    await waitFor(() => {
      expect(result.current.data).toBeUndefined();
      expect(result.current.isSuccess).toBe(false);
      expect(result.current.isError).toBe(false);
    });
  });
});

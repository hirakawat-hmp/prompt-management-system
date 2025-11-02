/**
 * Tests for useUpdatePrompt hook
 *
 * Tests updating prompts with React Query mutations.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useUpdatePrompt } from './useUpdatePrompt';
import { renderHookWithQuery } from '@/test-utils';
import * as promptActions from '@/actions/prompts';
import type { UpdatePromptInput } from '@/actions/prompts';
import type { Prompt } from '@/types/prompt';

// Mock the server actions module
vi.mock('@/actions/prompts', () => ({
  updatePrompt: vi.fn(),
}));

describe('useUpdatePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should update user feedback successfully', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_1',
      type: 'image',
      content: 'A sunset',
      userFeedback: 'Too bright',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      assets: [],
    };

    vi.mocked(promptActions.updatePrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useUpdatePrompt());

    const input: UpdatePromptInput = {
      userFeedback: 'Too bright',
    };

    result.current.mutate({ promptId: 'prompt_1', data: input });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      success: true,
      data: mockPrompt,
    });
    expect(promptActions.updatePrompt).toHaveBeenCalledWith(
      'prompt_1',
      input
    );
    expect(promptActions.updatePrompt).toHaveBeenCalledTimes(1);
  });

  it('should update AI comment successfully', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_2',
      type: 'image',
      content: 'A sunset',
      aiComment: 'Adjusting brightness',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      assets: [],
    };

    vi.mocked(promptActions.updatePrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useUpdatePrompt());

    const input: UpdatePromptInput = {
      aiComment: 'Adjusting brightness',
    };

    result.current.mutate({ promptId: 'prompt_2', data: input });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data?.aiComment).toBe('Adjusting brightness');
  });

  it('should update both feedback and comment', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_3',
      type: 'video',
      content: 'A flowing river',
      userFeedback: 'Too fast',
      aiComment: 'Slowing down animation',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      assets: [],
    };

    vi.mocked(promptActions.updatePrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useUpdatePrompt());

    const input: UpdatePromptInput = {
      userFeedback: 'Too fast',
      aiComment: 'Slowing down animation',
    };

    result.current.mutate({ promptId: 'prompt_3', data: input });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data?.userFeedback).toBe('Too fast');
    expect(result.current.data?.data?.aiComment).toBe('Slowing down animation');
  });

  it('should handle update error', async () => {
    vi.mocked(promptActions.updatePrompt).mockResolvedValue({
      success: false,
      error: 'No fields to update',
    });

    const { result } = renderHookWithQuery(() => useUpdatePrompt());

    result.current.mutate({ promptId: 'prompt_1', data: {} });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Server action returns error in data
    expect(result.current.data).toEqual({
      success: false,
      error: 'No fields to update',
    });
  });

  it('should handle network error', async () => {
    vi.mocked(promptActions.updatePrompt).mockRejectedValue(
      new Error('Network error')
    );

    const { result } = renderHookWithQuery(() => useUpdatePrompt());

    result.current.mutate({
      promptId: 'prompt_1',
      data: { userFeedback: 'Test' },
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toBe('Network error');
  });

  it('should invalidate prompts queries on success', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_1',
      type: 'image',
      content: 'A sunset',
      userFeedback: 'Updated',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      assets: [],
    };

    vi.mocked(promptActions.updatePrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result, queryClient } = renderHookWithQuery(() =>
      useUpdatePrompt()
    );

    // Spy on invalidateQueries
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate({
      promptId: 'prompt_1',
      data: { userFeedback: 'Updated' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should invalidate all prompts queries
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['prompts'],
    });
  });

  it('should support onSuccess callback', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_1',
      type: 'image',
      content: 'A sunset',
      userFeedback: 'Updated',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      assets: [],
    };

    vi.mocked(promptActions.updatePrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useUpdatePrompt());

    const onSuccessMock = vi.fn();

    const variables = {
      promptId: 'prompt_1',
      data: { userFeedback: 'Updated' },
    };

    result.current.mutate(variables, {
      onSuccess: onSuccessMock,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(onSuccessMock).toHaveBeenCalledWith(
      { success: true, data: mockPrompt },
      variables,
      undefined,
      expect.anything()
    );
  });

  it('should support onError callback', async () => {
    vi.mocked(promptActions.updatePrompt).mockRejectedValue(
      new Error('Server error')
    );

    const { result } = renderHookWithQuery(() => useUpdatePrompt());

    const onErrorMock = vi.fn();

    const variables = {
      promptId: 'prompt_1',
      data: { userFeedback: 'Test' },
    };

    result.current.mutate(variables, {
      onError: onErrorMock,
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(onErrorMock).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Server error' }),
      variables,
      undefined,
      expect.anything()
    );
  });

  it('should clear empty feedback', async () => {
    const mockPrompt: Prompt = {
      id: 'prompt_1',
      type: 'image',
      content: 'A sunset',
      userFeedback: undefined,
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-02'),
      assets: [],
    };

    vi.mocked(promptActions.updatePrompt).mockResolvedValue({
      success: true,
      data: mockPrompt,
    });

    const { result } = renderHookWithQuery(() => useUpdatePrompt());

    result.current.mutate({
      promptId: 'prompt_1',
      data: { userFeedback: '' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(promptActions.updatePrompt).toHaveBeenCalledWith(
      'prompt_1',
      { userFeedback: '' }
    );
  });

  it('should handle prompt not found error', async () => {
    vi.mocked(promptActions.updatePrompt).mockResolvedValue({
      success: false,
      error: 'Prompt not found',
    });

    const { result } = renderHookWithQuery(() => useUpdatePrompt());

    result.current.mutate({
      promptId: 'nonexistent',
      data: { userFeedback: 'Test' },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      success: false,
      error: 'Prompt not found',
    });
  });
});

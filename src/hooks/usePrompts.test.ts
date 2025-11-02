/**
 * Tests for usePrompts hook
 *
 * Tests fetching prompts by project ID with React Query.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { usePrompts } from './usePrompts';
import { renderHookWithQuery } from '@/test-utils';
import type { Prompt } from '@/types/prompt';

// Mock global fetch
global.fetch = vi.fn();

describe('usePrompts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should fetch prompts for a project successfully', async () => {
    const mockPrompts: Prompt[] = [
      {
        id: 'prompt_1',
        type: 'image',
        content: 'A beautiful sunset',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        assets: [],
      },
      {
        id: 'prompt_2',
        type: 'video',
        content: 'A flowing river',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
        assets: [],
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockPrompts,
    } as Response);

    const { result } = renderHookWithQuery(() => usePrompts('proj_123'));

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for success
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPrompts);
    expect(result.current.isLoading).toBe(false);
    expect(fetch).toHaveBeenCalledWith('/api/prompts?projectId=proj_123');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('should handle empty prompts array', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    const { result } = renderHookWithQuery(() => usePrompts('proj_empty'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual([]);
    expect(result.current.data?.length).toBe(0);
  });

  it('should handle fetch error', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 500,
    } as Response);

    const { result } = renderHookWithQuery(() => usePrompts('proj_error'));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeDefined();
    expect(result.current.error?.message).toContain('Failed to fetch prompts');
  });

  it('should handle network error', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const { result } = renderHookWithQuery(() => usePrompts('proj_network'));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
    expect(result.current.error?.message).toBe('Network error');
  });

  it('should not fetch if projectId is empty', () => {
    const { result } = renderHookWithQuery(() => usePrompts(''));

    // Query should be disabled
    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('should use correct query key', () => {
    const { result, queryClient } = renderHookWithQuery(() =>
      usePrompts('proj_123')
    );

    // Query key should match queryKeys.prompts.byProject format
    const queries = queryClient.getQueryCache().getAll();
    expect(queries.length).toBe(1);
    expect(queries[0].queryKey).toEqual(['prompts', 'proj_123']);
  });

  it('should fetch prompts with assets', async () => {
    const mockPromptsWithAssets: Prompt[] = [
      {
        id: 'prompt_1',
        type: 'image',
        content: 'Sunset with assets',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-01'),
        assets: [
          {
            id: 'asset_1',
            type: 'image',
            url: 'https://example.com/image.jpg',
            createdAt: new Date('2025-01-01'),
          },
        ],
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockPromptsWithAssets,
    } as Response);

    const { result } = renderHookWithQuery(() => usePrompts('proj_assets'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockPromptsWithAssets);
    expect(result.current.data?.[0].assets).toHaveLength(1);
    expect(result.current.data?.[0].assets[0].url).toBe(
      'https://example.com/image.jpg'
    );
  });

  it('should fetch prompts with parent relationship', async () => {
    const mockPromptsWithParent: Prompt[] = [
      {
        id: 'prompt_child',
        type: 'image',
        content: 'Child prompt',
        createdAt: new Date('2025-01-02'),
        updatedAt: new Date('2025-01-02'),
        parent: {
          id: 'prompt_parent',
          content: 'Parent prompt',
        },
        assets: [],
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockPromptsWithParent,
    } as Response);

    const { result } = renderHookWithQuery(() => usePrompts('proj_parent'));

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.[0].parent).toBeDefined();
    expect(result.current.data?.[0].parent?.id).toBe('prompt_parent');
    expect(result.current.data?.[0].parent?.content).toBe('Parent prompt');
  });

  it('should handle missing projectId query parameter', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Missing required parameter: projectId' }),
    } as Response);

    const { result } = renderHookWithQuery(() => usePrompts('proj_missing'));

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error?.message).toContain('Failed to fetch prompts');
  });
});

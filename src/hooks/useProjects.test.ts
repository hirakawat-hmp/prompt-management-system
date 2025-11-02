/**
 * useProjects Hook Tests
 *
 * TDD RED Phase: Tests for fetching projects with React Query
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { useProjects } from './useProjects';
import { renderHookWithQuery } from '@/test-utils';

// Mock fetch
global.fetch = vi.fn();

describe('useProjects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return loading state initially', () => {
    vi.mocked(fetch).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHookWithQuery(() => useProjects());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeNull();
  });

  it('should fetch and return projects', async () => {
    const mockProjects = [
      {
        id: 'proj_1',
        name: 'Project 1',
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z',
      },
      {
        id: 'proj_2',
        name: 'Project 2',
        createdAt: '2025-01-03T00:00:00.000Z',
        updatedAt: '2025-01-04T00:00:00.000Z',
      },
    ];

    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => mockProjects,
    } as Response);

    const { result } = renderHookWithQuery(() => useProjects());

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockProjects);
    expect(result.current.error).toBeNull();
    expect(fetch).toHaveBeenCalledWith('/api/projects');
  });

  it('should handle empty projects list', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    const { result } = renderHookWithQuery(() => useProjects());

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

    const { result } = renderHookWithQuery(() => useProjects());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.data).toBeUndefined();
  });

  it('should handle network errors', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

    const { result } = renderHookWithQuery(() => useProjects());

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should use correct query key', () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => [],
    } as Response);

    const { result, queryClient } = renderHookWithQuery(() => useProjects());

    // Check that the query is registered with correct key
    const queries = queryClient.getQueryCache().getAll();
    expect(queries.some((q) => JSON.stringify(q.queryKey) === JSON.stringify(['projects']))).toBe(true);
  });
});

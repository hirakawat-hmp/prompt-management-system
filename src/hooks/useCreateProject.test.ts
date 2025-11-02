/**
 * Tests for useCreateProject Hook
 *
 * Tests mutation behavior for creating projects with Mastra integration.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { waitFor } from '@testing-library/react';
import { renderHookWithQuery } from '@/test-utils';

// Mock must be hoisted before imports
vi.mock('@/actions/projects', () => ({
  createProject: vi.fn(),
}));

import { useCreateProject } from './useCreateProject';
import * as projectActions from '@/actions/projects';

describe('useCreateProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create project successfully', async () => {
    const mockProject = {
      id: 'proj_abc123',
      name: 'New Project',
      createdAt: new Date('2025-01-01'),
      updatedAt: new Date('2025-01-01'),
    };

    vi.mocked(projectActions.createProject).mockResolvedValue({
      success: true,
      data: mockProject,
    });

    const { result } = renderHookWithQuery(() => useCreateProject());

    expect(result.current.isPending).toBe(false);
    expect(result.current.isSuccess).toBe(false);

    result.current.mutate('New Project');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      success: true,
      data: mockProject,
    });
    expect(projectActions.createProject).toHaveBeenCalledWith(
      'New Project',
      expect.any(Object) // React Query passes context as second argument
    );
    expect(projectActions.createProject).toHaveBeenCalledTimes(1);
  });

  it('should handle validation error for empty name', async () => {
    vi.mocked(projectActions.createProject).mockResolvedValue({
      success: false,
      error: 'Project name is required',
    });

    const { result } = renderHookWithQuery(() => useCreateProject());

    result.current.mutate('');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Server action returns ActionResult, not throwing error
    expect(result.current.data).toEqual({
      success: false,
      error: 'Project name is required',
    });
  });

  it('should handle validation error for name too long', async () => {
    const longName = 'a'.repeat(256);

    vi.mocked(projectActions.createProject).mockResolvedValue({
      success: false,
      error: 'Project name must be less than 255 characters',
    });

    const { result } = renderHookWithQuery(() => useCreateProject());

    result.current.mutate(longName);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      success: false,
      error: 'Project name must be less than 255 characters',
    });
  });

  it('should invalidate projects query on successful creation', async () => {
    const mockProject = {
      id: 'proj_xyz789',
      name: 'Another Project',
      createdAt: new Date('2025-01-02'),
      updatedAt: new Date('2025-01-02'),
    };

    vi.mocked(projectActions.createProject).mockResolvedValue({
      success: true,
      data: mockProject,
    });

    const { result, queryClient } = renderHookWithQuery(() =>
      useCreateProject()
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate('Another Project');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['projects'],
    });
  });

  it('should not invalidate queries on validation failure', async () => {
    vi.mocked(projectActions.createProject).mockResolvedValue({
      success: false,
      error: 'Project name is required',
    });

    const { result, queryClient } = renderHookWithQuery(() =>
      useCreateProject()
    );

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    result.current.mutate('');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Should not invalidate on validation failure
    expect(invalidateSpy).not.toHaveBeenCalled();
  });

  it('should handle Mastra/Prisma errors', async () => {
    vi.mocked(projectActions.createProject).mockResolvedValue({
      success: false,
      error: 'Failed to create Mastra thread',
    });

    const { result } = renderHookWithQuery(() => useCreateProject());

    result.current.mutate('Valid Project Name');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual({
      success: false,
      error: 'Failed to create Mastra thread',
    });
  });

  it('should track loading state during mutation', async () => {
    const mockProject = {
      id: 'proj_loading',
      name: 'Loading Test',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(projectActions.createProject).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ success: true, data: mockProject });
          }, 100);
        })
    );

    const { result } = renderHookWithQuery(() => useCreateProject());

    expect(result.current.isPending).toBe(false);

    result.current.mutate('Loading Test');

    // Should be pending immediately after mutation
    await waitFor(() => expect(result.current.isPending).toBe(true));

    // Should complete eventually
    await waitFor(
      () => {
        expect(result.current.isPending).toBe(false);
        expect(result.current.isSuccess).toBe(true);
      },
      { timeout: 200 }
    );
  });

  it('should allow multiple sequential mutations', async () => {
    const mockProject1 = {
      id: 'proj_1',
      name: 'Project 1',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockProject2 = {
      id: 'proj_2',
      name: 'Project 2',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    vi.mocked(projectActions.createProject)
      .mockResolvedValueOnce({ success: true, data: mockProject1 })
      .mockResolvedValueOnce({ success: true, data: mockProject2 });

    const { result } = renderHookWithQuery(() => useCreateProject());

    // First mutation
    result.current.mutate('Project 1');
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data?.id).toBe('proj_1');

    // Second mutation
    result.current.mutate('Project 2');
    await waitFor(() =>
      expect(result.current.data?.data?.id).toBe('proj_2')
    );
    expect(result.current.isSuccess).toBe(true);
  });
});

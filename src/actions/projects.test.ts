/**
 * Server Actions Tests: Project Mutations
 *
 * TDD RED Phase: Tests for creating and updating projects
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createProject, updateProject } from './projects';
import { prisma } from '@/lib/prisma';
import { mastra } from '@/mastra';

// Mock dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('@/mastra', () => ({
  mastra: {
    memory: {
      createThread: vi.fn(),
    },
  },
}));

describe('createProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new project with Mastra thread', async () => {
    const mockProject = {
      id: 'proj_123',
      name: 'New Project',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    };

    vi.mocked(prisma.project.create).mockResolvedValue(mockProject);
    vi.mocked(mastra.memory.createThread).mockResolvedValue({
      threadId: 'proj_123',
    } as any);

    const result = await createProject('New Project');

    expect(result.success).toBe(true);
    expect(result.data?.name).toBe('New Project');

    // Verify Mastra thread creation was called (threadId is dynamically generated)
    expect(mastra.memory.createThread).toHaveBeenCalledWith(
      expect.objectContaining({
        resourceid: 'default',
      })
    );

    // Verify threadId matches the generated project ID
    const createThreadCall = vi.mocked(mastra.memory.createThread).mock.calls[0][0];
    const createProjectCall = vi.mocked(prisma.project.create).mock.calls[0][0];
    expect(createThreadCall.threadId).toBe(createProjectCall.data.id);

    // Verify Prisma project creation was called with proper name
    expect(prisma.project.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          name: 'New Project',
        }),
      })
    );
  });

  it('should return error when name is empty', async () => {
    const result = await createProject('');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Project name is required');
    expect(prisma.project.create).not.toHaveBeenCalled();
    expect(mastra.memory.createThread).not.toHaveBeenCalled();
  });

  it('should return error when name is too long', async () => {
    const longName = 'a'.repeat(256);
    const result = await createProject(longName);

    expect(result.success).toBe(false);
    expect(result.error).toBe('Project name must be less than 255 characters');
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('should handle Mastra thread creation errors', async () => {
    vi.mocked(mastra.memory.createThread).mockRejectedValue(
      new Error('Mastra connection failed')
    );

    const result = await createProject('New Project');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Mastra connection failed');
    expect(prisma.project.create).not.toHaveBeenCalled();
  });

  it('should rollback Mastra thread if Prisma creation fails', async () => {
    vi.mocked(mastra.memory.createThread).mockResolvedValue({
      threadId: 'proj_123',
    } as any);
    vi.mocked(prisma.project.create).mockRejectedValue(
      new Error('Database constraint violation')
    );

    const result = await createProject('New Project');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Database constraint violation');
  });
});

describe('updateProject', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update project name', async () => {
    const mockUpdatedProject = {
      id: 'proj_123',
      name: 'Updated Project',
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-02T00:00:00Z'),
    };

    vi.mocked(prisma.project.update).mockResolvedValue(mockUpdatedProject);

    const result = await updateProject('proj_123', 'Updated Project');

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      id: 'proj_123',
      name: 'Updated Project',
      createdAt: mockUpdatedProject.createdAt,
      updatedAt: mockUpdatedProject.updatedAt,
    });

    expect(prisma.project.update).toHaveBeenCalledWith({
      where: { id: 'proj_123' },
      data: { name: 'Updated Project' },
    });
  });

  it('should return error when name is empty', async () => {
    const result = await updateProject('proj_123', '');

    expect(result.success).toBe(false);
    expect(result.error).toBe('Project name is required');
    expect(prisma.project.update).not.toHaveBeenCalled();
  });

  it('should handle project not found error', async () => {
    vi.mocked(prisma.project.update).mockRejectedValue(
      new Error('Record to update not found')
    );

    const result = await updateProject('invalid_id', 'New Name');

    expect(result.success).toBe(false);
    expect(result.error).toContain('Record to update not found');
  });
});

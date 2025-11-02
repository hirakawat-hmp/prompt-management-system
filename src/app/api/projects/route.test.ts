/**
 * API Route Tests: GET /api/projects
 *
 * TDD RED Phase: Tests for fetching all projects
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    project: {
      findMany: vi.fn(),
    },
  },
}));

describe('GET /api/projects', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no projects exist', async () => {
    vi.mocked(prisma.project.findMany).mockResolvedValue([]);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
    expect(prisma.project.findMany).toHaveBeenCalledWith({
      orderBy: { updatedAt: 'desc' },
    });
  });

  it('should return all projects with frontend types', async () => {
    const mockPrismaProjects = [
      {
        id: 'proj_1',
        name: 'Project 1',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
      },
      {
        id: 'proj_2',
        name: 'Project 2',
        createdAt: new Date('2025-01-03T00:00:00Z'),
        updatedAt: new Date('2025-01-04T00:00:00Z'),
      },
    ];

    vi.mocked(prisma.project.findMany).mockResolvedValue(mockPrismaProjects);

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(2);
    expect(data[0]).toEqual({
      id: 'proj_1',
      name: 'Project 1',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
    });
    expect(data[1]).toEqual({
      id: 'proj_2',
      name: 'Project 2',
      createdAt: '2025-01-03T00:00:00.000Z',
      updatedAt: '2025-01-04T00:00:00.000Z',
    });
  });

  it('should order projects by updatedAt descending', async () => {
    vi.mocked(prisma.project.findMany).mockResolvedValue([]);

    await GET();

    expect(prisma.project.findMany).toHaveBeenCalledWith({
      orderBy: { updatedAt: 'desc' },
    });
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(prisma.project.findMany).mockRejectedValue(
      new Error('Database connection failed')
    );

    const response = await GET();
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch projects',
      message: 'Database connection failed',
    });
  });
});

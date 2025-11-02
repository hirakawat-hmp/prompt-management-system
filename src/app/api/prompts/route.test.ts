/**
 * API Route Tests: GET /api/prompts
 *
 * TDD RED Phase: Tests for fetching prompts by projectId
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from './route';
import { prisma } from '@/lib/prisma';
import type { PromptType, AssetType, AssetProvider } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    prompt: {
      findMany: vi.fn(),
    },
  },
}));

describe('GET /api/prompts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return 400 when projectId is missing', async () => {
    const request = {
      nextUrl: {
        searchParams: new URLSearchParams(''),
      },
    } as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Missing required parameter: projectId',
    });
  });

  it('should return empty array when no prompts exist for project', async () => {
    vi.mocked(prisma.prompt.findMany).mockResolvedValue([]);

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams('projectId=proj_123'),
      },
    } as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual([]);
    expect(prisma.prompt.findMany).toHaveBeenCalledWith({
      where: { projectId: 'proj_123' },
      include: { assets: true },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('should return prompts with converted types and assets', async () => {
    const mockPrismaPrompts = [
      {
        id: 'prompt_1',
        projectId: 'proj_123',
        type: 'IMAGE' as PromptType,
        content: 'A beautiful sunset',
        userFeedback: null,
        aiComment: null,
        mastraMessageId: 'msg_1',
        parentId: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
        assets: [
          {
            id: 'asset_1',
            promptId: 'prompt_1',
            type: 'IMAGE' as AssetType,
            url: 'https://example.com/image.jpg',
            provider: 'MIDJOURNEY' as AssetProvider,
            width: 1920,
            height: 1080,
            duration: null,
            fileSize: 2048000,
            mimeType: 'image/jpeg',
            createdAt: new Date('2025-01-01T00:00:00Z'),
          },
        ],
      },
    ];

    vi.mocked(prisma.prompt.findMany).mockResolvedValue(mockPrismaPrompts as any);

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams('projectId=proj_123'),
      },
    } as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveLength(1);
    expect(data[0]).toEqual({
      id: 'prompt_1',
      projectId: 'proj_123',
      type: 'image', // Converted to lowercase
      content: 'A beautiful sunset',
      userFeedback: undefined,
      aiComment: undefined,
      mastraMessageId: 'msg_1',
      parentId: undefined,
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-02T00:00:00.000Z',
      assets: [
        {
          id: 'asset_1',
          promptId: 'prompt_1',
          type: 'image', // Converted to lowercase
          url: 'https://example.com/image.jpg',
          provider: 'midjourney', // Converted to lowercase
          metadata: {
            width: 1920,
            height: 1080,
            fileSize: 2048000,
            mimeType: 'image/jpeg',
          },
          createdAt: '2025-01-01T00:00:00.000Z',
        },
      ],
    });
  });

  it('should handle prompts with feedback and parent', async () => {
    const mockPrismaPrompts = [
      {
        id: 'prompt_2',
        projectId: 'proj_123',
        type: 'VIDEO' as PromptType,
        content: 'Dynamic animation',
        userFeedback: 'Too fast',
        aiComment: 'Adjusting speed',
        mastraMessageId: 'msg_2',
        parentId: 'prompt_1',
        createdAt: new Date('2025-01-03T00:00:00Z'),
        updatedAt: new Date('2025-01-04T00:00:00Z'),
        assets: [],
      },
    ];

    vi.mocked(prisma.prompt.findMany).mockResolvedValue(mockPrismaPrompts as any);

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams('projectId=proj_123'),
      },
    } as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data[0]).toMatchObject({
      id: 'prompt_2',
      type: 'video',
      userFeedback: 'Too fast',
      aiComment: 'Adjusting speed',
      parentId: 'prompt_1',
      assets: [],
    });
  });

  it('should order prompts by createdAt ascending', async () => {
    vi.mocked(prisma.prompt.findMany).mockResolvedValue([]);

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams('projectId=proj_123'),
      },
    } as any;
    await GET(request);

    expect(prisma.prompt.findMany).toHaveBeenCalledWith({
      where: { projectId: 'proj_123' },
      include: { assets: true },
      orderBy: { createdAt: 'asc' },
    });
  });

  it('should handle database errors gracefully', async () => {
    vi.mocked(prisma.prompt.findMany).mockRejectedValue(
      new Error('Database query failed')
    );

    const request = {
      nextUrl: {
        searchParams: new URLSearchParams('projectId=proj_123'),
      },
    } as any;
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({
      error: 'Failed to fetch prompts',
      message: 'Database query failed',
    });
  });
});

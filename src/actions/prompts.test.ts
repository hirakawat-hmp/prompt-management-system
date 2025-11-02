/**
 * Server Actions Tests: Prompt Mutations
 *
 * TDD RED Phase: Tests for creating and updating prompts
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createPrompt, updatePrompt } from './prompts';
import { prisma } from '@/lib/prisma';
import type { PromptType } from '@prisma/client';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    prompt: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('createPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create a new prompt without assets', async () => {
    const mockPrompt = {
      id: 'prompt_123',
      projectId: 'proj_123',
      type: 'IMAGE' as PromptType,
      content: 'A beautiful sunset',
      userFeedback: null,
      aiComment: null,
      mastraMessageId: null,
      parentId: null,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    };

    vi.mocked(prisma.prompt.create).mockResolvedValue(mockPrompt);

    const result = await createPrompt({
      projectId: 'proj_123',
      type: 'image',
      content: 'A beautiful sunset',
    });

    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      id: 'prompt_123',
      projectId: 'proj_123',
      type: 'image',
      content: 'A beautiful sunset',
      userFeedback: undefined,
      aiComment: undefined,
      mastraMessageId: undefined,
      parentId: undefined,
      createdAt: mockPrompt.createdAt,
      updatedAt: mockPrompt.updatedAt,
      assets: [],
    });

    expect(prisma.prompt.create).toHaveBeenCalledWith({
      data: {
        projectId: 'proj_123',
        type: 'IMAGE',
        content: 'A beautiful sunset',
      },
      include: { assets: true },
    });
  });

  it('should create a prompt with mastraMessageId', async () => {
    const mockPrompt = {
      id: 'prompt_456',
      projectId: 'proj_123',
      type: 'VIDEO' as PromptType,
      content: 'Dynamic animation',
      userFeedback: null,
      aiComment: null,
      mastraMessageId: 'msg_123',
      parentId: null,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-01T00:00:00Z'),
    };

    vi.mocked(prisma.prompt.create).mockResolvedValue(mockPrompt);

    const result = await createPrompt({
      projectId: 'proj_123',
      type: 'video',
      content: 'Dynamic animation',
      mastraMessageId: 'msg_123',
    });

    expect(result.success).toBe(true);
    expect(result.data?.mastraMessageId).toBe('msg_123');

    expect(prisma.prompt.create).toHaveBeenCalledWith({
      data: {
        projectId: 'proj_123',
        type: 'VIDEO',
        content: 'Dynamic animation',
        mastraMessageId: 'msg_123',
      },
      include: { assets: true },
    });
  });

  it('should create a prompt with parentId', async () => {
    const mockPrompt = {
      id: 'prompt_789',
      projectId: 'proj_123',
      type: 'IMAGE' as PromptType,
      content: 'Refined version',
      userFeedback: null,
      aiComment: null,
      mastraMessageId: null,
      parentId: 'prompt_123',
      createdAt: new Date('2025-01-02T00:00:00Z'),
      updatedAt: new Date('2025-01-02T00:00:00Z'),
    };

    vi.mocked(prisma.prompt.create).mockResolvedValue(mockPrompt);

    const result = await createPrompt({
      projectId: 'proj_123',
      type: 'image',
      content: 'Refined version',
      parentId: 'prompt_123',
    });

    expect(result.success).toBe(true);
    expect(result.data?.parentId).toBe('prompt_123');

    expect(prisma.prompt.create).toHaveBeenCalledWith({
      data: {
        projectId: 'proj_123',
        type: 'IMAGE',
        content: 'Refined version',
        parentId: 'prompt_123',
      },
      include: { assets: true },
    });
  });

  it('should return error when projectId is missing', async () => {
    const result = await createPrompt({
      projectId: '',
      type: 'image',
      content: 'Test',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Project ID is required');
    expect(prisma.prompt.create).not.toHaveBeenCalled();
  });

  it('should return error when content is empty', async () => {
    const result = await createPrompt({
      projectId: 'proj_123',
      type: 'image',
      content: '',
    });

    expect(result.success).toBe(false);
    expect(result.error).toBe('Prompt content is required');
    expect(prisma.prompt.create).not.toHaveBeenCalled();
  });

  it('should handle database errors', async () => {
    vi.mocked(prisma.prompt.create).mockRejectedValue(
      new Error('Foreign key constraint failed')
    );

    const result = await createPrompt({
      projectId: 'invalid_proj',
      type: 'image',
      content: 'Test',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Foreign key constraint failed');
  });
});

describe('updatePrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update prompt feedback', async () => {
    const mockPrompt = {
      id: 'prompt_123',
      projectId: 'proj_123',
      type: 'IMAGE' as PromptType,
      content: 'A beautiful sunset',
      userFeedback: 'Too bright',
      aiComment: null,
      mastraMessageId: null,
      parentId: null,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-02T00:00:00Z'),
    };

    vi.mocked(prisma.prompt.update).mockResolvedValue(mockPrompt);

    const result = await updatePrompt('prompt_123', {
      userFeedback: 'Too bright',
    });

    expect(result.success).toBe(true);
    expect(result.data?.userFeedback).toBe('Too bright');

    expect(prisma.prompt.update).toHaveBeenCalledWith({
      where: { id: 'prompt_123' },
      data: { userFeedback: 'Too bright' },
      include: { assets: true },
    });
  });

  it('should update AI comment', async () => {
    const mockPrompt = {
      id: 'prompt_123',
      projectId: 'proj_123',
      type: 'IMAGE' as PromptType,
      content: 'A beautiful sunset',
      userFeedback: null,
      aiComment: 'Adjusting brightness',
      mastraMessageId: null,
      parentId: null,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-02T00:00:00Z'),
    };

    vi.mocked(prisma.prompt.update).mockResolvedValue(mockPrompt);

    const result = await updatePrompt('prompt_123', {
      aiComment: 'Adjusting brightness',
    });

    expect(result.success).toBe(true);
    expect(result.data?.aiComment).toBe('Adjusting brightness');
  });

  it('should update both feedback and comment', async () => {
    const mockPrompt = {
      id: 'prompt_123',
      projectId: 'proj_123',
      type: 'IMAGE' as PromptType,
      content: 'A beautiful sunset',
      userFeedback: 'Needs more contrast',
      aiComment: 'Enhancing contrast',
      mastraMessageId: null,
      parentId: null,
      createdAt: new Date('2025-01-01T00:00:00Z'),
      updatedAt: new Date('2025-01-02T00:00:00Z'),
    };

    vi.mocked(prisma.prompt.update).mockResolvedValue(mockPrompt);

    const result = await updatePrompt('prompt_123', {
      userFeedback: 'Needs more contrast',
      aiComment: 'Enhancing contrast',
    });

    expect(result.success).toBe(true);
    expect(result.data?.userFeedback).toBe('Needs more contrast');
    expect(result.data?.aiComment).toBe('Enhancing contrast');

    expect(prisma.prompt.update).toHaveBeenCalledWith({
      where: { id: 'prompt_123' },
      data: {
        userFeedback: 'Needs more contrast',
        aiComment: 'Enhancing contrast',
      },
      include: { assets: true },
    });
  });

  it('should return error when no fields to update', async () => {
    const result = await updatePrompt('prompt_123', {});

    expect(result.success).toBe(false);
    expect(result.error).toBe('No fields to update');
    expect(prisma.prompt.update).not.toHaveBeenCalled();
  });

  it('should handle prompt not found error', async () => {
    vi.mocked(prisma.prompt.update).mockRejectedValue(
      new Error('Record to update not found')
    );

    const result = await updatePrompt('invalid_id', {
      userFeedback: 'Test',
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Record to update not found');
  });
});

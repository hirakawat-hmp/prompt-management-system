/**
 * Type Adapter Tests
 *
 * Tests for converting between Prisma types and frontend types.
 *
 * TDD RED Phase: These tests will fail until type-adapters.ts is implemented.
 */

import { describe, it, expect } from 'vitest';
import {
  toPrismaPromptType,
  toFrontendPromptType,
  toPrismaAssetType,
  toFrontendAssetType,
  toPrismaAssetProvider,
  toFrontendAssetProvider,
  toFrontendProject,
  toFrontendPrompt,
  toFrontendAsset,
} from './type-adapters';
import type { Project as PrismaProject, Prompt as PrismaPrompt, Asset as PrismaAsset, PromptType as PrismaPromptType, AssetType as PrismaAssetType, AssetProvider as PrismaAssetProvider } from '@prisma/client';
import type { Project, Prompt, Asset } from '@/types/project';

describe('Type Adapters', () => {
  describe('PromptType conversion', () => {
    it('should convert frontend "image" to Prisma IMAGE', () => {
      expect(toPrismaPromptType('image')).toBe('IMAGE');
    });

    it('should convert frontend "video" to Prisma VIDEO', () => {
      expect(toPrismaPromptType('video')).toBe('VIDEO');
    });

    it('should convert Prisma IMAGE to frontend "image"', () => {
      expect(toFrontendPromptType('IMAGE' as PrismaPromptType)).toBe('image');
    });

    it('should convert Prisma VIDEO to frontend "video"', () => {
      expect(toFrontendPromptType('VIDEO' as PrismaPromptType)).toBe('video');
    });
  });

  describe('AssetType conversion', () => {
    it('should convert frontend "image" to Prisma IMAGE', () => {
      expect(toPrismaAssetType('image')).toBe('IMAGE');
    });

    it('should convert frontend "video" to Prisma VIDEO', () => {
      expect(toPrismaAssetType('video')).toBe('VIDEO');
    });

    it('should convert Prisma IMAGE to frontend "image"', () => {
      expect(toFrontendAssetType('IMAGE' as PrismaAssetType)).toBe('image');
    });

    it('should convert Prisma VIDEO to frontend "video"', () => {
      expect(toFrontendAssetType('VIDEO' as PrismaAssetType)).toBe('video');
    });
  });

  describe('AssetProvider conversion', () => {
    it('should convert frontend "midjourney" to Prisma MIDJOURNEY', () => {
      expect(toPrismaAssetProvider('midjourney')).toBe('MIDJOURNEY');
    });

    it('should convert frontend "veo" to Prisma VEO', () => {
      expect(toPrismaAssetProvider('veo')).toBe('VEO');
    });

    it('should convert Prisma MIDJOURNEY to frontend "midjourney"', () => {
      expect(toFrontendAssetProvider('MIDJOURNEY' as PrismaAssetProvider)).toBe('midjourney');
    });

    it('should convert Prisma VEO to frontend "veo"', () => {
      expect(toFrontendAssetProvider('VEO' as PrismaAssetProvider)).toBe('veo');
    });
  });

  describe('Project conversion', () => {
    it('should convert Prisma Project to frontend Project', () => {
      const prismaProject: PrismaProject = {
        id: 'proj_123',
        name: 'Test Project',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
      };

      const frontendProject = toFrontendProject(prismaProject);

      expect(frontendProject).toEqual({
        id: 'proj_123',
        name: 'Test Project',
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
      });
    });
  });

  describe('Prompt conversion', () => {
    it('should convert Prisma Prompt to frontend Prompt (without parent)', () => {
      const prismaPrompt: PrismaPrompt = {
        id: 'prompt_123',
        projectId: 'proj_123',
        type: 'IMAGE' as PrismaPromptType,
        content: 'A beautiful sunset',
        userFeedback: null,
        aiComment: null,
        mastraMessageId: 'msg_123',
        parentId: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
      };

      const frontendPrompt = toFrontendPrompt(prismaPrompt);

      expect(frontendPrompt).toEqual({
        id: 'prompt_123',
        projectId: 'proj_123',
        type: 'image',
        content: 'A beautiful sunset',
        userFeedback: undefined,
        aiComment: undefined,
        mastraMessageId: 'msg_123',
        parentId: undefined,
        createdAt: new Date('2025-01-01T00:00:00Z'),
        updatedAt: new Date('2025-01-02T00:00:00Z'),
        assets: [],
      });
    });

    it('should convert Prisma Prompt to frontend Prompt (with feedback and parent)', () => {
      const prismaPrompt: PrismaPrompt = {
        id: 'prompt_456',
        projectId: 'proj_123',
        type: 'VIDEO' as PrismaPromptType,
        content: 'A dynamic animation',
        userFeedback: 'Too fast',
        aiComment: 'Adjusting speed',
        mastraMessageId: 'msg_456',
        parentId: 'prompt_123',
        createdAt: new Date('2025-01-03T00:00:00Z'),
        updatedAt: new Date('2025-01-04T00:00:00Z'),
      };

      const frontendPrompt = toFrontendPrompt(prismaPrompt);

      expect(frontendPrompt).toEqual({
        id: 'prompt_456',
        projectId: 'proj_123',
        type: 'video',
        content: 'A dynamic animation',
        userFeedback: 'Too fast',
        aiComment: 'Adjusting speed',
        mastraMessageId: 'msg_456',
        parentId: 'prompt_123',
        createdAt: new Date('2025-01-03T00:00:00Z'),
        updatedAt: new Date('2025-01-04T00:00:00Z'),
        assets: [],
      });
    });
  });

  describe('Asset conversion', () => {
    it('should convert Prisma Asset to frontend Asset (minimal metadata)', () => {
      const prismaAsset: PrismaAsset = {
        id: 'asset_123',
        promptId: 'prompt_123',
        type: 'IMAGE' as PrismaAssetType,
        url: 'https://example.com/image.jpg',
        provider: 'MIDJOURNEY' as PrismaAssetProvider,
        width: null,
        height: null,
        duration: null,
        fileSize: null,
        mimeType: null,
        createdAt: new Date('2025-01-01T00:00:00Z'),
      };

      const frontendAsset = toFrontendAsset(prismaAsset);

      expect(frontendAsset).toEqual({
        id: 'asset_123',
        promptId: 'prompt_123',
        type: 'image',
        url: 'https://example.com/image.jpg',
        provider: 'midjourney',
        metadata: {},
        createdAt: new Date('2025-01-01T00:00:00Z'),
      });
    });

    it('should convert Prisma Asset to frontend Asset (full metadata for image)', () => {
      const prismaAsset: PrismaAsset = {
        id: 'asset_456',
        promptId: 'prompt_123',
        type: 'IMAGE' as PrismaAssetType,
        url: 'https://example.com/image.jpg',
        provider: 'MIDJOURNEY' as PrismaAssetProvider,
        width: 1920,
        height: 1080,
        duration: null,
        fileSize: 2048000,
        mimeType: 'image/jpeg',
        createdAt: new Date('2025-01-01T00:00:00Z'),
      };

      const frontendAsset = toFrontendAsset(prismaAsset);

      expect(frontendAsset).toEqual({
        id: 'asset_456',
        promptId: 'prompt_123',
        type: 'image',
        url: 'https://example.com/image.jpg',
        provider: 'midjourney',
        metadata: {
          width: 1920,
          height: 1080,
          fileSize: 2048000,
          mimeType: 'image/jpeg',
        },
        createdAt: new Date('2025-01-01T00:00:00Z'),
      });
    });

    it('should convert Prisma Asset to frontend Asset (full metadata for video)', () => {
      const prismaAsset: PrismaAsset = {
        id: 'asset_789',
        promptId: 'prompt_456',
        type: 'VIDEO' as PrismaAssetType,
        url: 'https://example.com/video.mp4',
        provider: 'VEO' as PrismaAssetProvider,
        width: 1920,
        height: 1080,
        duration: 30,
        fileSize: 10240000,
        mimeType: 'video/mp4',
        createdAt: new Date('2025-01-03T00:00:00Z'),
      };

      const frontendAsset = toFrontendAsset(prismaAsset);

      expect(frontendAsset).toEqual({
        id: 'asset_789',
        promptId: 'prompt_456',
        type: 'video',
        url: 'https://example.com/video.mp4',
        provider: 'veo',
        metadata: {
          width: 1920,
          height: 1080,
          duration: 30,
          fileSize: 10240000,
          mimeType: 'video/mp4',
        },
        createdAt: new Date('2025-01-03T00:00:00Z'),
      });
    });
  });
});

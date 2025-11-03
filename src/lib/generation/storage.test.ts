/**
 * Storage Utility Tests
 *
 * TDD: RED Phase - Write failing tests first
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { existsSync, rmSync } from 'fs';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { downloadAndSaveAsset, getExtensionFromContentType } from './storage';

// Test storage directory
const TEST_STORAGE_DIR = join(process.cwd(), 'storage-test');

describe('Storage Utility', () => {
  beforeEach(() => {
    // Set test storage directory
    process.env.STORAGE_DIR = TEST_STORAGE_DIR;
  });

  afterEach(() => {
    // Clean up test storage
    if (existsSync(TEST_STORAGE_DIR)) {
      rmSync(TEST_STORAGE_DIR, { recursive: true, force: true });
    }
  });

  describe('downloadAndSaveAsset', () => {
    it('should download image from URL and save locally', async () => {
      // Mock fetch to return fake image data
      const mockImageData = Buffer.from('fake-image-data');
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => mockImageData.buffer,
        headers: new Map([['content-type', 'image/jpeg']]),
      });

      const result = await downloadAndSaveAsset({
        sourceUrl: 'https://example.com/test.jpg',
        taskId: 'task123',
        index: 0,
        assetType: 'IMAGE',
      });

      // Verify API URL format
      expect(result.apiUrl).toBe('/api/assets/images/task123_0.jpg');

      // Verify local file path
      expect(result.localPath).toContain('task123_0.jpg');

      // Verify file exists
      expect(existsSync(result.localPath)).toBe(true);

      // Verify file content
      const savedData = await readFile(result.localPath);
      expect(savedData.toString()).toBe('fake-image-data');

      // Verify metadata
      expect(result.fileSize).toBe(mockImageData.length);
      expect(result.mimeType).toBe('image/jpeg');
    });

    it('should handle video files', async () => {
      const mockVideoData = Buffer.from('fake-video-data');
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => mockVideoData.buffer,
        headers: new Map([['content-type', 'video/mp4']]),
      });

      const result = await downloadAndSaveAsset({
        sourceUrl: 'https://example.com/test.mp4',
        taskId: 'task456',
        index: 0,
        assetType: 'VIDEO',
      });

      expect(result.apiUrl).toBe('/api/assets/videos/task456_0.mp4');
      expect(existsSync(result.localPath)).toBe(true);
      expect(result.mimeType).toBe('video/mp4');
    });

    it('should handle multiple assets with different indices', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => Buffer.from('data').buffer,
        headers: new Map([['content-type', 'image/jpeg']]),
      });

      const result1 = await downloadAndSaveAsset({
        sourceUrl: 'https://example.com/test1.jpg',
        taskId: 'task789',
        index: 0,
        assetType: 'IMAGE',
      });

      const result2 = await downloadAndSaveAsset({
        sourceUrl: 'https://example.com/test2.jpg',
        taskId: 'task789',
        index: 1,
        assetType: 'IMAGE',
      });

      expect(result1.apiUrl).toBe('/api/assets/images/task789_0.jpg');
      expect(result2.apiUrl).toBe('/api/assets/images/task789_1.jpg');
      expect(existsSync(result1.localPath)).toBe(true);
      expect(existsSync(result2.localPath)).toBe(true);
    });

    it('should handle PNG images', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => Buffer.from('png-data').buffer,
        headers: new Map([['content-type', 'image/png']]),
      });

      const result = await downloadAndSaveAsset({
        sourceUrl: 'https://example.com/test.png',
        taskId: 'task_png',
        index: 0,
        assetType: 'IMAGE',
      });

      expect(result.apiUrl).toBe('/api/assets/images/task_png_0.png');
      expect(result.mimeType).toBe('image/png');
    });

    it('should handle WebP images', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => Buffer.from('webp-data').buffer,
        headers: new Map([['content-type', 'image/webp']]),
      });

      const result = await downloadAndSaveAsset({
        sourceUrl: 'https://example.com/test.webp',
        taskId: 'task_webp',
        index: 0,
        assetType: 'IMAGE',
      });

      expect(result.apiUrl).toBe('/api/assets/images/task_webp_0.webp');
      expect(result.mimeType).toBe('image/webp');
    });

    it('should default to jpg for unknown image types', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => Buffer.from('unknown-data').buffer,
        headers: new Map([['content-type', 'image/unknown']]),
      });

      const result = await downloadAndSaveAsset({
        sourceUrl: 'https://example.com/test.unknown',
        taskId: 'task_unknown',
        index: 0,
        assetType: 'IMAGE',
      });

      expect(result.apiUrl).toBe('/api/assets/images/task_unknown_0.jpg');
    });

    it('should default to mp4 for unknown video types', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => Buffer.from('unknown-video').buffer,
        headers: new Map([['content-type', 'video/unknown']]),
      });

      const result = await downloadAndSaveAsset({
        sourceUrl: 'https://example.com/test.unknown',
        taskId: 'task_video_unknown',
        index: 0,
        assetType: 'VIDEO',
      });

      expect(result.apiUrl).toBe('/api/assets/videos/task_video_unknown_0.mp4');
    });

    it('should create directories if they do not exist', async () => {
      // Ensure directory doesn't exist
      if (existsSync(TEST_STORAGE_DIR)) {
        rmSync(TEST_STORAGE_DIR, { recursive: true, force: true });
      }

      global.fetch = vi.fn().mockResolvedValue({
        arrayBuffer: async () => Buffer.from('data').buffer,
        headers: new Map([['content-type', 'image/jpeg']]),
      });

      const result = await downloadAndSaveAsset({
        sourceUrl: 'https://example.com/test.jpg',
        taskId: 'task_new_dir',
        index: 0,
        assetType: 'IMAGE',
      });

      expect(existsSync(result.localPath)).toBe(true);
    });

    it('should throw error on fetch failure', async () => {
      global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      await expect(
        downloadAndSaveAsset({
          sourceUrl: 'https://example.com/fail.jpg',
          taskId: 'task_fail',
          index: 0,
          assetType: 'IMAGE',
        })
      ).rejects.toThrow('Network error');
    });
  });

  describe('getExtensionFromContentType', () => {
    it('should return jpg for image/jpeg', () => {
      expect(getExtensionFromContentType('image/jpeg', 'IMAGE')).toBe('jpg');
    });

    it('should return png for image/png', () => {
      expect(getExtensionFromContentType('image/png', 'IMAGE')).toBe('png');
    });

    it('should return webp for image/webp', () => {
      expect(getExtensionFromContentType('image/webp', 'IMAGE')).toBe('webp');
    });

    it('should return mp4 for video/mp4', () => {
      expect(getExtensionFromContentType('video/mp4', 'VIDEO')).toBe('mp4');
    });

    it('should return webm for video/webm', () => {
      expect(getExtensionFromContentType('video/webm', 'VIDEO')).toBe('webm');
    });

    it('should default to jpg for IMAGE with unknown type', () => {
      expect(getExtensionFromContentType('unknown', 'IMAGE')).toBe('jpg');
    });

    it('should default to mp4 for VIDEO with unknown type', () => {
      expect(getExtensionFromContentType('unknown', 'VIDEO')).toBe('mp4');
    });

    it('should handle null content type', () => {
      expect(getExtensionFromContentType(null, 'IMAGE')).toBe('jpg');
      expect(getExtensionFromContentType(null, 'VIDEO')).toBe('mp4');
    });
  });
});

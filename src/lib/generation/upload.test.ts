/**
 * Kie.ai File Upload Utility Tests
 *
 * TDD RED Phase: Tests for uploading files to Kie.ai temporary storage.
 *
 * Critical constraint: Uploaded files are automatically deleted after 3 days.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { uploadFileToKie } from './upload';
import type { UploadResult } from '@/types/generation';

// Mock fetch globally
global.fetch = vi.fn();

describe('uploadFileToKie', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('successful upload', () => {
    it('should upload file and return normalized upload result', async () => {
      const mockFile = new File(['test content'], 'test-image.jpg', { type: 'image/jpeg' });
      const uploadedAt = '2025-01-01T12:00:00.000Z';

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 200,
          msg: 'Upload successful',
          data: {
            fileName: 'test-image.jpg',
            filePath: 'user-uploads/test-image.jpg',
            downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/test-image.jpg',
            fileSize: 1024,
            mimeType: 'image/jpeg',
            uploadedAt: uploadedAt,
          },
        }),
      } as Response);

      const result = await uploadFileToKie(mockFile);

      expect(result).toEqual({
        downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/test-image.jpg',
        fileName: 'test-image.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        expiresAt: new Date('2025-01-04T12:00:00.000Z'), // 3 days after uploadedAt
      });
    });

    it('should calculate expiresAt as uploadedAt + 3 days', async () => {
      const mockFile = new File(['test'], 'test.png', { type: 'image/png' });
      const uploadedAt = '2025-12-25T10:30:00.000Z'; // Christmas 2025

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 200,
          msg: 'Upload successful',
          data: {
            fileName: 'test.png',
            filePath: 'user-uploads/test.png',
            downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/test.png',
            fileSize: 2048,
            mimeType: 'image/png',
            uploadedAt: uploadedAt,
          },
        }),
      } as Response);

      const result = await uploadFileToKie(mockFile);

      // Expected: 2025-12-28T10:30:00.000Z (3 days later)
      expect(result.expiresAt).toEqual(new Date('2025-12-28T10:30:00.000Z'));
    });

    it('should use default uploadPath when not provided', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 200,
          msg: 'Upload successful',
          data: {
            fileName: 'image.jpg',
            filePath: 'user-uploads/image.jpg',
            downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/image.jpg',
            fileSize: 512,
            mimeType: 'image/jpeg',
            uploadedAt: '2025-01-01T00:00:00.000Z',
          },
        }),
      } as Response);

      await uploadFileToKie(mockFile);

      const call = vi.mocked(global.fetch).mock.calls[0];
      const formData = call[1].body as FormData;

      expect(formData.get('uploadPath')).toBe('user-uploads');
    });

    it('should use custom uploadPath when provided', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 200,
          msg: 'Upload successful',
          data: {
            fileName: 'image.jpg',
            filePath: 'custom-path/image.jpg',
            downloadUrl: 'https://tempfile.redpandaai.co/xxx/custom-path/image.jpg',
            fileSize: 512,
            mimeType: 'image/jpeg',
            uploadedAt: '2025-01-01T00:00:00.000Z',
          },
        }),
      } as Response);

      await uploadFileToKie(mockFile, 'custom-path');

      const call = vi.mocked(global.fetch).mock.calls[0];
      const formData = call[1].body as FormData;

      expect(formData.get('uploadPath')).toBe('custom-path');
    });

    it('should include file in FormData', async () => {
      const mockFile = new File(['test content'], 'upload.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 200,
          msg: 'Upload successful',
          data: {
            fileName: 'upload.jpg',
            filePath: 'user-uploads/upload.jpg',
            downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/upload.jpg',
            fileSize: 12,
            mimeType: 'image/jpeg',
            uploadedAt: '2025-01-01T00:00:00.000Z',
          },
        }),
      } as Response);

      await uploadFileToKie(mockFile);

      const call = vi.mocked(global.fetch).mock.calls[0];
      const formData = call[1].body as FormData;

      expect(formData.get('file')).toBe(mockFile);
    });

    it('should send request to correct endpoint with authorization header', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 200,
          msg: 'Upload successful',
          data: {
            fileName: 'image.jpg',
            filePath: 'user-uploads/image.jpg',
            downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/image.jpg',
            fileSize: 512,
            mimeType: 'image/jpeg',
            uploadedAt: '2025-01-01T00:00:00.000Z',
          },
        }),
      } as Response);

      await uploadFileToKie(mockFile);

      const [url, options] = vi.mocked(global.fetch).mock.calls[0];

      expect(url).toBe('https://kieai.redpandaai.co/api/file-stream-upload');
      expect(options.method).toBe('POST');
      expect(options.headers['Authorization']).toMatch(/^Bearer /);
    });

    it('should use KIE_API_KEY from environment', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
      const testKey = 'test-api-key-12345';
      process.env.KIE_API_KEY = testKey;

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 200,
          msg: 'Upload successful',
          data: {
            fileName: 'image.jpg',
            filePath: 'user-uploads/image.jpg',
            downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/image.jpg',
            fileSize: 512,
            mimeType: 'image/jpeg',
            uploadedAt: '2025-01-01T00:00:00.000Z',
          },
        }),
      } as Response);

      await uploadFileToKie(mockFile);

      const [, options] = vi.mocked(global.fetch).mock.calls[0];
      expect(options.headers['Authorization']).toBe(`Bearer ${testKey}`);
    });
  });

  describe('error handling', () => {
    it('should throw error when API returns non-ok response', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          success: false,
          code: 400,
          msg: 'Invalid file format',
        }),
      } as Response);

      await expect(uploadFileToKie(mockFile)).rejects.toThrow(
        'File upload to Kie.ai failed with status 400: Invalid file format'
      );
    });

    it('should throw error with 401 status (unauthorized)', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({
          success: false,
          code: 401,
          msg: 'Unauthorized: Invalid API key',
        }),
      } as Response);

      await expect(uploadFileToKie(mockFile)).rejects.toThrow(
        'File upload to Kie.ai failed with status 401'
      );
    });

    it('should throw error with 402 status (insufficient credits)', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 402,
        json: async () => ({
          success: false,
          code: 402,
          msg: 'Insufficient credits',
        }),
      } as Response);

      await expect(uploadFileToKie(mockFile)).rejects.toThrow(
        'File upload to Kie.ai failed with status 402'
      );
    });

    it('should throw error with 422 status (validation error)', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          success: false,
          code: 422,
          msg: 'File size exceeds limit',
        }),
      } as Response);

      await expect(uploadFileToKie(mockFile)).rejects.toThrow(
        'File upload to Kie.ai failed with status 422: File size exceeds limit'
      );
    });

    it('should throw error when upload fails without ok status', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          code: 500,
          msg: 'Internal server error',
        }),
      } as Response);

      await expect(uploadFileToKie(mockFile)).rejects.toThrow(
        'File upload to Kie.ai failed with status 500'
      );
    });

    it('should throw error on network failure', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockRejectedValueOnce(new Error('Network error: ECONNREFUSED'));

      await expect(uploadFileToKie(mockFile)).rejects.toThrow('Network error: ECONNREFUSED');
    });

    it('should handle missing KIE_API_KEY gracefully', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
      const original = process.env.KIE_API_KEY;
      delete process.env.KIE_API_KEY;

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 200,
          msg: 'Upload successful',
          data: {
            fileName: 'image.jpg',
            filePath: 'user-uploads/image.jpg',
            downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/image.jpg',
            fileSize: 512,
            mimeType: 'image/jpeg',
            uploadedAt: '2025-01-01T00:00:00.000Z',
          },
        }),
      } as Response);

      const result = await uploadFileToKie(mockFile);

      const [, options] = vi.mocked(global.fetch).mock.calls[0];
      // Should include Bearer prefix even if key is undefined
      expect(options.headers['Authorization']).toBeDefined();

      process.env.KIE_API_KEY = original;
    });
  });

  describe('response parsing', () => {
    it('should handle response with all fields present', async () => {
      const mockFile = new File(['test'], 'photo.png', { type: 'image/png' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 200,
          msg: 'File uploaded successfully',
          data: {
            fileName: 'photo.png',
            filePath: 'reference-images/photo.png',
            downloadUrl: 'https://tempfile.redpandaai.co/abc123/reference-images/photo.png',
            fileSize: 4096,
            mimeType: 'image/png',
            uploadedAt: '2025-01-15T14:30:45.000Z',
          },
        }),
      } as Response);

      const result = await uploadFileToKie(mockFile, 'reference-images');

      expect(result).toMatchObject({
        downloadUrl: 'https://tempfile.redpandaai.co/abc123/reference-images/photo.png',
        fileName: 'photo.png',
        fileSize: 4096,
        mimeType: 'image/png',
      });

      // Verify expiresAt is exactly 3 days after uploadedAt
      const uploadedDate = new Date('2025-01-15T14:30:45.000Z');
      const expectedExpires = new Date(uploadedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      expect(result.expiresAt).toEqual(expectedExpires);
    });

    it('should handle response with numeric uploadedAt timestamp', async () => {
      const mockFile = new File(['test'], 'image.jpg', { type: 'image/jpeg' });
      const timestamp = 1735814400000; // 2025-01-02T12:00:00.000Z

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          success: true,
          code: 200,
          msg: 'Upload successful',
          data: {
            fileName: 'image.jpg',
            filePath: 'user-uploads/image.jpg',
            downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/image.jpg',
            fileSize: 512,
            mimeType: 'image/jpeg',
            uploadedAt: timestamp,
          },
        }),
      } as Response);

      const result = await uploadFileToKie(mockFile);

      // Should be able to parse numeric timestamp
      expect(result.expiresAt).toBeInstanceOf(Date);
      const uploadedDate = new Date(timestamp);
      const expectedExpires = new Date(uploadedDate.getTime() + 3 * 24 * 60 * 60 * 1000);
      expect(result.expiresAt).toEqual(expectedExpires);
    });
  });

  describe('request validation', () => {
    it('should reject empty file', async () => {
      const emptyFile = new File([], 'empty.jpg', { type: 'image/jpeg' });

      vi.mocked(global.fetch).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({
          success: false,
          code: 422,
          msg: 'File cannot be empty',
        }),
      } as Response);

      await expect(uploadFileToKie(emptyFile)).rejects.toThrow();
    });

    it('should support various file types', async () => {
      const fileTypes = [
        { name: 'image.jpg', type: 'image/jpeg' },
        { name: 'image.png', type: 'image/png' },
        { name: 'image.webp', type: 'image/webp' },
        { name: 'video.mp4', type: 'video/mp4' },
      ];

      for (const fileInfo of fileTypes) {
        const mockFile = new File(['test'], fileInfo.name, { type: fileInfo.type });

        vi.mocked(global.fetch).mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            code: 200,
            msg: 'Upload successful',
            data: {
              fileName: fileInfo.name,
              filePath: `user-uploads/${fileInfo.name}`,
              downloadUrl: `https://tempfile.redpandaai.co/xxx/user-uploads/${fileInfo.name}`,
              fileSize: 512,
              mimeType: fileInfo.type,
              uploadedAt: '2025-01-01T00:00:00.000Z',
            },
          }),
        } as Response);

        const result = await uploadFileToKie(mockFile);

        expect(result.mimeType).toBe(fileInfo.type);
        expect(result.fileName).toBe(fileInfo.name);
      }
    });
  });
});

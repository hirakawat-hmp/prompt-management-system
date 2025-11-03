/**
 * Tests: uploadGenerationFile Server Action
 *
 * RED phase: Write failing tests for file upload
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { uploadGenerationFile } from './upload-file';

// Mock dependencies
vi.mock('@/lib/generation/upload', () => ({
  uploadFileToKie: vi.fn(),
}));

describe('uploadGenerationFile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Validation', () => {
    it('should return error if file is missing', async () => {
      const formData = new FormData();
      // No file added

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('File is required');
      }
    });

    it('should return error if file is not a File object', async () => {
      const formData = new FormData();
      formData.append('file', 'not a file');

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Invalid file');
      }
    });
  });

  describe('Successful Upload', () => {
    it('should upload file successfully with default upload path', async () => {
      const { uploadFileToKie } = await import('@/lib/generation/upload');

      // Mock upload response
      const mockUploadResult = {
        downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/test.jpg',
        fileName: 'test.jpg',
        fileSize: 12345,
        mimeType: 'image/jpeg',
        expiresAt: new Date('2025-01-04T00:00:00Z'),
      };

      vi.mocked(uploadFileToKie).mockResolvedValueOnce(mockUploadResult);

      // Create a test file
      const testFile = new File(['test content'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', testFile);

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.downloadUrl).toBe(mockUploadResult.downloadUrl);
        expect(result.data.fileName).toBe('test.jpg');
        expect(result.data.fileSize).toBe(12345);
        expect(result.data.mimeType).toBe('image/jpeg');
        expect(result.data.expiresAt).toEqual(new Date('2025-01-04T00:00:00Z'));
      }

      // Verify uploadFileToKie was called with correct arguments
      expect(uploadFileToKie).toHaveBeenCalledWith(expect.any(File), 'user-uploads');
    });

    it('should upload file with custom upload path', async () => {
      const { uploadFileToKie } = await import('@/lib/generation/upload');

      const mockUploadResult = {
        downloadUrl: 'https://tempfile.redpandaai.co/xxx/reference-images/ref.png',
        fileName: 'ref.png',
        fileSize: 54321,
        mimeType: 'image/png',
        expiresAt: new Date('2025-01-04T00:00:00Z'),
      };

      vi.mocked(uploadFileToKie).mockResolvedValueOnce(mockUploadResult);

      const testFile = new File(['reference image'], 'ref.png', { type: 'image/png' });
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('uploadPath', 'reference-images');

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.downloadUrl).toContain('reference-images');
      }

      // Verify custom path was passed
      expect(uploadFileToKie).toHaveBeenCalledWith(expect.any(File), 'reference-images');
    });

    it('should handle video file upload', async () => {
      const { uploadFileToKie } = await import('@/lib/generation/upload');

      const mockUploadResult = {
        downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/video.mp4',
        fileName: 'video.mp4',
        fileSize: 1234567,
        mimeType: 'video/mp4',
        expiresAt: new Date('2025-01-04T00:00:00Z'),
      };

      vi.mocked(uploadFileToKie).mockResolvedValueOnce(mockUploadResult);

      const testFile = new File(['video content'], 'video.mp4', { type: 'video/mp4' });
      const formData = new FormData();
      formData.append('file', testFile);

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.mimeType).toBe('video/mp4');
        expect(result.data.fileSize).toBe(1234567);
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle upload API errors', async () => {
      const { uploadFileToKie } = await import('@/lib/generation/upload');

      vi.mocked(uploadFileToKie).mockRejectedValueOnce(
        new Error('File upload to Kie.ai failed with status 402: Insufficient credits')
      );

      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', testFile);

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Insufficient credits');
      }
    });

    it('should handle network errors', async () => {
      const { uploadFileToKie } = await import('@/lib/generation/upload');

      vi.mocked(uploadFileToKie).mockRejectedValueOnce(new Error('Network timeout'));

      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', testFile);

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('Network timeout');
      }
    });

    it('should handle file size errors', async () => {
      const { uploadFileToKie } = await import('@/lib/generation/upload');

      vi.mocked(uploadFileToKie).mockRejectedValueOnce(
        new Error('File size exceeds maximum allowed (100MB)')
      );

      const testFile = new File(['huge file'], 'huge.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', testFile);

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error).toContain('File size exceeds');
      }
    });
  });

  describe('FormData Handling', () => {
    it('should extract file from FormData correctly', async () => {
      const { uploadFileToKie } = await import('@/lib/generation/upload');

      vi.mocked(uploadFileToKie).mockResolvedValueOnce({
        downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/test.jpg',
        fileName: 'test.jpg',
        fileSize: 100,
        mimeType: 'image/jpeg',
        expiresAt: new Date('2025-01-04T00:00:00Z'),
      });

      const testFile = new File(['content'], 'original-name.jpg', { type: 'image/jpeg' });
      const formData = new FormData();
      formData.append('file', testFile);
      formData.append('other-field', 'other-value'); // Extra field (should be ignored)

      const result = await uploadGenerationFile(formData);

      expect(result.success).toBe(true);

      // Verify only file was extracted and passed
      expect(uploadFileToKie).toHaveBeenCalledWith(expect.any(File), 'user-uploads');
      const callArgs = vi.mocked(uploadFileToKie).mock.calls[0];
      expect(callArgs[0].name).toBe('original-name.jpg');
    });
  });
});

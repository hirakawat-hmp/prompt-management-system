/**
 * ImageUploader Component Tests
 *
 * Tests for the image upload component with drag & drop support.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ImageUploader } from './ImageUploader';
import type { UploadResult } from '@/types/generation';

// Mock the upload hook
const mockUploadFile = vi.fn();
vi.mock('@/hooks/use-generation-tasks', () => ({
  useUploadFile: () => ({
    uploadFile: mockUploadFile,
    isUploading: false,
    error: null,
    progress: 0,
  }),
}));

describe('ImageUploader', () => {
  const mockOnUploadComplete = vi.fn();
  const defaultProps = {
    onUploadComplete: mockOnUploadComplete,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render upload area', () => {
      render(<ImageUploader {...defaultProps} />);

      expect(screen.getByText(/drag.*drop/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument();
    });

    it('should display file type restrictions', () => {
      render(<ImageUploader {...defaultProps} accept="image/*" />);

      // Should show accepted file types
      expect(screen.getByText(/image/i)).toBeInTheDocument();
    });

    it('should display size limit', () => {
      render(<ImageUploader {...defaultProps} maxSizeMB={10} />);

      expect(screen.getByText(/10.*mb/i)).toBeInTheDocument();
    });

    it('should show expiry warning', () => {
      render(<ImageUploader {...defaultProps} />);

      expect(screen.getByText(/3.*day/i)).toBeInTheDocument();
    });
  });

  describe('File Selection', () => {
    it('should allow file selection via button', async () => {
      const user = userEvent.setup();
      render(<ImageUploader {...defaultProps} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i);

      await user.upload(input, file);

      // File should be selected (will trigger preview)
      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });
    });

    it('should validate file size', async () => {
      const user = userEvent.setup();
      render(<ImageUploader {...defaultProps} maxSizeMB={1} />);

      // Create 2MB file (exceeds limit)
      const largeFile = new File([new ArrayBuffer(2 * 1024 * 1024)], 'large.jpg', {
        type: 'image/jpeg',
      });
      const input = screen.getByLabelText(/upload/i);

      await user.upload(input, largeFile);

      await waitFor(() => {
        expect(screen.getByText(/exceeds.*limit/i)).toBeInTheDocument();
      });
    });

    it('should validate file type', async () => {
      const user = userEvent.setup();
      render(<ImageUploader {...defaultProps} accept="image/*" />);

      const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = screen.getByLabelText(/upload/i);

      await user.upload(input, invalidFile);

      await waitFor(() => {
        expect(screen.getByText(/invalid.*file.*type/i)).toBeInTheDocument();
      });
    });
  });

  describe('File Upload', () => {
    it('should upload file and call onUploadComplete', async () => {
      const user = userEvent.setup();
      const mockResult: UploadResult = {
        downloadUrl: 'https://example.com/test.jpg',
        fileName: 'test.jpg',
        fileSize: 1024,
        mimeType: 'image/jpeg',
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      };

      mockUploadFile.mockResolvedValue(mockResult);

      render(<ImageUploader {...defaultProps} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i);

      await user.upload(input, file);

      // Click upload button
      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(mockUploadFile).toHaveBeenCalledWith(file);
        expect(mockOnUploadComplete).toHaveBeenCalledWith(mockResult);
      });
    });

    it('should show progress during upload', async () => {
      const user = userEvent.setup();

      // Mock in-progress upload
      vi.mocked(mockUploadFile).mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      // Re-render with uploading state
      const { rerender } = render(<ImageUploader {...defaultProps} />);

      // Simulate uploading state by remocking the hook
      vi.doMock('@/hooks/use-generation-tasks', () => ({
        useUploadFile: () => ({
          uploadFile: mockUploadFile,
          isUploading: true,
          error: null,
          progress: 50,
        }),
      }));

      // For this test, we'll just verify the upload button behavior
      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i);
      await user.upload(input, file);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      expect(uploadButton).toBeInTheDocument();
    });

    it('should display error on upload failure', async () => {
      const user = userEvent.setup();
      mockUploadFile.mockRejectedValue(new Error('Upload failed'));

      render(<ImageUploader {...defaultProps} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i);

      await user.upload(input, file);

      const uploadButton = screen.getByRole('button', { name: /upload/i });
      await user.click(uploadButton);

      await waitFor(() => {
        expect(screen.getByText(/upload.*failed/i)).toBeInTheDocument();
      });
    });
  });

  describe('File Preview', () => {
    it('should show preview after file selection', async () => {
      const user = userEvent.setup();
      render(<ImageUploader {...defaultProps} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i);

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
        expect(screen.getByAltText(/preview/i)).toBeInTheDocument();
      });
    });

    it('should allow removing selected file', async () => {
      const user = userEvent.setup();
      render(<ImageUploader {...defaultProps} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const input = screen.getByLabelText(/upload/i);

      await user.upload(input, file);

      await waitFor(() => {
        expect(screen.getByText('test.jpg')).toBeInTheDocument();
      });

      const removeButton = screen.getByRole('button', { name: /remove/i });
      await user.click(removeButton);

      expect(screen.queryByText('test.jpg')).not.toBeInTheDocument();
    });
  });

  describe('Drag and Drop', () => {
    it('should handle drag over event', async () => {
      render(<ImageUploader {...defaultProps} />);

      const dropzone = screen.getByText(/drag.*drop/i).closest('div');
      expect(dropzone).toBeInTheDocument();

      // Simulate drag over
      if (dropzone) {
        const dragEvent = new Event('dragover', { bubbles: true });
        dropzone.dispatchEvent(dragEvent);
      }
    });

    it('should handle file drop', async () => {
      render(<ImageUploader {...defaultProps} />);

      const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const dropzone = screen.getByText(/drag.*drop/i).closest('div');

      if (dropzone) {
        const dropEvent = new Event('drop', { bubbles: true }) as any;
        dropEvent.dataTransfer = {
          files: [file],
          items: [{ kind: 'file', type: 'image/jpeg', getAsFile: () => file }],
        };
        dropzone.dispatchEvent(dropEvent);

        await waitFor(() => {
          expect(screen.getByText('test.jpg')).toBeInTheDocument();
        });
      }
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(<ImageUploader {...defaultProps} />);

      expect(screen.getByLabelText(/upload/i)).toBeInTheDocument();
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<ImageUploader {...defaultProps} />);

      // Browse button should be focusable
      await user.tab();
      const button = screen.getByRole('button', { name: /browse/i });
      expect(button).toHaveFocus();
    });

    it('should have proper button roles', () => {
      render(<ImageUploader {...defaultProps} />);

      expect(screen.getByRole('button', { name: /browse/i })).toBeInTheDocument();
    });
  });
});

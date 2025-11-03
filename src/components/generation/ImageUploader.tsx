/**
 * ImageUploader Component
 *
 * File upload component with drag & drop support for generation tasks.
 * Handles file validation, preview, and upload progress.
 */

'use client';

import { useState, useRef, useCallback } from 'react';
import { Upload, X, AlertCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { UploadResult } from '@/types/generation';

export interface ImageUploaderProps {
  onUploadComplete: (result: UploadResult) => void;
  maxSizeMB?: number;
  accept?: string;
  className?: string;
}

/**
 * Image uploader with drag & drop support
 *
 * Features:
 * - Drag & drop file upload
 * - File size and type validation
 * - Image preview
 * - Upload progress indicator
 * - 3-day expiry warning
 * - Accessible with keyboard navigation
 */
export function ImageUploader({
  onUploadComplete,
  maxSizeMB = 100,
  accept = 'image/*',
  className,
}: ImageUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSizeMB) {
      return `File size exceeds limit of ${maxSizeMB}MB`;
    }

    // Check file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      return 'Invalid file type';
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    setError(null);

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [maxSizeMB, accept]);

  // File input change handler
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Upload handler
  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Mock upload - replace with actual API call
      // const result = await uploadFileToKie(selectedFile);

      // For now, create a mock result
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearInterval(progressInterval);
      setProgress(100);

      const mockResult: UploadResult = {
        downloadUrl: `https://tempfile.redpandaai.co/mock/${selectedFile.name}`,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      };

      onUploadComplete(mockResult);

      // Reset state
      setSelectedFile(null);
      setPreviewUrl(null);
      setProgress(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  // Remove selected file
  const handleRemove = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Upload area */}
      {!selectedFile && (
        <div
          className={cn(
            'relative rounded-lg border-2 border-dashed p-8 transition-colors',
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-muted-foreground/25 hover:border-muted-foreground/50',
            error && 'border-destructive'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            onChange={handleInputChange}
            className="sr-only"
            id="file-upload"
            aria-label="Upload file"
          />

          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <Upload className="size-12 text-muted-foreground" />

            <div>
              <p className="text-sm text-foreground">
                Drag and drop your file here, or
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => fileInputRef.current?.click()}
                type="button"
                aria-label="Browse files"
              >
                Browse Files
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>Accepted: {accept}</p>
              <p>Maximum size: {maxSizeMB}MB</p>
            </div>

            {/* Expiry warning */}
            <div className="flex items-center gap-2 rounded-md bg-yellow-500/10 px-3 py-2 text-xs text-yellow-700 dark:text-yellow-500">
              <Clock className="size-4" />
              <span>Uploaded files expire after 3 days</span>
            </div>
          </div>
        </div>
      )}

      {/* Preview area */}
      {selectedFile && previewUrl && (
        <div className="rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <img
              src={previewUrl}
              alt="Preview"
              className="size-24 rounded-md object-cover"
            />

            <div className="flex-1">
              <p className="font-medium text-sm">{selectedFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>

              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={isUploading}
                  size="sm"
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
                <Button
                  onClick={handleRemove}
                  variant="outline"
                  size="sm"
                  disabled={isUploading}
                  aria-label="Remove file"
                >
                  <X className="size-4" />
                  Remove
                </Button>
              </div>

              {/* Progress bar */}
              {isUploading && (
                <div className="mt-3">
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {progress}% uploaded
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mt-4 flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Kie.ai File Upload Utility
 *
 * Handles file uploads to Kie.ai temporary storage with 3-day expiration.
 *
 * @see https://kieai.redpandaai.co - Upload service base URL
 * @see /docs/kie/upload/upload-file-stream.md - API documentation
 *
 * Critical Constraint: Uploaded files are automatically deleted after 3 days.
 *
 * Usage Example:
 * ```typescript
 * // Upload a file with default path
 * const result = await uploadFileToKie(fileInput.files[0]);
 *
 * // Upload a file with custom path
 * const result = await uploadFileToKie(fileInput.files[0], 'reference-images');
 *
 * // Use the result in generation task
 * await createGenerationTask({
 *   providerParams: {
 *     service: 'KIE',
 *     model: 'MIDJOURNEY',
 *     fileUrls: [result.downloadUrl],
 *   },
 * });
 * ```
 */

import type { KieUploadResponse, UploadResult } from '@/types/generation';

/**
 * Uploads a file to Kie.ai temporary storage using the file-stream endpoint.
 *
 * @param file - The file to upload (File object from input)
 * @param uploadPath - Storage path for the file (default: 'user-uploads')
 * @returns Promise resolving to normalized UploadResult with download URL and expiry
 * @throws Error if upload fails or API returns error status
 *
 * @example
 * ```typescript
 * const file = new File(['content'], 'image.jpg', { type: 'image/jpeg' });
 * const result = await uploadFileToKie(file);
 * // result.downloadUrl: 'https://tempfile.redpandaai.co/xxx/user-uploads/image.jpg'
 * // result.expiresAt: Date (3 days from now)
 * ```
 */
export async function uploadFileToKie(
  file: File,
  uploadPath: string = 'user-uploads'
): Promise<UploadResult> {
  // Validate inputs
  if (!file) {
    throw new Error('File is required');
  }

  if (!uploadPath || uploadPath.trim().length === 0) {
    throw new Error('Upload path cannot be empty');
  }

  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    console.warn('KIE_API_KEY environment variable is not set');
  }

  // Prepare FormData
  const formData = new FormData();
  formData.append('file', file);
  formData.append('uploadPath', uploadPath);

  // Send request to Kie.ai file-stream-upload endpoint
  const response = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
    body: formData,
  });

  // Handle response
  if (!response.ok) {
    const errorData = (await response.json()) as Partial<KieUploadResponse>;
    const errorMsg = errorData.msg || 'Unknown error';

    throw new Error(
      `File upload to Kie.ai failed with status ${response.status}: ${errorMsg}`
    );
  }

  // Parse and normalize response
  const data = (await response.json()) as KieUploadResponse;

  return normalizeUploadResponse(data);
}

/**
 * Normalizes the Kie.ai upload response to internal UploadResult format.
 *
 * Calculates expiresAt as uploadedAt + 3 days.
 *
 * @param response - Raw response from Kie.ai API
 * @returns Normalized UploadResult with calculated expiry date
 */
function normalizeUploadResponse(response: KieUploadResponse): UploadResult {
  const uploadedDate = new Date(response.data.uploadedAt);

  // Calculate expiry: 3 days from uploadedAt
  const expiresAt = new Date(uploadedDate.getTime() + 3 * 24 * 60 * 60 * 1000);

  return {
    downloadUrl: response.data.downloadUrl,
    fileName: response.data.fileName,
    fileSize: response.data.fileSize,
    mimeType: response.data.mimeType,
    expiresAt,
  };
}

/**
 * Server Action: Upload File to Kie.ai
 *
 * Handles file uploads to Kie.ai temporary storage for use in generation tasks.
 * Uploaded files are stored for 3 days and can be referenced in img2img workflows.
 *
 * @module actions/generation/upload-file
 */

'use server';

import { uploadFileToKie } from '@/lib/generation/upload';
import type { UploadResult } from '@/types/generation';

/**
 * Action result type for type-safe error handling
 */
type ActionResult<T> = { success: true; data: T } | { success: false; error: string };

/**
 * Uploads a file to Kie.ai temporary storage for use in generation tasks
 *
 * Critical Constraints:
 * - Uploaded files expire after 3 days (automatic deletion)
 * - Use the returned downloadUrl in generation task parameters
 * - Supported for: Veo3 (imageUrls), Midjourney (fileUrls)
 *
 * Upload Path Conventions:
 * - 'user-uploads': Default for user-provided images/videos
 * - 'reference-images': For style references and img2img inputs
 * - 'thumbnails': For video thumbnails
 *
 * @param formData - FormData containing the file and optional uploadPath
 * @returns Action result with upload details or error message
 *
 * @example
 * ```typescript
 * // Client-side usage
 * const formData = new FormData();
 * formData.append('file', fileInput.files[0]);
 * formData.append('uploadPath', 'reference-images'); // Optional
 *
 * const result = await uploadGenerationFile(formData);
 *
 * if (result.success) {
 *   console.log('File uploaded:', result.data.downloadUrl);
 *   console.log('Expires at:', result.data.expiresAt);
 *
 *   // Use in generation task
 *   await createGenerationTask({
 *     promptId: 'prompt_123',
 *     providerParams: {
 *       service: 'KIE',
 *       model: 'MIDJOURNEY',
 *       taskType: 'mj_img2img',
 *       prompt: 'Transform this image',
 *       fileUrls: [result.data.downloadUrl],
 *     },
 *   });
 * }
 * ```
 *
 * @example
 * ```typescript
 * // React Component with drag-and-drop
 * function ImageUploader() {
 *   const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
 *
 *   const handleUpload = async (file: File) => {
 *     const formData = new FormData();
 *     formData.append('file', file);
 *
 *     const result = await uploadGenerationFile(formData);
 *
 *     if (result.success) {
 *       setUploadResult(result.data);
 *       alert(`File uploaded! Expires: ${result.data.expiresAt.toLocaleDateString()}`);
 *     } else {
 *       alert(`Upload failed: ${result.error}`);
 *     }
 *   };
 *
 *   return (
 *     <input
 *       type="file"
 *       onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
 *     />
 *   );
 * }
 * ```
 */
export async function uploadGenerationFile(
  formData: FormData
): Promise<ActionResult<UploadResult>> {
  try {
    // ========================================================================
    // Step 1: Extract and Validate File
    // ========================================================================

    const file = formData.get('file');

    if (!file) {
      return {
        success: false,
        error: 'File is required',
      };
    }

    if (!(file instanceof File)) {
      return {
        success: false,
        error: 'Invalid file: expected File object',
      };
    }

    // ========================================================================
    // Step 2: Extract Upload Path (Optional)
    // ========================================================================

    const uploadPath = formData.get('uploadPath');
    const uploadPathStr =
      uploadPath && typeof uploadPath === 'string' ? uploadPath : 'user-uploads';

    // ========================================================================
    // Step 3: Upload File to Kie.ai
    // ========================================================================

    const uploadResult = await uploadFileToKie(file, uploadPathStr);

    // ========================================================================
    // Step 4: Return Upload Result
    // ========================================================================

    return {
      success: true,
      data: uploadResult,
    };
  } catch (error) {
    console.error('Failed to upload file:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

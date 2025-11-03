/**
 * Generation Task Management Hooks
 *
 * React Query hooks for managing AI generation tasks (image/video).
 *
 * Features:
 * - Fetch generation tasks with auto-refetch for pending tasks
 * - Create new generation tasks
 * - Upload files to temporary storage
 *
 * @example
 * ```typescript
 * // Fetch tasks with auto-polling for pending tasks
 * const { data: tasks, isLoading } = useGenerationTasks('prompt_123');
 *
 * // Create a new generation task
 * const { mutate: createTask } = useCreateGenerationTask();
 * createTask({
 *   promptId: 'prompt_123',
 *   providerParams: {
 *     service: 'KIE',
 *     model: 'IMAGEN4',
 *     apiModel: 'google/imagen4-fast',
 *     input: { prompt: 'A beautiful sunset' }
 *   }
 * });
 *
 * // Upload a file
 * const { mutate: uploadFile } = useUploadFile();
 * uploadFile(file, {
 *   onSuccess: (result) => {
 *     console.log('File uploaded:', result.data.downloadUrl);
 *   }
 * });
 * ```
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import {
  createGenerationTask,
  uploadGenerationFile,
  type GenerationTask,
  type ActionResult,
} from '@/actions/generation';
import type { UploadResult } from '@/types/generation';

/**
 * Fetches generation tasks for a specific prompt with automatic refetching
 * for pending tasks.
 *
 * The hook automatically polls every 3 seconds when any task is in PENDING state,
 * and stops polling when all tasks are completed (SUCCESS or FAILED).
 *
 * @param promptId - The prompt ID to fetch tasks for
 * @returns Query result with generation tasks
 *
 * @example
 * ```typescript
 * function TaskList({ promptId }: { promptId: string }) {
 *   const { data: tasks, isLoading, error } = useGenerationTasks(promptId);
 *
 *   if (isLoading) return <div>Loading tasks...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <ul>
 *       {tasks?.map((task) => (
 *         <li key={task.id}>
 *           {task.model} - {task.status}
 *         </li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useGenerationTasks(promptId: string) {
  return useQuery({
    queryKey: queryKeys.generationTasks.byPrompt(promptId),
    queryFn: async (): Promise<GenerationTask[]> => {
      const response = await fetch(
        `/api/generation/tasks?promptId=${encodeURIComponent(promptId)}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch generation tasks: ${response.statusText}`
        );
      }

      return response.json();
    },
    refetchInterval: (query) => {
      const data = query.state.data;

      // Stop refetching if there's no data
      if (!data || data.length === 0) {
        return false;
      }

      // Check if any task is still pending
      const hasPendingTask = data.some((task) => task.status === 'PENDING');

      // Refetch every 3 seconds if any task is pending, otherwise stop
      return hasPendingTask ? 3000 : false;
    },
  });
}

/**
 * Creates a new generation task and invalidates the task query to trigger a refetch.
 *
 * The mutation automatically invalidates the generation tasks query for the
 * specified promptId after successful creation, triggering a refetch.
 *
 * @returns React Query mutation result
 *
 * @example
 * ```typescript
 * function GenerateButton({ promptId }: { promptId: string }) {
 *   const { mutate, isPending, error } = useCreateGenerationTask();
 *
 *   const handleGenerate = () => {
 *     mutate(
 *       {
 *         promptId,
 *         providerParams: {
 *           service: 'KIE',
 *           model: 'IMAGEN4',
 *           apiModel: 'google/imagen4-fast',
 *           input: {
 *             prompt: 'A beautiful sunset',
 *             aspect_ratio: '16:9',
 *             num_images: '4'
 *           }
 *         }
 *       },
 *       {
 *         onSuccess: (result) => {
 *           if (result.success) {
 *             console.log('Task created:', result.data.id);
 *           } else {
 *             console.error('Error:', result.error);
 *           }
 *         }
 *       }
 *     );
 *   };
 *
 *   return (
 *     <button onClick={handleGenerate} disabled={isPending}>
 *       {isPending ? 'Generating...' : 'Generate'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useCreateGenerationTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGenerationTask,
    onSuccess: (result, variables) => {
      // Invalidate the generation tasks query for this prompt to trigger refetch
      queryClient.invalidateQueries({
        queryKey: queryKeys.generationTasks.byPrompt(variables.promptId),
      });
    },
  });
}

/**
 * Uploads a file to temporary storage (Kie.ai).
 *
 * Note: Uploaded files expire after 3 days and should be used within that timeframe.
 *
 * @returns React Query mutation result
 *
 * @example
 * ```typescript
 * function FileUploader() {
 *   const { mutate: uploadFile, isPending, error } = useUploadFile();
 *
 *   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
 *     const file = e.target.files?.[0];
 *     if (!file) return;
 *
 *     uploadFile(file, {
 *       onSuccess: (result) => {
 *         if (result.success) {
 *           console.log('File uploaded:', result.data.downloadUrl);
 *           console.log('Expires at:', result.data.expiresAt);
 *         } else {
 *           console.error('Upload failed:', result.error);
 *         }
 *       }
 *     });
 *   };
 *
 *   return (
 *     <div>
 *       <input
 *         type="file"
 *         onChange={handleFileChange}
 *         disabled={isPending}
 *         accept="image/*,video/*"
 *       />
 *       {isPending && <p>Uploading...</p>}
 *       {error && <p>Error: {error.message}</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File): Promise<ActionResult<UploadResult>> => {
      const formData = new FormData();
      formData.append('file', file);

      return uploadGenerationFile(formData);
    },
  });
}

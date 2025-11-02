/**
 * useCreatePrompt Hook
 *
 * React Query mutation hook for creating prompts.
 *
 * @example
 * ```typescript
 * const { mutate, isLoading, error } = useCreatePrompt();
 * mutate({ projectId: 'proj_123', type: 'image', content: 'A sunset' });
 * ```
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { createPrompt, type CreatePromptInput } from '@/actions/prompts';

/**
 * Creates a new prompt and invalidates relevant queries.
 *
 * @returns React Query mutation result
 *
 * @example
 * ```typescript
 * function CreatePromptForm({ projectId }: { projectId: string }) {
 *   const { mutate, isLoading, error } = useCreatePrompt();
 *
 *   const handleSubmit = (content: string) => {
 *     mutate(
 *       {
 *         projectId,
 *         type: 'image',
 *         content,
 *       },
 *       {
 *         onSuccess: (result) => {
 *           if (result.success) {
 *             console.log('Created:', result.data);
 *           } else {
 *             console.error('Error:', result.error);
 *           }
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <form onSubmit={(e) => {
 *       e.preventDefault();
 *       const formData = new FormData(e.currentTarget);
 *       handleSubmit(formData.get('content') as string);
 *     }}>
 *       <input name="content" required />
 *       <button type="submit" disabled={isLoading}>
 *         Create Prompt
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export function useCreatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPrompt,
    onSuccess: () => {
      // Invalidate all prompts queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.all });
    },
  });
}

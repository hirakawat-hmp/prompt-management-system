/**
 * useUpdatePrompt Hook
 *
 * React Query mutation hook for updating prompts.
 *
 * @example
 * ```typescript
 * const { mutate, isLoading, error } = useUpdatePrompt();
 * mutate({ promptId: 'prompt_1', data: { userFeedback: 'Too bright' } });
 * ```
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { updatePrompt, type UpdatePromptInput } from '@/actions/prompts';

/**
 * Variables for updating a prompt
 */
export interface UseUpdatePromptVariables {
  /** The ID of the prompt to update */
  promptId: string;
  /** The fields to update */
  data: UpdatePromptInput;
}

/**
 * Updates a prompt's feedback or AI comment and invalidates relevant queries.
 *
 * @returns React Query mutation result
 *
 * @example
 * ```typescript
 * function PromptFeedback({ promptId }: { promptId: string }) {
 *   const { mutate, isLoading, error } = useUpdatePrompt();
 *   const [feedback, setFeedback] = useState('');
 *
 *   const handleSubmit = () => {
 *     mutate(
 *       {
 *         promptId,
 *         data: { userFeedback: feedback },
 *       },
 *       {
 *         onSuccess: (result) => {
 *           if (result.success) {
 *             console.log('Updated:', result.data);
 *             setFeedback('');
 *           } else {
 *             console.error('Error:', result.error);
 *           }
 *         },
 *       }
 *     );
 *   };
 *
 *   return (
 *     <div>
 *       <textarea
 *         value={feedback}
 *         onChange={(e) => setFeedback(e.target.value)}
 *         placeholder="Your feedback..."
 *       />
 *       <button onClick={handleSubmit} disabled={isLoading}>
 *         Submit Feedback
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUpdatePrompt() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ promptId, data }: UseUpdatePromptVariables) => {
      return updatePrompt(promptId, data);
    },
    onSuccess: () => {
      // Invalidate all prompts queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: queryKeys.prompts.all });
    },
  });
}

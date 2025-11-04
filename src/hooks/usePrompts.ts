/**
 * usePrompts Hook
 *
 * React Query hook for fetching prompts by project ID.
 *
 * @example
 * ```typescript
 * const { data: prompts, isLoading, error } = usePrompts('proj_123');
 * ```
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import type { Prompt } from '@/types/prompt';

/**
 * Fetches prompts for a specific project.
 *
 * @param projectId - The project ID to fetch prompts for
 * @returns React Query result with prompts data
 *
 * @example
 * ```typescript
 * function PromptList({ projectId }: { projectId: string }) {
 *   const { data: prompts, isLoading, error } = usePrompts(projectId);
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <ul>
 *       {prompts?.map(prompt => (
 *         <li key={prompt.id}>{prompt.content}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function usePrompts(projectId: string) {
  return useQuery({
    queryKey: queryKeys.prompts.byProject(projectId),
    queryFn: async (): Promise<Prompt[]> => {
      const response = await fetch(`/api/prompts?projectId=${projectId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch prompts');
      }

      return response.json();
    },
    // Only run query if projectId is provided
    enabled: !!projectId && projectId.trim() !== '',
    // Refetch every 10 seconds to detect new assets from completed generation tasks
    // This ensures assets appear automatically after polling completes
    refetchInterval: 10000,
    // Continue polling even when window is not focused
    refetchIntervalInBackground: true,
  });
}

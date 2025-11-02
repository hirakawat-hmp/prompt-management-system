/**
 * useCreateProject Hook
 *
 * React Query mutation hook for creating projects with Mastra integration.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { createProject } from '@/actions/projects';
import type { Project } from '@/types/project';

/**
 * Action result type from server actions
 */
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Creates a new project with Mastra thread integration.
 *
 * The mutation automatically invalidates the projects query on successful creation,
 * triggering a refetch of the projects list. Note that server actions return
 * ActionResult objects rather than throwing errors, so check `result.success`
 * to determine if the operation succeeded.
 *
 * @returns Mutation object with `mutate`, `isPending`, `isSuccess`, and `data`
 *
 * @example
 * ```typescript
 * function CreateProjectForm() {
 *   const createProjectMutation = useCreateProject();
 *
 *   const handleSubmit = (name: string) => {
 *     createProjectMutation.mutate(name, {
 *       onSuccess: (result) => {
 *         if (result.success) {
 *           console.log('Created:', result.data);
 *           router.push(`/projects/${result.data.id}`);
 *         } else {
 *           console.error('Error:', result.error);
 *         }
 *       },
 *     });
 *   };
 *
 *   if (createProjectMutation.isPending) {
 *     return <div>Creating project...</div>;
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation<ActionResult<Project>, Error, string>({
    mutationFn: createProject,
    onSuccess: (result) => {
      // Only invalidate queries if creation was successful
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      }
    },
  });
}

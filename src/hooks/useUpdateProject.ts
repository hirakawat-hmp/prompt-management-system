/**
 * useUpdateProject Hook
 *
 * React Query mutation hook for updating projects with optimistic updates.
 */

'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import { updateProject } from '@/actions/projects';
import type { Project } from '@/types/project';

/**
 * Action result type from server actions
 */
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Update project mutation variables
 */
interface UpdateProjectVariables {
  id: string;
  name: string;
}

/**
 * Updates an existing project's name.
 *
 * The mutation automatically invalidates the projects query on successful update,
 * triggering a refetch of the projects list. Supports optimistic updates to provide
 * immediate UI feedback before server confirmation.
 *
 * @returns Mutation object with `mutate`, `isPending`, `isSuccess`, and `data`
 *
 * @example
 * ```typescript
 * function EditProjectForm({ project }: { project: Project }) {
 *   const updateProjectMutation = useUpdateProject();
 *
 *   const handleSubmit = (newName: string) => {
 *     updateProjectMutation.mutate(
 *       { id: project.id, name: newName },
 *       {
 *         onSuccess: (result) => {
 *           if (result.success) {
 *             console.log('Updated:', result.data);
 *           } else {
 *             console.error('Error:', result.error);
 *           }
 *         },
 *       }
 *     );
 *   };
 *
 *   if (updateProjectMutation.isPending) {
 *     return <div>Updating project...</div>;
 *   }
 *
 *   return <form onSubmit={handleSubmit}>...</form>;
 * }
 * ```
 *
 * @example
 * ```typescript
 * // With optimistic updates (advanced)
 * const updateProjectMutation = useUpdateProject();
 *
 * updateProjectMutation.mutate(
 *   { id: 'proj_123', name: 'New Name' },
 *   {
 *     // The mutation will handle optimistic updates internally
 *     onSuccess: (result) => {
 *       if (result.success) {
 *         toast.success('Project updated!');
 *       }
 *     },
 *   }
 * );
 * ```
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation<
    ActionResult<Project>,
    Error,
    UpdateProjectVariables
  >({
    mutationFn: ({ id, name }) => updateProject(id, name),
    onSuccess: (result) => {
      // Only invalidate queries if update was successful
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      }
    },
  });
}

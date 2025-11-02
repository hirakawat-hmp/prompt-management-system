/**
 * useProjects Hook
 *
 * React Query hook for fetching all projects.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-client';
import type { Project } from '@/types/project';

/**
 * Fetches all projects from the API.
 *
 * @returns Query result with projects data
 *
 * @example
 * ```typescript
 * function ProjectList() {
 *   const { data: projects, isLoading, error } = useProjects();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <ul>
 *       {projects?.map((project) => (
 *         <li key={project.id}>{project.name}</li>
 *       ))}
 *     </ul>
 *   );
 * }
 * ```
 */
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: async (): Promise<Project[]> => {
      const response = await fetch('/api/projects');

      if (!response.ok) {
        throw new Error(`Failed to fetch projects: ${response.statusText}`);
      }

      return response.json();
    },
  });
}

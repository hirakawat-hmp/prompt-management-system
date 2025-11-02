/**
 * React Query Client Configuration
 *
 * Configures global settings for React Query including:
 * - Default query options (staleTime, cacheTime, retry logic)
 * - Default mutation options
 * - Error handling
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Creates a new QueryClient instance with project-specific defaults.
 *
 * @returns Configured QueryClient instance
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Consider data fresh for 5 seconds
        staleTime: 5 * 1000,

        // Keep unused data in cache for 5 minutes
        gcTime: 5 * 60 * 1000,

        // Retry failed queries once
        retry: 1,

        // Don't refetch on window focus in development
        refetchOnWindowFocus: process.env.NODE_ENV === 'production',

        // Don't refetch on mount if data is fresh
        refetchOnMount: false,
      },
      mutations: {
        // Retry failed mutations once
        retry: 1,
      },
    },
  });
}

/**
 * Query keys for type-safe query invalidation
 *
 * @example
 * ```typescript
 * // Invalidate all project queries
 * queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
 *
 * // Invalidate prompts for specific project
 * queryClient.invalidateQueries({ queryKey: queryKeys.prompts.byProject(projectId) });
 * ```
 */
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    detail: (id: string) => ['projects', id] as const,
  },
  prompts: {
    all: ['prompts'] as const,
    byProject: (projectId: string) => ['prompts', projectId] as const,
    detail: (id: string) => ['prompts', id] as const,
  },
} as const;

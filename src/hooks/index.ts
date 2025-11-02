/**
 * React Query Hooks
 *
 * Centralized exports for all React Query hooks in the application.
 */

// Project hooks
export { useProjects } from './useProjects';
export { useCreateProject } from './useCreateProject';
export { useUpdateProject } from './useUpdateProject';

// Prompt hooks
export { usePrompts } from './usePrompts';
export { useCreatePrompt } from './useCreatePrompt';
export { useUpdatePrompt, type UseUpdatePromptVariables } from './useUpdatePrompt';

// Re-export types for convenience
export type { CreatePromptInput, UpdatePromptInput } from '@/actions/prompts';

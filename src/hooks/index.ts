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

// Generation task hooks
export {
  useGenerationTasks,
  useCreateGenerationTask,
  useUploadFile,
} from './use-generation-tasks';

// Re-export types for convenience
export type { CreatePromptInput, UpdatePromptInput } from '@/actions/prompts';
export type {
  CreateGenerationTaskInput,
  GenerationTask,
  ActionResult,
} from '@/actions/generation';

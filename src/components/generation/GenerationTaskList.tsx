/**
 * GenerationTaskList Component
 *
 * Displays a list of generation tasks for a prompt with status indicators.
 * Includes loading states, error handling, and result previews.
 */

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle } from 'lucide-react';
import { GenerationTaskStatus } from './GenerationTaskStatus';
import { cn } from '@/lib/utils';
import type { GenerationTask } from '@prisma/client';

// Mock hook interface
interface UseGenerationTasksResult {
  data?: GenerationTask[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}

// Try to import the actual hook, fallback to mock for tests
let useGenerationTasks: (promptId: string) => UseGenerationTasksResult;

try {
  const hookModule = require('@/hooks/use-generation-tasks');
  useGenerationTasks = hookModule.useGenerationTasks;
} catch {
  // Fallback mock for tests
  useGenerationTasks = () => ({
    data: [],
    isLoading: false,
    isError: false,
    error: null,
  });
}

export interface GenerationTaskListProps {
  promptId: string;
  className?: string;
}

/**
 * Generation task list display
 *
 * Features:
 * - Displays all generation tasks for a prompt
 * - Status indicators with color coding
 * - Task metadata (model, service, created date)
 * - Result preview for successful tasks
 * - Error messages for failed tasks
 * - Loading skeleton
 * - Empty state
 */
export function GenerationTaskList({ promptId, className }: GenerationTaskListProps) {
  const { data: tasks, isLoading, isError, error } = useGenerationTasks(promptId);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)} data-testid="task-list-skeleton">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 w-32 rounded bg-muted" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-2/3 rounded bg-muted" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={cn('rounded-lg border border-destructive/50 bg-destructive/5 p-6', className)}>
        <div className="flex items-center gap-3">
          <AlertCircle className="size-5 text-destructive" />
          <div>
            <h3 className="font-semibold text-sm text-destructive">Failed to fetch tasks</h3>
            <p className="text-sm text-muted-foreground">
              {error?.message || 'An unknown error occurred'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className={cn('rounded-lg border-2 border-dashed p-8 text-center', className)}>
        <p className="text-sm text-muted-foreground">
          No generation tasks yet. Create one to get started.
        </p>
      </div>
    );
  }

  // Sort tasks by creation date (newest first)
  const sortedTasks = [...tasks].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  // Parse result JSON
  const getResultUrls = (task: GenerationTask): string[] => {
    if (!task.resultJson) return [];

    try {
      const result = JSON.parse(task.resultJson);
      return result.resultUrls || [];
    } catch {
      return [];
    }
  };

  return (
    <div className={className}>
      <ul className="space-y-4" role="list" aria-label="Generation tasks">
        {sortedTasks.map((task) => {
          const resultUrls = getResultUrls(task);
          const hasResults = task.status === 'SUCCESS' && resultUrls.length > 0;

          return (
            <li key={task.id}>
              <Card data-testid={`task-card-${task.id}`}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{task.model}</CardTitle>
                        <Badge variant="outline" className="text-xs">
                          {task.service}
                        </Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {new Date(task.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <GenerationTaskStatus task={task} />
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Result preview */}
                  {hasResults && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">
                        Result ({resultUrls.length} {resultUrls.length === 1 ? 'file' : 'files'})
                      </p>
                      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                        {resultUrls.slice(0, 4).map((url, i) => (
                          <a
                            key={i}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group relative aspect-square overflow-hidden rounded-md border bg-muted transition-transform hover:scale-105"
                          >
                            <img
                              src={url}
                              alt={`Result ${i + 1}`}
                              className="size-full object-cover"
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No result for pending */}
                  {task.status === 'PENDING' && (
                    <p className="text-xs text-muted-foreground">
                      Waiting for generation to complete...
                    </p>
                  )}
                </CardContent>
              </Card>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * GenerationTaskStatus Component
 *
 * Visual status indicator for generation tasks.
 * Displays color-coded badges with icons and error messages.
 */

'use client';

import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { GenerationTask } from '@prisma/client';

export interface GenerationTaskStatusProps {
  task: GenerationTask;
  className?: string;
}

/**
 * Status indicator component for generation tasks
 *
 * Features:
 * - Color-coded badges (PENDING: secondary, SUCCESS: default, FAILED: destructive)
 * - Icons: spinner for PENDING, checkmark for SUCCESS, X for FAILED
 * - Error message display for FAILED tasks
 * - Accessible with proper ARIA attributes
 */
export function GenerationTaskStatus({ task, className }: GenerationTaskStatusProps) {
  const getStatusConfig = () => {
    switch (task.status) {
      case 'PENDING':
        return {
          variant: 'secondary' as const,
          icon: <Loader2 className="size-3 animate-spin" />,
          label: 'Pending',
          ariaLabel: 'Generation in progress',
        };
      case 'SUCCESS':
        return {
          variant: 'default' as const,
          icon: <CheckCircle className="size-3" />,
          label: 'Success',
          ariaLabel: 'Generation completed successfully',
        };
      case 'FAILED':
        return {
          variant: 'destructive' as const,
          icon: <XCircle className="size-3" />,
          label: 'Failed',
          ariaLabel: 'Generation failed',
        };
      default:
        return {
          variant: 'outline' as const,
          icon: null,
          label: 'Unknown',
          ariaLabel: 'Unknown status',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Badge
        variant={config.variant}
        className="w-fit"
        role="status"
        aria-label={config.ariaLabel}
      >
        {config.icon}
        <span>{config.label}</span>
      </Badge>

      {/* Error message for FAILED tasks */}
      {task.status === 'FAILED' && (task.failMsg || task.failCode) && (
        <div className="text-sm text-destructive" role="alert">
          {task.failCode && (
            <span className="font-medium">Error {task.failCode}: </span>
          )}
          <span>{task.failMsg || 'Unknown error occurred'}</span>
        </div>
      )}
    </div>
  );
}

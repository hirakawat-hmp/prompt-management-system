/**
 * GenerationTaskDashboard component
 *
 * Displays all generation tasks across all prompts in a project.
 * Provides filtering by service, model, and status.
 */

'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Loader2, ExternalLink } from 'lucide-react';
import { usePrompts } from '@/hooks';
import { useGenerationTasks } from '@/hooks/use-generation-tasks';
import type { GenerationTask } from '@prisma/client';
import { cn } from '@/lib/utils';

export interface GenerationTaskDashboardProps {
  projectId: string;
  onPromptSelect?: (promptId: string) => void;
}

/**
 * Format a date for display
 */
function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}

/**
 * Single task card component
 */
function TaskCard({
  task,
  promptContent,
  onPromptClick,
}: {
  task: GenerationTask & { prompt?: { id: string; content: string } };
  promptContent: string;
  onPromptClick?: () => void;
}) {
  const statusIcon = {
    PENDING: <Loader2 className="h-4 w-4 text-orange-500 animate-spin" />,
    SUCCESS: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    FAILED: <XCircle className="h-4 w-4 text-red-500" />,
  }[task.status];

  const statusColor = {
    PENDING: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    SUCCESS: 'bg-green-500/10 text-green-500 border-green-500/20',
    FAILED: 'bg-red-500/10 text-red-500 border-red-500/20',
  }[task.status];

  return (
    <Card className="hover:bg-muted/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {statusIcon}
            <div>
              <CardTitle className="text-sm font-medium">
                {task.service} • {task.model}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {formatDate(task.createdAt)}
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={cn('text-xs', statusColor)}>
            {task.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {/* Prompt preview */}
        <div className="text-xs text-muted-foreground line-clamp-2">
          {promptContent}
        </div>

        {/* Error message if failed */}
        {task.status === 'FAILED' && task.failMsg && (
          <div className="text-xs text-red-500 bg-red-500/5 border border-red-500/20 rounded p-2">
            <span className="font-semibold">Error:</span> {task.failMsg}
          </div>
        )}

        {/* Link to prompt */}
        {onPromptClick && (
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs"
            onClick={onPromptClick}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Prompt
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Main dashboard component
 */
export function GenerationTaskDashboard({
  projectId,
  onPromptSelect,
}: GenerationTaskDashboardProps) {
  const [serviceFilter, setServiceFilter] = useState<string>('all');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Fetch all prompts for the project
  const { data: prompts = [] } = usePrompts(projectId);

  // Collect all tasks from all prompts
  const allTasks = useMemo(() => {
    const tasks: Array<GenerationTask & { promptContent: string; promptId: string }> = [];

    prompts.forEach((prompt) => {
      // We can't use hooks in a loop, so we'll need to use a different approach
      // For now, we'll show a simplified version that fetches tasks per prompt
      // In a real implementation, we might want a single API endpoint that returns all tasks
    });

    return tasks;
  }, [prompts]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      if (serviceFilter !== 'all' && task.service !== serviceFilter) return false;
      if (modelFilter !== 'all' && task.model !== modelFilter) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      return true;
    });
  }, [allTasks, serviceFilter, modelFilter, statusFilter]);

  // For now, we'll use a simpler approach: show prompts with their tasks
  return (
    <div className="h-full p-6 overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle>Generation Tasks</CardTitle>
          <CardDescription>
            View and filter all generation tasks for this project
          </CardDescription>

          {/* Filters */}
          <div className="flex gap-2 mt-4">
            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="KIE">Kie.ai</SelectItem>
                <SelectItem value="GOOGLE">Google AI</SelectItem>
                <SelectItem value="AZURE">Azure</SelectItem>
                <SelectItem value="OPENAI">OpenAI</SelectItem>
              </SelectContent>
            </Select>

            <Select value={modelFilter} onValueChange={setModelFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Models</SelectItem>
                <SelectItem value="IMAGEN4">Imagen4</SelectItem>
                <SelectItem value="VEO3">Veo3</SelectItem>
                <SelectItem value="MIDJOURNEY">Midjourney</SelectItem>
                <SelectItem value="SORA2">Sora2</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="FAILED">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {/* Prompt-based task list */}
          <div className="space-y-6">
            {prompts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No prompts in this project yet
              </div>
            ) : (
              prompts.map((prompt) => (
                <PromptTaskSection
                  key={prompt.id}
                  promptId={prompt.id}
                  promptContent={prompt.content}
                  serviceFilter={serviceFilter}
                  modelFilter={modelFilter}
                  statusFilter={statusFilter}
                  onPromptSelect={onPromptSelect}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Section showing tasks for a single prompt
 */
function PromptTaskSection({
  promptId,
  promptContent,
  serviceFilter,
  modelFilter,
  statusFilter,
  onPromptSelect,
}: {
  promptId: string;
  promptContent: string;
  serviceFilter: string;
  modelFilter: string;
  statusFilter: string;
  onPromptSelect?: (promptId: string) => void;
}) {
  const { data: tasks = [] } = useGenerationTasks(promptId);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (serviceFilter !== 'all' && task.service !== serviceFilter) return false;
      if (modelFilter !== 'all' && task.model !== modelFilter) return false;
      if (statusFilter !== 'all' && task.status !== statusFilter) return false;
      return true;
    });
  }, [tasks, serviceFilter, modelFilter, statusFilter]);

  // Don't show if no tasks match filters
  if (filteredTasks.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-muted-foreground">
        Prompt: {promptContent.slice(0, 60)}
        {promptContent.length > 60 && '...'}
      </h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            promptContent={promptContent}
            onPromptClick={
              onPromptSelect ? () => onPromptSelect(promptId) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
}

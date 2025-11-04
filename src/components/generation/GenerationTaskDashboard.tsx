/**
 * GenerationTaskDashboard component
 *
 * Displays all generation tasks across all prompts in a project.
 * Provides filtering by service, model, and status in a compact table format.
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
 * Get status icon component
 */
function getStatusIcon(status: GenerationTask['status']) {
  switch (status) {
    case 'PENDING':
      return <Loader2 className="h-3.5 w-3.5 text-orange-500 animate-spin" />;
    case 'SUCCESS':
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />;
    case 'FAILED':
      return <XCircle className="h-3.5 w-3.5 text-red-500" />;
  }
}

/**
 * Get status badge color classes
 */
function getStatusColor(status: GenerationTask['status']) {
  switch (status) {
    case 'PENDING':
      return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    case 'SUCCESS':
      return 'bg-green-500/10 text-green-500 border-green-500/20';
    case 'FAILED':
      return 'bg-red-500/10 text-red-500 border-red-500/20';
  }
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
          {prompts.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              No prompts in this project yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead>Model</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="max-w-[300px]">Prompt</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prompts.map((prompt) => (
                    <PromptTaskSection
                      key={prompt.id}
                      promptId={prompt.id}
                      promptContent={prompt.content}
                      serviceFilter={serviceFilter}
                      modelFilter={modelFilter}
                      statusFilter={statusFilter}
                      onPromptSelect={onPromptSelect}
                    />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Section showing tasks for a single prompt in table format
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
    <>
      {filteredTasks.map((task) => (
        <TableRow key={task.id} className="hover:bg-muted/50">
          {/* Status Icon + Badge */}
          <TableCell className="w-[100px]">
            <div className="flex items-center gap-2">
              {getStatusIcon(task.status)}
              <Badge variant="outline" className={cn('text-xs', getStatusColor(task.status))}>
                {task.status}
              </Badge>
            </div>
          </TableCell>

          {/* Model */}
          <TableCell className="font-medium">{task.model}</TableCell>

          {/* Service */}
          <TableCell className="text-muted-foreground">{task.service}</TableCell>

          {/* Created Date */}
          <TableCell className="text-muted-foreground whitespace-nowrap">
            {formatDate(task.createdAt)}
          </TableCell>

          {/* Prompt Preview */}
          <TableCell className="max-w-[300px]">
            <div className="truncate text-sm" title={promptContent}>
              {promptContent}
            </div>
            {/* Show error message on second line if failed */}
            {task.status === 'FAILED' && task.failMsg && (
              <div className="text-xs text-red-500 mt-1 truncate" title={task.failMsg}>
                Error: {task.failMsg}
              </div>
            )}
          </TableCell>

          {/* Actions */}
          <TableCell className="text-right">
            {onPromptSelect && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2"
                onClick={() => onPromptSelect(promptId)}
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1" />
                View
              </Button>
            )}
          </TableCell>
        </TableRow>
      ))}
    </>
  );
}

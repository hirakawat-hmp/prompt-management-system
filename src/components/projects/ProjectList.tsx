'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useProjects, useCreateProject } from '@/hooks';
import type { ProjectListProps } from '@/types';

/**
 * Format a date for display
 * Handles both Date objects and ISO string dates from API
 */
function formatDate(date: Date | string): string {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diffTime = Math.abs(now.getTime() - dateObj.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

/**
 * ProjectList component displays a list of projects with selection support.
 *
 * Features:
 * - Fetch and display all projects from API using React Query
 * - Show project name, creation date, and prompt count
 * - Highlight selected project
 * - Support keyboard navigation
 * - Handle loading, error, and empty states
 * - Create new projects with Mastra integration
 * - Scrollable container for many projects
 *
 * @param props - Component props
 * @param props.selectedProjectId - ID of the currently selected project
 * @param props.onSelectProject - Callback when a project is selected
 *
 * @example
 * ```tsx
 * <ProjectList
 *   selectedProjectId="proj_123"
 *   onSelectProject={(id) => console.log('Selected:', id)}
 * />
 * ```
 */
export function ProjectList({
  selectedProjectId,
  onSelectProject,
}: ProjectListProps) {
  // Fetch projects using React Query
  const { data: projects, isLoading, error } = useProjects();

  // Create project mutation
  const createProject = useCreateProject();

  // Popover state
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [validationError, setValidationError] = useState('');

  /**
   * Handle project card click
   */
  const handleProjectClick = (projectId: string) => {
    onSelectProject(projectId);
  };

  /**
   * Handle keyboard navigation on project cards
   */
  const handleKeyDown = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectProject(projectId);
    }
  };

  /**
   * Handle create new project
   */
  const handleCreateProject = () => {
    // Validation
    setValidationError('');

    if (!projectName.trim()) {
      setValidationError('Project name is required');
      return;
    }

    if (projectName.length > 255) {
      setValidationError('Project name must be less than 255 characters');
      return;
    }

    createProject.mutate(projectName, {
      onSuccess: (result) => {
        if (result.success) {
          // Automatically select the newly created project
          onSelectProject(result.data.id);
          // Close popover and reset form
          setIsPopoverOpen(false);
          setProjectName('');
          setValidationError('');
        } else {
          setValidationError(result.error);
        }
      },
      onError: (error) => {
        setValidationError(error instanceof Error ? error.message : 'Failed to create project');
      },
    });
  };

  /**
   * Handle popover cancel
   */
  const handleCancel = () => {
    setIsPopoverOpen(false);
    setProjectName('');
    setValidationError('');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold">Logo</h1>
        </div>
        <div className="flex items-center justify-center flex-1">
          <p className="text-muted-foreground">Loading projects...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="border-b border-border pb-4">
          <h1 className="text-2xl font-bold">Logo</h1>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center">
            <p className="text-destructive font-medium">Failed to fetch projects</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Logo Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold">Logo</h1>
      </div>

      {/* New Project button - full width with popover */}
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            size="default"
            variant="default"
            aria-label="New Project"
            className="w-full"
          >
            <Plus />
            New Project
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80" align="start">
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Create Project</h4>
              <p className="text-sm text-muted-foreground">
                Enter a name for your new project
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input
                id="project-name"
                placeholder="My New Project"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateProject();
                  } else if (e.key === 'Escape') {
                    handleCancel();
                  }
                }}
                autoFocus
              />
              {validationError && (
                <p className="text-sm text-destructive" role="alert">
                  {validationError}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleCreateProject}
                disabled={createProject.isPending}
              >
                {createProject.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Project list container - scrollable */}
      <div
        data-testid="project-list-container"
        className="flex-1 overflow-y-auto pr-2 -mr-2"
      >
        {!projects || projects.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center gap-4 py-12 text-center">
            <div className="text-muted-foreground">
              <p className="text-sm">No projects yet</p>
              <p className="text-xs">Create your first project to get started</p>
            </div>
          </div>
        ) : (
          // Project cards
          <div className="space-y-1.5">
            {projects.map((project) => {
              const isSelected = project.id === selectedProjectId;
              const promptCount = project._count?.prompts ?? 0;

              return (
                <Card
                  key={project.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleProjectClick(project.id)}
                  onKeyDown={(e) => handleKeyDown(e, project.id)}
                  className={cn(
                    'cursor-pointer transition-all p-2',
                    'hover:border-primary/50 hover:shadow-md',
                    isSelected && 'border-primary ring-2 ring-primary/20',
                  )}
                >
                  <CardHeader className="px-2 py-0.5 space-y-0.5">
                    <CardTitle className="text-sm leading-tight">{project.name}</CardTitle>
                    <CardDescription className="flex items-center justify-between text-[11px] leading-tight">
                      <span>{formatDate(project.createdAt)}</span>
                      <span>
                        {promptCount} {promptCount === 1 ? 'prompt' : 'prompts'}
                      </span>
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

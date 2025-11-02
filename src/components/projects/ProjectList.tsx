import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import type { ProjectListProps } from '@/types';

/**
 * Format a date for display
 */
function formatDate(date: Date): string {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return 'Today';
  } else if (diffDays === 1) {
    return 'Yesterday';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else {
    return date.toLocaleDateString('en-US', {
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
 * - Display all projects in card format
 * - Show project name, creation date, and prompt count
 * - Highlight selected project
 * - Support keyboard navigation
 * - Empty state handling
 * - Scrollable container for many projects
 */
export function ProjectList({
  projects,
  selectedProjectId,
  onSelectProject,
  onCreateProject,
}: ProjectListProps) {
  const handleProjectClick = (projectId: string) => {
    onSelectProject(projectId);
  };

  const handleKeyDown = (e: React.KeyboardEvent, projectId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectProject(projectId);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 p-4">
      {/* Logo Header */}
      <div className="border-b border-border pb-4">
        <h1 className="text-2xl font-bold">Logo</h1>
      </div>

      {/* New Project button - full width */}
      <Button
        onClick={onCreateProject}
        size="default"
        variant="default"
        aria-label="New Project"
        className="w-full"
      >
        <Plus />
        New Project
      </Button>

      {/* Project list container - scrollable */}
      <div
        data-testid="project-list-container"
        className="flex-1 overflow-y-auto pr-2 -mr-2"
      >
        {projects.length === 0 ? (
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

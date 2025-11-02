import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ProjectList } from './ProjectList';
import type { Project } from './types';

describe('ProjectList', () => {
  const mockProjects: Project[] = [
    {
      id: '1',
      name: 'Test Project 1',
      createdAt: new Date('2025-01-01'),
      _count: {
        prompts: 5,
      },
    },
    {
      id: '2',
      name: 'Test Project 2',
      createdAt: new Date('2025-01-02'),
      _count: {
        prompts: 3,
      },
    },
    {
      id: '3',
      name: 'Test Project 3',
      createdAt: new Date('2025-01-03'),
      _count: {
        prompts: 0,
      },
    },
  ];

  it('should render all projects', () => {
    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={mockProjects}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    // All project names should be visible
    expect(screen.getByText('Test Project 1')).toBeInTheDocument();
    expect(screen.getByText('Test Project 2')).toBeInTheDocument();
    expect(screen.getByText('Test Project 3')).toBeInTheDocument();
  });

  it('should display project metadata (created date and prompt count)', () => {
    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={mockProjects}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    // Check for prompt counts
    expect(screen.getByText(/5.*prompts?/i)).toBeInTheDocument();
    expect(screen.getByText(/3.*prompts?/i)).toBeInTheDocument();
    expect(screen.getByText(/0.*prompts?/i)).toBeInTheDocument();
  });

  it('should call onSelectProject when a project card is clicked', async () => {
    const user = userEvent.setup();
    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={mockProjects}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    // Click the first project
    const projectCard = screen.getByText('Test Project 1').closest('[role="button"]');
    expect(projectCard).toBeInTheDocument();

    if (projectCard) {
      await user.click(projectCard);
      expect(onSelectProject).toHaveBeenCalledWith('1');
    }
  });

  it('should highlight selected project with primary border', () => {
    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={mockProjects}
        selectedProjectId="2"
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    const selectedCard = screen.getByText('Test Project 2').closest('[role="button"]');
    expect(selectedCard).toHaveClass('border-primary');
  });

  it('should render the "New Project" button', () => {
    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={mockProjects}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    const newButton = screen.getByRole('button', { name: /new project/i });
    expect(newButton).toBeInTheDocument();
  });

  it('should call onCreateProject when "New Project" button is clicked', async () => {
    const user = userEvent.setup();
    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={mockProjects}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    const newButton = screen.getByRole('button', { name: /new project/i });
    await user.click(newButton);
    expect(onCreateProject).toHaveBeenCalledOnce();
  });

  it('should display empty state when no projects exist', () => {
    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={[]}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    // Empty state message should be visible
    expect(screen.getByText(/no projects/i)).toBeInTheDocument();

    // New Project button should still be visible
    expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();
  });

  it('should be scrollable with many projects', () => {
    const manyProjects = Array.from({ length: 20 }, (_, i) => ({
      id: `${i + 1}`,
      name: `Project ${i + 1}`,
      createdAt: new Date(`2025-01-${(i % 28) + 1}`),
      _count: {
        prompts: i,
      },
    }));

    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    const { container } = render(
      <ProjectList
        projects={manyProjects}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    // Container should have overflow styles
    const listContainer = container.querySelector('[data-testid="project-list-container"]');
    expect(listContainer).toHaveClass('overflow-y-auto');
  });

  it('should apply hover effect on project cards', () => {
    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={mockProjects}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    const projectCard = screen.getByText('Test Project 1').closest('[role="button"]');
    expect(projectCard).toHaveClass('hover:border-primary/50');
  });

  it('should handle projects without prompt counts gracefully', () => {
    const projectsWithoutCounts = [
      {
        id: '1',
        name: 'Project Without Counts',
        createdAt: new Date('2025-01-01'),
      },
    ];

    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={projectsWithoutCounts}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    expect(screen.getByText('Project Without Counts')).toBeInTheDocument();
    // Should show 0 prompts when _count is missing
    expect(screen.getByText(/0.*prompts?/i)).toBeInTheDocument();
  });

  it('should format dates in a readable format', () => {
    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={mockProjects}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    // Should display formatted dates (not raw Date objects)
    // Looking for any date-like text pattern
    const dateElements = screen.getAllByText(/\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i);
    expect(dateElements.length).toBeGreaterThan(0);
  });

  it('should have proper keyboard accessibility', async () => {
    const user = userEvent.setup();
    const onSelectProject = vi.fn();
    const onCreateProject = vi.fn();

    render(
      <ProjectList
        projects={mockProjects}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
    );

    const projectCard = screen.getByText('Test Project 1').closest('[role="button"]') as HTMLElement;

    if (projectCard) {
      // Focus the card
      projectCard.focus();
      expect(projectCard).toHaveFocus();

      // Press Enter
      await user.keyboard('{Enter}');
      expect(onSelectProject).toHaveBeenCalledWith('1');
    }
  });
});

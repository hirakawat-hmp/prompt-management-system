import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ProjectList } from './ProjectList';
import * as hooks from '@/hooks';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import type { Project } from './types';

// Mock the hooks module
vi.mock('@/hooks', () => ({
  useProjects: vi.fn(),
  useCreateProject: vi.fn(),
}));

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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading state while fetching projects', () => {
      vi.mocked(hooks.useProjects).mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false,
      } as UseQueryResult<Project[], Error>);

      vi.mocked(hooks.useCreateProject).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as UseMutationResult);

      render(<ProjectList selectedProjectId={undefined} onSelectProject={vi.fn()} />);

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message when fetch fails', () => {
      const errorMessage = 'Network error occurred';
      vi.mocked(hooks.useProjects).mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error(errorMessage),
        isSuccess: false,
        isError: true,
      } as UseQueryResult<Project[], Error>);

      vi.mocked(hooks.useCreateProject).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as UseMutationResult);

      render(<ProjectList selectedProjectId={undefined} onSelectProject={vi.fn()} />);

      // Check for error heading
      expect(screen.getByText('Failed to fetch projects')).toBeInTheDocument();
      // Check for specific error message
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no projects exist', () => {
      vi.mocked(hooks.useProjects).mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as UseQueryResult<Project[], Error>);

      vi.mocked(hooks.useCreateProject).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as UseMutationResult);

      render(<ProjectList selectedProjectId={undefined} onSelectProject={vi.fn()} />);

      // Empty state message should be visible
      expect(screen.getByText(/no projects/i)).toBeInTheDocument();

      // New Project button should still be visible
      expect(screen.getByRole('button', { name: /new project/i })).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      vi.mocked(hooks.useProjects).mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as UseQueryResult<Project[], Error>);

      vi.mocked(hooks.useCreateProject).mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      } as unknown as UseMutationResult);
    });

    it('should render all projects from API', () => {
      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

      // All project names should be visible
      expect(screen.getByText('Test Project 1')).toBeInTheDocument();
      expect(screen.getByText('Test Project 2')).toBeInTheDocument();
      expect(screen.getByText('Test Project 3')).toBeInTheDocument();
    });

    it('should display project metadata (created date and prompt count)', () => {
      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

      // Check for prompt counts
      expect(screen.getByText(/5.*prompts?/i)).toBeInTheDocument();
      expect(screen.getByText(/3.*prompts?/i)).toBeInTheDocument();
      expect(screen.getByText(/0.*prompts?/i)).toBeInTheDocument();
    });

    it('should call onSelectProject when a project card is clicked', async () => {
      const user = userEvent.setup();
      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

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

      render(<ProjectList selectedProjectId="2" onSelectProject={onSelectProject} />);

      const selectedCard = screen.getByText('Test Project 2').closest('[role="button"]');
      expect(selectedCard).toHaveClass('border-primary');
    });

    it('should render the "New Project" button', () => {
      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

      const newButton = screen.getByRole('button', { name: /new project/i });
      expect(newButton).toBeInTheDocument();
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

      vi.mocked(hooks.useProjects).mockReturnValue({
        data: manyProjects,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as UseQueryResult<Project[], Error>);

      const onSelectProject = vi.fn();

      const { container } = render(
        <ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />
      );

      // Container should have overflow styles
      const listContainer = container.querySelector('[data-testid="project-list-container"]');
      expect(listContainer).toHaveClass('overflow-y-auto');
    });

    it('should apply hover effect on project cards', () => {
      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

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

      vi.mocked(hooks.useProjects).mockReturnValue({
        data: projectsWithoutCounts,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as UseQueryResult<Project[], Error>);

      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

      expect(screen.getByText('Project Without Counts')).toBeInTheDocument();
      // Should show 0 prompts when _count is missing
      expect(screen.getByText(/0.*prompts?/i)).toBeInTheDocument();
    });

    it('should format dates in a readable format', () => {
      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

      // Should display formatted dates (not raw Date objects)
      // Looking for any date-like text pattern
      const dateElements = screen.getAllByText(/\d{4}|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec/i);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should have proper keyboard accessibility', async () => {
      const user = userEvent.setup();
      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

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

  describe('Create Project', () => {
    it('should call createProject mutation when "New Project" button is clicked', async () => {
      const user = userEvent.setup();
      const mutateFn = vi.fn();

      vi.mocked(hooks.useProjects).mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as UseQueryResult<Project[], Error>);

      vi.mocked(hooks.useCreateProject).mockReturnValue({
        mutate: mutateFn,
        isPending: false,
      } as unknown as UseMutationResult);

      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

      const newButton = screen.getByRole('button', { name: /new project/i });
      await user.click(newButton);

      expect(mutateFn).toHaveBeenCalledOnce();
    });

    it('should disable "New Project" button while creating', () => {
      vi.mocked(hooks.useProjects).mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as UseQueryResult<Project[], Error>);

      vi.mocked(hooks.useCreateProject).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      } as unknown as UseMutationResult);

      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

      const newButton = screen.getByRole('button', { name: /creating/i });
      expect(newButton).toBeDisabled();
    });

    it('should show "Creating..." text while project is being created', () => {
      vi.mocked(hooks.useProjects).mockReturnValue({
        data: mockProjects,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      } as UseQueryResult<Project[], Error>);

      vi.mocked(hooks.useCreateProject).mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      } as unknown as UseMutationResult);

      const onSelectProject = vi.fn();

      render(<ProjectList selectedProjectId={undefined} onSelectProject={onSelectProject} />);

      expect(screen.getByText(/creating/i)).toBeInTheDocument();
    });
  });
});

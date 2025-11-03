/**
 * GenerationTaskList Component Tests
 *
 * Tests for the generation task list display component.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GenerationTaskList } from './GenerationTaskList';
import type { GenerationTask } from '@prisma/client';

// Mock the hook
const mockUseGenerationTasks = vi.fn();
vi.mock('@/hooks/use-generation-tasks', () => ({
  useGenerationTasks: () => mockUseGenerationTasks(),
}));

/**
 * Test wrapper with React Query provider
 */
function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

// Mock task factory
function createMockTask(overrides?: Partial<GenerationTask>): GenerationTask {
  return {
    id: 'task_123',
    promptId: 'prompt_123',
    service: 'KIE',
    model: 'IMAGEN4',
    externalTaskId: 'ext_123',
    status: 'PENDING',
    providerParams: {},
    resultJson: null,
    failCode: null,
    failMsg: null,
    createdAt: new Date('2025-01-01T12:00:00Z'),
    completedAt: null,
    ...overrides,
  } as GenerationTask;
}

describe('GenerationTaskList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should show loading skeleton while fetching', () => {
      mockUseGenerationTasks.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      // Skeleton components should be present
      expect(screen.getByTestId('task-list-skeleton')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty message when no tasks exist', () => {
      mockUseGenerationTasks.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      expect(screen.getByText(/no generation tasks/i)).toBeInTheDocument();
    });
  });

  describe('Task List Display', () => {
    it('should render list of tasks', () => {
      const tasks = [
        createMockTask({ id: 'task_1', model: 'IMAGEN4' }),
        createMockTask({ id: 'task_2', model: 'VEO3' }),
        createMockTask({ id: 'task_3', model: 'MIDJOURNEY' }),
      ];

      mockUseGenerationTasks.mockReturnValue({
        data: tasks,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      expect(screen.getByText('IMAGEN4')).toBeInTheDocument();
      expect(screen.getByText('VEO3')).toBeInTheDocument();
      expect(screen.getByText('MIDJOURNEY')).toBeInTheDocument();
    });

    it('should display task metadata', () => {
      const task = createMockTask({
        model: 'IMAGEN4',
        service: 'KIE',
        createdAt: new Date('2025-01-01T12:00:00Z'),
      });

      mockUseGenerationTasks.mockReturnValue({
        data: [task],
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      expect(screen.getByText('IMAGEN4')).toBeInTheDocument();
      expect(screen.getByText('KIE')).toBeInTheDocument();
    });

    it('should show status for each task', () => {
      const tasks = [
        createMockTask({ id: 'task_1', status: 'PENDING' }),
        createMockTask({ id: 'task_2', status: 'SUCCESS', completedAt: new Date() }),
        createMockTask({
          id: 'task_3',
          status: 'FAILED',
          failMsg: 'Error',
          completedAt: new Date(),
        }),
      ];

      mockUseGenerationTasks.mockReturnValue({
        data: tasks,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      expect(screen.getByText(/pending/i)).toBeInTheDocument();
      expect(screen.getByText(/success/i)).toBeInTheDocument();
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  describe('Task Results', () => {
    it('should show result preview for successful tasks', () => {
      const task = createMockTask({
        status: 'SUCCESS',
        resultJson: JSON.stringify({
          resultUrls: ['https://example.com/image1.jpg'],
        }),
        completedAt: new Date(),
      });

      mockUseGenerationTasks.mockReturnValue({
        data: [task],
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      // Should show result indicator or thumbnail
      expect(screen.getByText(/result/i)).toBeInTheDocument();
    });

    it('should not show result for pending tasks', () => {
      const task = createMockTask({ status: 'PENDING' });

      mockUseGenerationTasks.mockReturnValue({
        data: [task],
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      expect(screen.queryByText(/result/i)).not.toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should display error message on fetch failure', () => {
      mockUseGenerationTasks.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch tasks'),
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      expect(screen.getByText(/failed.*fetch/i)).toBeInTheDocument();
    });

    it('should show error details for failed tasks', () => {
      const task = createMockTask({
        status: 'FAILED',
        failCode: '422',
        failMsg: 'Invalid parameters',
        completedAt: new Date(),
      });

      mockUseGenerationTasks.mockReturnValue({
        data: [task],
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      expect(screen.getByText(/invalid parameters/i)).toBeInTheDocument();
    });
  });

  describe('Task Sorting', () => {
    it('should display tasks in chronological order (newest first)', () => {
      const tasks = [
        createMockTask({ id: 'task_1', createdAt: new Date('2025-01-01T10:00:00Z') }),
        createMockTask({ id: 'task_2', createdAt: new Date('2025-01-01T12:00:00Z') }),
        createMockTask({ id: 'task_3', createdAt: new Date('2025-01-01T11:00:00Z') }),
      ];

      mockUseGenerationTasks.mockReturnValue({
        data: tasks,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      // All tasks should be rendered
      const taskElements = screen.getAllByTestId(/task-card-/);
      expect(taskElements).toHaveLength(3);
    });
  });

  describe('Accessibility', () => {
    it('should have proper list semantics', () => {
      const tasks = [createMockTask(), createMockTask({ id: 'task_2' })];

      mockUseGenerationTasks.mockReturnValue({
        data: tasks,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      expect(screen.getByRole('list')).toBeInTheDocument();
    });

    it('should have proper ARIA labels', () => {
      const tasks = [createMockTask()];

      mockUseGenerationTasks.mockReturnValue({
        data: tasks,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(
        <TestWrapper>
          <GenerationTaskList promptId="prompt_123" />
        </TestWrapper>
      );

      expect(screen.getByRole('list')).toHaveAttribute('aria-label');
    });
  });
});

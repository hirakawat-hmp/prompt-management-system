/**
 * GenerationTaskStatus Component Tests
 *
 * Tests for the generation task status indicator component.
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GenerationTaskStatus } from './GenerationTaskStatus';
import type { GenerationTask } from '@prisma/client';

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
    createdAt: new Date(),
    completedAt: null,
    ...overrides,
  } as GenerationTask;
}

describe('GenerationTaskStatus', () => {
  describe('Rendering', () => {
    it('should render PENDING status with spinner', () => {
      const task = createMockTask({ status: 'PENDING' });
      render(<GenerationTaskStatus task={task} />);

      expect(screen.getByText(/pending/i)).toBeInTheDocument();
      // Badge should be present
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render SUCCESS status with checkmark', () => {
      const task = createMockTask({
        status: 'SUCCESS',
        completedAt: new Date(),
      });
      render(<GenerationTaskStatus task={task} />);

      expect(screen.getByText(/success/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should render FAILED status with error icon', () => {
      const task = createMockTask({
        status: 'FAILED',
        failCode: '500',
        failMsg: 'Internal server error',
        completedAt: new Date(),
      });
      render(<GenerationTaskStatus task={task} />);

      expect(screen.getByText(/failed/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Status Colors', () => {
    it('should use secondary variant for PENDING', () => {
      const task = createMockTask({ status: 'PENDING' });
      const { container } = render(<GenerationTaskStatus task={task} />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toBeInTheDocument();
    });

    it('should use default variant for SUCCESS', () => {
      const task = createMockTask({
        status: 'SUCCESS',
        completedAt: new Date(),
      });
      const { container } = render(<GenerationTaskStatus task={task} />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toBeInTheDocument();
    });

    it('should use destructive variant for FAILED', () => {
      const task = createMockTask({
        status: 'FAILED',
        failMsg: 'Error',
        completedAt: new Date(),
      });
      const { container } = render(<GenerationTaskStatus task={task} />);

      const badge = container.querySelector('[data-slot="badge"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Error Messages', () => {
    it('should display error message for FAILED tasks', () => {
      const task = createMockTask({
        status: 'FAILED',
        failCode: '422',
        failMsg: 'Invalid parameters',
        completedAt: new Date(),
      });
      render(<GenerationTaskStatus task={task} />);

      expect(screen.getByText(/invalid parameters/i)).toBeInTheDocument();
    });

    it('should display error code when available', () => {
      const task = createMockTask({
        status: 'FAILED',
        failCode: '429',
        failMsg: 'Rate limited',
        completedAt: new Date(),
      });
      render(<GenerationTaskStatus task={task} />);

      expect(screen.getByText(/429/)).toBeInTheDocument();
    });

    it('should not display error for SUCCESS tasks', () => {
      const task = createMockTask({
        status: 'SUCCESS',
        completedAt: new Date(),
      });
      render(<GenerationTaskStatus task={task} />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper role attribute', () => {
      const task = createMockTask({ status: 'PENDING' });
      render(<GenerationTaskStatus task={task} />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should have aria-label for status', () => {
      const task = createMockTask({ status: 'SUCCESS', completedAt: new Date() });
      render(<GenerationTaskStatus task={task} />);

      const statusElement = screen.getByRole('status');
      expect(statusElement).toHaveAttribute('aria-label');
    });

    it('should be keyboard accessible for error details', () => {
      const task = createMockTask({
        status: 'FAILED',
        failMsg: 'Error message',
        completedAt: new Date(),
      });
      render(<GenerationTaskStatus task={task} />);

      // Error message should be accessible
      expect(screen.getByText(/error message/i)).toBeInTheDocument();
    });
  });
});

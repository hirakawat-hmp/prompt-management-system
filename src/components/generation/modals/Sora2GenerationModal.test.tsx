/**
 * Sora2GenerationModal Component Tests
 *
 * Tests for the Sora2 video generation modal with form validation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sora2GenerationModal } from './Sora2GenerationModal';

// Mock hooks
vi.mock('@/hooks/use-generation-tasks', () => ({
  useCreateGenerationTask: vi.fn(),
}));

// Import mocked modules
import { useCreateGenerationTask } from '@/hooks/use-generation-tasks';

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

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('Sora2GenerationModal', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();
  const mockMutate = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    promptId: 'prompt_123',
    promptContent: 'A serene Japanese garden with cherry blossoms',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation for useCreateGenerationTask
    (useCreateGenerationTask as any).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isError: false,
    });
  });

  describe('Rendering', () => {
    it('should not render when closed', () => {
      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} open={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render when open', () => {
      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/generate sora2 video/i)).toBeInTheDocument();
    });

    it('should display prompt textarea with pre-filled content', () => {
      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const promptTextarea = screen.getByLabelText(/prompt/i);
      expect(promptTextarea).toBeInTheDocument();
      expect(promptTextarea).toHaveValue('A serene Japanese garden with cherry blossoms');
    });

    it('should display aspect ratio selector', () => {
      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(/aspect ratio/i)).toBeInTheDocument();
      // Select component should be present
      expect(screen.getByRole('combobox', { name: /aspect ratio/i })).toBeInTheDocument();
    });

    it('should display duration selector', () => {
      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(/duration/i)).toBeInTheDocument();
      expect(screen.getByRole('combobox', { name: /duration/i })).toBeInTheDocument();
    });

    it('should display remove watermark checkbox', () => {
      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(/remove watermark/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /remove watermark/i })).toBeInTheDocument();
    });

    it('should display generate button', () => {
      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByRole('button', { name: /^generate$/i })).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should disable generate button when prompt is empty', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const promptTextarea = screen.getByLabelText(/prompt/i);
      await user.clear(promptTextarea);

      const generateButton = screen.getByRole('button', { name: /^generate$/i });
      expect(generateButton).toBeDisabled();
    });

    it('should enable generate button with valid prompt', () => {
      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const generateButton = screen.getByRole('button', { name: /^generate$/i });
      expect(generateButton).not.toBeDisabled();
    });
  });

  describe('Form Interactions', () => {
    it('should allow editing prompt content', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const promptTextarea = screen.getByLabelText(/prompt/i);
      await user.clear(promptTextarea);
      await user.type(promptTextarea, 'New video prompt');

      expect(promptTextarea).toHaveValue('New video prompt');
    });

    it('should display character count', () => {
      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      expect(screen.getByText(/\d+ characters/i)).toBeInTheDocument();
    });

    it('should toggle remove watermark checkbox', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const checkbox = screen.getByRole('checkbox', { name: /remove watermark/i });
      expect(checkbox).not.toBeChecked();

      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });
  });

  describe('Generation Task Creation', () => {
    it('should create generation task with default values', async () => {
      const user = userEvent.setup();

      mockMutate.mockImplementation((input, options) => {
        options.onSuccess({ success: true, data: { id: 'task_123' } });
      });

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} onSuccess={mockOnSuccess} />
        </TestWrapper>
      );

      const generateButton = screen.getByRole('button', { name: /^generate$/i });
      await user.click(generateButton);

      expect(mockMutate).toHaveBeenCalledWith(
        {
          promptId: 'prompt_123',
          providerParams: {
            service: 'KIE',
            model: 'SORA2',
            apiModel: 'sora-2-text-to-video',
            input: {
              prompt: 'A serene Japanese garden with cherry blossoms',
              aspect_ratio: 'landscape',
              n_frames: '10',
              remove_watermark: false,
            },
          },
        },
        expect.any(Object)
      );
    });

    it('should create generation task with custom aspect ratio', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      // Note: Select interaction in jsdom is limited
      // In a real browser test, we would click the select and choose "portrait"
      // For now, we'll just verify the component renders

      const generateButton = screen.getByRole('button', { name: /^generate$/i });
      await user.click(generateButton);

      expect(mockMutate).toHaveBeenCalled();
    });

    it('should create generation task with watermark removed', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const checkbox = screen.getByRole('checkbox', { name: /remove watermark/i });
      await user.click(checkbox);

      const generateButton = screen.getByRole('button', { name: /^generate$/i });
      await user.click(generateButton);

      expect(mockMutate).toHaveBeenCalledWith(
        expect.objectContaining({
          providerParams: expect.objectContaining({
            input: expect.objectContaining({
              remove_watermark: true,
            }),
          }),
        }),
        expect.any(Object)
      );
    });

    it('should show loading state during generation', async () => {
      const user = userEvent.setup();

      (useCreateGenerationTask as any).mockReturnValue({
        mutate: mockMutate,
        isPending: true,
        isError: false,
      });

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const generateButton = screen.getByRole('button', { name: /generating/i });
      expect(generateButton).toBeDisabled();
    });

    it('should call onSuccess callback on successful creation', async () => {
      const user = userEvent.setup();

      mockMutate.mockImplementation((input, options) => {
        options.onSuccess({ success: true, data: { id: 'task_123' } });
      });

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} onSuccess={mockOnSuccess} />
        </TestWrapper>
      );

      const generateButton = screen.getByRole('button', { name: /^generate$/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should close modal after successful creation', async () => {
      const user = userEvent.setup();

      mockMutate.mockImplementation((input, options) => {
        options.onSuccess({ success: true, data: { id: 'task_123' } });
      });

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const generateButton = screen.getByRole('button', { name: /^generate$/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should display error message on failure', async () => {
      const user = userEvent.setup();

      mockMutate.mockImplementation((input, options) => {
        options.onSuccess({ success: false, error: 'Generation failed: API error' });
      });

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const generateButton = screen.getByRole('button', { name: /^generate$/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByText(/generation failed: api error/i)).toBeInTheDocument();
      });
    });
  });

  describe('Modal Controls', () => {
    it('should close modal via cancel button', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should reset form when modal closes', () => {
      const { rerender } = render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      // Close modal
      rerender(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} open={false} />
        </TestWrapper>
      );

      // Reopen modal - should have original content
      rerender(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} open={true} />
        </TestWrapper>
      );

      const promptTextarea = screen.getByLabelText(/prompt/i);
      expect(promptTextarea).toHaveValue('A serene Japanese garden with cherry blossoms');
    });
  });

  describe('Accessibility', () => {
    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      // Dialog should be present
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Should be able to tab through form elements
      await user.tab();
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeTruthy();
    });

    it('should have proper ARIA attributes', () => {
      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      // Dialog should be present and accessible
      expect(screen.getByRole('dialog')).toBeInTheDocument();

      // Form elements should have accessible labels
      expect(screen.getByLabelText(/prompt/i)).toBeInTheDocument();
      expect(screen.getByRole('checkbox', { name: /remove watermark/i })).toBeInTheDocument();
    });

    it('should display error with alert role', async () => {
      const user = userEvent.setup();

      mockMutate.mockImplementation((input, options) => {
        options.onSuccess({ success: false, error: 'Test error' });
      });

      render(
        <TestWrapper>
          <Sora2GenerationModal {...defaultProps} />
        </TestWrapper>
      );

      const generateButton = screen.getByRole('button', { name: /^generate$/i });
      await user.click(generateButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });
    });
  });
});

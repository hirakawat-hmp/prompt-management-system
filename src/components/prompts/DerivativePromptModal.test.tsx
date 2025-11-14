/**
 * DerivativePromptModal Component Tests
 *
 * Tests for the derivative prompt modal with manual and AI batch generation.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DerivativePromptModal } from './DerivativePromptModal';
import * as promptGenerationApi from '@/lib/api/prompt-generation';

// Mock the API
vi.mock('@/lib/api/prompt-generation', () => ({
  improvePrompt: vi.fn(),
}));

// Mock the useCreatePrompt hook
const mockMutate = vi.fn();
vi.mock('@/hooks/useCreatePrompt', () => ({
  useCreatePrompt: () => ({
    mutate: mockMutate,
    isPending: false,
    isError: false,
    error: null,
  }),
}));

describe('DerivativePromptModal', () => {
  const mockParentPrompt = {
    id: 'parent-1',
    type: 'image' as const,
    content: 'A beautiful sunset over Mount Fuji',
  };

  const mockProjectId = 'project-1';
  const mockOnOpenChange = vi.fn();
  const mockOnSuccess = vi.fn();

  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  const renderModal = (open = true) => {
    return render(
      <QueryClientProvider client={queryClient}>
        <DerivativePromptModal
          projectId={mockProjectId}
          parentPrompt={mockParentPrompt}
          open={open}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      </QueryClientProvider>
    );
  };

  describe('Mode Selection', () => {
    it('should show mode selection screen initially', () => {
      renderModal();

      expect(screen.getByText('Choose how to create a derivative prompt')).toBeInTheDocument();
      expect(screen.getByText('Manual Derivative')).toBeInTheDocument();
      expect(screen.getByText('AI Image Derivatives')).toBeInTheDocument();
      expect(screen.getByText('AI Video Derivatives')).toBeInTheDocument();
    });

    it('should display parent prompt content', () => {
      renderModal();

      expect(screen.getByText('A beautiful sunset over Mount Fuji')).toBeInTheDocument();
    });

    it('should show parent prompt type', () => {
      renderModal();

      expect(screen.getByText(/Parent Prompt \(image\)/)).toBeInTheDocument();
    });
  });

  describe('Manual Mode', () => {
    it('should switch to manual mode when Manual Derivative is clicked', async () => {
      const user = userEvent.setup();
      renderModal();

      const manualButton = screen.getByText('Manual Derivative');
      await user.click(manualButton);

      expect(screen.getByText('Manually create a derivative prompt')).toBeInTheDocument();
      expect(screen.getByLabelText('Derivative Prompt Content')).toBeInTheDocument();
    });

    it('should have parent content pre-filled in manual mode', async () => {
      const user = userEvent.setup();
      renderModal();

      const manualButton = screen.getByText('Manual Derivative');
      await user.click(manualButton);

      const textarea = screen.getByLabelText('Derivative Prompt Content') as HTMLTextAreaElement;
      expect(textarea.value).toBe('A beautiful sunset over Mount Fuji');
    });

    it('should create derivative with manual content', async () => {
      const user = userEvent.setup();
      renderModal();

      // Switch to manual mode
      await user.click(screen.getByText('Manual Derivative'));

      // Edit content
      const textarea = screen.getByLabelText('Derivative Prompt Content');
      await user.clear(textarea);
      await user.type(textarea, 'A beautiful sunrise over Mount Fuji');

      // Click create
      const createButton = screen.getByText('Create Derivative');
      await user.click(createButton);

      expect(mockMutate).toHaveBeenCalledWith(
        {
          projectId: mockProjectId,
          type: 'image',
          content: 'A beautiful sunrise over Mount Fuji',
          parentId: 'parent-1',
        },
        expect.any(Object)
      );
    });

    it('should show error when content is empty in manual mode', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByText('Manual Derivative'));

      const textarea = screen.getByLabelText('Derivative Prompt Content');
      await user.clear(textarea);

      const createButton = screen.getByText('Create Derivative');
      await user.click(createButton);

      expect(screen.getByText('Prompt content is required')).toBeInTheDocument();
    });

    it('should go back to mode selection when Back is clicked', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByText('Manual Derivative'));
      await user.click(screen.getByText('Back'));

      expect(screen.getByText('Choose how to create a derivative prompt')).toBeInTheDocument();
    });
  });

  describe('AI Image Mode', () => {
    it('should switch to AI image mode when clicked', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByText('AI Image Derivatives'));

      expect(screen.getByText('Generate AI-powered image prompt derivatives')).toBeInTheDocument();
      expect(screen.getByLabelText('Target AI Model')).toBeInTheDocument();
      expect(screen.getByLabelText('Instruction #1')).toBeInTheDocument();
      expect(screen.getByLabelText('Instruction #2')).toBeInTheDocument();
      expect(screen.getByLabelText('Instruction #3')).toBeInTheDocument();
    });

    it('should show Imagen4 and Midjourney options in AI image mode', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByText('AI Image Derivatives'));

      const modelSelect = screen.getByLabelText('Target AI Model');
      await user.click(modelSelect);

      expect(screen.getByText('Imagen4 (Google)')).toBeInTheDocument();
      expect(screen.getByText('Midjourney')).toBeInTheDocument();
    });

    it('should count active instructions correctly', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByText('AI Image Derivatives'));

      // No instructions initially
      expect(screen.queryByText(/derivative.*will be created/i)).not.toBeInTheDocument();

      // Add first instruction
      await user.type(screen.getByLabelText('Instruction #1'), 'Add more details');
      expect(screen.getByText('1 derivative will be created')).toBeInTheDocument();

      // Add second instruction
      await user.type(screen.getByLabelText('Instruction #2'), 'Make it cinematic');
      expect(screen.getByText('2 derivatives will be created')).toBeInTheDocument();

      // Add third instruction
      await user.type(screen.getByLabelText('Instruction #3'), 'Focus on composition');
      expect(screen.getByText('3 derivatives will be created')).toBeInTheDocument();
    });

    it('should show error when no instructions are provided', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByText('AI Image Derivatives'));

      const createButton = screen.getByText(/Create.*Derivative/);
      expect(createButton).toBeDisabled();
    });

    it('should call improvePrompt API for each instruction', async () => {
      const user = userEvent.setup();
      const mockImprovePrompt = vi.mocked(promptGenerationApi.improvePrompt);

      // Mock successful API responses
      mockImprovePrompt.mockResolvedValue({
        success: true,
        data: {
          prompt: 'Improved prompt',
          parameters: '--ar 16:9',
          explanation: 'Applied tips',
        },
      });

      // Mock successful createPrompt
      mockMutate.mockImplementation((input, callbacks) => {
        callbacks?.onSuccess?.({ success: true, data: { id: 'new-prompt' } });
      });

      renderModal();

      await user.click(screen.getByText('AI Image Derivatives'));

      // Add two instructions
      await user.type(screen.getByLabelText('Instruction #1'), 'Add more details');
      await user.type(screen.getByLabelText('Instruction #2'), 'Make it cinematic');

      const createButton = screen.getByText('Create 2 Derivatives');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockImprovePrompt).toHaveBeenCalledTimes(2);
        expect(mockImprovePrompt).toHaveBeenCalledWith(
          'imagen4',
          'A beautiful sunset over Mount Fuji',
          'Add more details'
        );
        expect(mockImprovePrompt).toHaveBeenCalledWith(
          'imagen4',
          'A beautiful sunset over Mount Fuji',
          'Make it cinematic'
        );
      });
    });

    it('should create prompts after successful API responses', async () => {
      const user = userEvent.setup();
      const mockImprovePrompt = vi.mocked(promptGenerationApi.improvePrompt);

      mockImprovePrompt.mockResolvedValue({
        success: true,
        data: {
          prompt: 'Improved prompt',
          parameters: '--ar 16:9',
        },
      });

      mockMutate.mockImplementation((input, callbacks) => {
        callbacks?.onSuccess?.({ success: true, data: { id: 'new-prompt' } });
      });

      renderModal();

      await user.click(screen.getByText('AI Image Derivatives'));
      await user.type(screen.getByLabelText('Instruction #1'), 'Add more details');

      const createButton = screen.getByText('Create 1 Derivative');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          {
            projectId: mockProjectId,
            type: 'image',
            content: 'Improved prompt\n\nParameters: --ar 16:9',
            parentId: 'parent-1',
            userFeedback: 'Add more details', // Instruction saved as user feedback
          },
          expect.any(Object)
        );
      });
    });

    it('should save each instruction as userFeedback for multiple derivatives', async () => {
      const user = userEvent.setup();
      const mockImprovePrompt = vi.mocked(promptGenerationApi.improvePrompt);

      // Mock two different responses
      mockImprovePrompt
        .mockResolvedValueOnce({
          success: true,
          data: { prompt: 'Detailed prompt' },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { prompt: 'Cinematic prompt' },
        });

      mockMutate.mockImplementation((input, callbacks) => {
        callbacks?.onSuccess?.({ success: true, data: { id: 'new-prompt' } });
      });

      renderModal();

      await user.click(screen.getByText('AI Image Derivatives'));
      await user.type(screen.getByLabelText('Instruction #1'), 'Add more details');
      await user.type(screen.getByLabelText('Instruction #2'), 'Make it cinematic');

      const createButton = screen.getByText('Create 2 Derivatives');
      await user.click(createButton);

      await waitFor(() => {
        // First derivative
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'Detailed prompt',
            userFeedback: 'Add more details',
          }),
          expect.any(Object)
        );

        // Second derivative
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            content: 'Cinematic prompt',
            userFeedback: 'Make it cinematic',
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe('AI Video Mode', () => {
    it('should switch to AI video mode when clicked', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByText('AI Video Derivatives'));

      expect(screen.getByText('Generate AI-powered video prompt derivatives')).toBeInTheDocument();
    });

    it('should show Veo3 and Sora2 options in AI video mode', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByText('AI Video Derivatives'));

      const modelSelect = screen.getByLabelText('Target AI Model');
      await user.click(modelSelect);

      expect(screen.getByText('Veo3 (Google)')).toBeInTheDocument();
      expect(screen.getByText('Sora2 (OpenAI)')).toBeInTheDocument();
    });

    it('should create video type derivatives', async () => {
      const user = userEvent.setup();
      const mockImprovePrompt = vi.mocked(promptGenerationApi.improvePrompt);

      mockImprovePrompt.mockResolvedValue({
        success: true,
        data: { prompt: 'Video prompt' },
      });

      mockMutate.mockImplementation((input, callbacks) => {
        callbacks?.onSuccess?.({ success: true, data: { id: 'new-prompt' } });
      });

      renderModal();

      await user.click(screen.getByText('AI Video Derivatives'));
      await user.type(screen.getByLabelText('Instruction #1'), 'Add camera movement');

      const createButton = screen.getByText('Create 1 Derivative');
      await user.click(createButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'video',
          }),
          expect.any(Object)
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should show error when API call fails', async () => {
      const user = userEvent.setup();
      const mockImprovePrompt = vi.mocked(promptGenerationApi.improvePrompt);

      mockImprovePrompt.mockResolvedValue({
        success: false,
        error: 'API error',
      });

      renderModal();

      await user.click(screen.getByText('AI Image Derivatives'));
      await user.type(screen.getByLabelText('Instruction #1'), 'Test instruction');

      const createButton = screen.getByText('Create 1 Derivative');
      await user.click(createButton);

      await waitFor(() => {
        expect(screen.getByText(/Failed to generate.*prompt/i)).toBeInTheDocument();
      });
    });
  });

  describe('Modal Controls', () => {
    it('should call onOpenChange when Cancel is clicked', async () => {
      const user = userEvent.setup();
      renderModal();

      const cancelButton = screen.getByText('Cancel');
      await user.click(cancelButton);

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });

    it('should reset form when modal is closed', () => {
      const { rerender } = renderModal(true);

      // Close modal
      rerender(
        <QueryClientProvider client={queryClient}>
          <DerivativePromptModal
            projectId={mockProjectId}
            parentPrompt={mockParentPrompt}
            open={false}
            onOpenChange={mockOnOpenChange}
            onSuccess={mockOnSuccess}
          />
        </QueryClientProvider>
      );

      // Reopen modal
      rerender(
        <QueryClientProvider client={queryClient}>
          <DerivativePromptModal
            projectId={mockProjectId}
            parentPrompt={mockParentPrompt}
            open={true}
            onOpenChange={mockOnOpenChange}
            onSuccess={mockOnSuccess}
          />
        </QueryClientProvider>
      );

      // Should be back to mode selection
      expect(screen.getByText('Choose how to create a derivative prompt')).toBeInTheDocument();
    });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PromptDetail } from './PromptDetail';
import type { PromptDetailProps, Prompt, Asset } from '@/types';
import * as hooks from '@/hooks';

// Mock the hooks module
vi.mock('@/hooks', () => ({
  useUpdatePrompt: vi.fn(),
}));

describe('PromptDetail', () => {
  const mockPrompt: Prompt = {
    id: 'prompt-1',
    type: 'image',
    content: 'Create a beautiful landscape with mountains and rivers',
    createdAt: new Date('2025-01-01T10:00:00Z'),
    updatedAt: new Date('2025-01-02T15:30:00Z'),
    assets: [],
  };

  const mockProps: PromptDetailProps = {
    prompt: mockPrompt,
    onGenerateImage: vi.fn(),
    onGenerateVideo: vi.fn(),
    onCreateDerivative: vi.fn(),
  };

  const mockMutate = vi.fn();
  const defaultMutationState = {
    mutate: mockMutate,
    isPending: false,
    isSuccess: false,
    isError: false,
    data: undefined,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Set default mock implementation
    vi.mocked(hooks.useUpdatePrompt).mockReturnValue(defaultMutationState as any);
  });

  describe('Rendering', () => {
    it('should render prompt content in a read-only textarea-like element', () => {
      render(<PromptDetail {...mockProps} />);

      expect(screen.getByText(mockPrompt.content)).toBeInTheDocument();
      expect(screen.getByText(mockPrompt.content).tagName).toBe('DIV');
    });

    it('should display created and updated timestamps', () => {
      render(<PromptDetail {...mockProps} />);

      expect(screen.getByText(/Created:/i)).toBeInTheDocument();
      expect(screen.getByText(/Updated:/i)).toBeInTheDocument();
    });

    it('should render image button for image prompts', () => {
      render(<PromptDetail {...mockProps} />);

      expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /generate video/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create derivative/i })).toBeInTheDocument();
    });

    it('should render video button for video prompts', () => {
      const videoPrompt: Prompt = {
        ...mockPrompt,
        type: 'video',
      };

      render(<PromptDetail {...mockProps} prompt={videoPrompt} />);

      expect(screen.queryByRole('button', { name: /generate image/i })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /generate video/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create derivative/i })).toBeInTheDocument();
    });

    it('should display empty state when prompt is null', () => {
      render(<PromptDetail {...mockProps} prompt={null} />);

      expect(screen.getByText(/no prompt selected/i)).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /generate image/i })).not.toBeInTheDocument();
    });
  });

  describe('Parent Prompt', () => {
    it('should display parent prompt when present', () => {
      const promptWithParent: Prompt = {
        ...mockPrompt,
        parent: {
          id: 'parent-1',
          content: 'Original prompt content',
        },
      };

      render(<PromptDetail {...mockProps} prompt={promptWithParent} />);

      expect(screen.getByText(/parent prompt/i)).toBeInTheDocument();
      expect(screen.getByText('Original prompt content')).toBeInTheDocument();
    });

    it('should not display parent prompt section when no parent exists', () => {
      render(<PromptDetail {...mockProps} />);

      expect(screen.queryByText(/parent prompt/i)).not.toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    it('should call onGenerateImage when Generate Image button is clicked', async () => {
      const user = userEvent.setup();
      render(<PromptDetail {...mockProps} />);

      const button = screen.getByRole('button', { name: /generate image/i });
      await user.click(button);

      expect(mockProps.onGenerateImage).toHaveBeenCalledOnce();
    });

    it('should call onGenerateVideo when Generate Video button is clicked', async () => {
      const user = userEvent.setup();
      const videoPrompt: Prompt = {
        ...mockPrompt,
        type: 'video',
      };

      render(<PromptDetail {...mockProps} prompt={videoPrompt} />);

      const button = screen.getByRole('button', { name: /generate video/i });
      await user.click(button);

      expect(mockProps.onGenerateVideo).toHaveBeenCalledOnce();
    });

    it('should call onCreateDerivative when Create Derivative button is clicked', async () => {
      const user = userEvent.setup();
      render(<PromptDetail {...mockProps} />);

      const button = screen.getByRole('button', { name: /create derivative/i });
      await user.click(button);

      expect(mockProps.onCreateDerivative).toHaveBeenCalledOnce();
    });
  });

  describe('Assets Display', () => {
    it('should display assets in a grid layout', () => {
      const promptWithAssets: Prompt = {
        ...mockPrompt,
        assets: [
          {
            id: 'asset-1',
            type: 'image',
            url: 'https://example.com/image1.jpg',
            provider: 'DALL-E',
            createdAt: new Date('2025-01-03T10:00:00Z'),
          },
          {
            id: 'asset-2',
            type: 'video',
            url: 'https://example.com/video1.mp4',
            provider: 'Runway',
            createdAt: new Date('2025-01-03T11:00:00Z'),
          },
        ],
      };

      render(<PromptDetail {...mockProps} prompt={promptWithAssets} />);

      expect(screen.getByText(/generated assets/i)).toBeInTheDocument();

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(1);
      expect(images[0]).toHaveAttribute('src', 'https://example.com/image1.jpg');
      expect(images[0]).toHaveAttribute('alt', 'Generated asset asset-1');
    });

    it('should display asset provider badges', () => {
      const promptWithAssets: Prompt = {
        ...mockPrompt,
        assets: [
          {
            id: 'asset-1',
            type: 'image',
            url: 'https://example.com/image1.jpg',
            provider: 'DALL-E',
            createdAt: new Date('2025-01-03T10:00:00Z'),
          },
        ],
      };

      render(<PromptDetail {...mockProps} prompt={promptWithAssets} />);

      expect(screen.getByText('DALL-E')).toBeInTheDocument();
    });

    it('should not display assets section when no assets exist', () => {
      render(<PromptDetail {...mockProps} />);

      expect(screen.queryByText(/generated assets/i)).not.toBeInTheDocument();
    });

    it('should handle multiple assets in grid layout', () => {
      const assets: Asset[] = Array.from({ length: 6 }, (_, i) => ({
        id: `asset-${i + 1}`,
        type: 'image' as const,
        url: `https://example.com/image${i + 1}.jpg`,
        provider: 'DALL-E',
        createdAt: new Date(`2025-01-03T${10 + i}:00:00Z`),
      }));

      const promptWithManyAssets: Prompt = {
        ...mockPrompt,
        assets,
      };

      render(<PromptDetail {...mockProps} prompt={promptWithManyAssets} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(6);
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for image prompt action buttons', () => {
      render(<PromptDetail {...mockProps} />);

      expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create derivative/i })).toBeInTheDocument();
    });

    it('should have proper ARIA labels for video prompt action buttons', () => {
      const videoPrompt: Prompt = {
        ...mockPrompt,
        type: 'video',
      };

      render(<PromptDetail {...mockProps} prompt={videoPrompt} />);

      expect(screen.getByRole('button', { name: /generate video/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /create derivative/i })).toBeInTheDocument();
    });

    it('should have proper alt text for images', () => {
      const promptWithAssets: Prompt = {
        ...mockPrompt,
        assets: [
          {
            id: 'asset-1',
            type: 'image',
            url: 'https://example.com/image1.jpg',
            provider: 'DALL-E',
            createdAt: new Date('2025-01-03T10:00:00Z'),
          },
        ],
      };

      render(<PromptDetail {...mockProps} prompt={promptWithAssets} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('alt', 'Generated asset asset-1');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty content gracefully', () => {
      const emptyPrompt: Prompt = {
        ...mockPrompt,
        content: '',
      };

      render(<PromptDetail {...mockProps} prompt={emptyPrompt} />);

      expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
    });

    it('should format dates correctly', () => {
      render(<PromptDetail {...mockProps} />);

      // Check that dates are displayed (exact format depends on implementation)
      const dateElements = screen.getAllByText(/2025/);
      expect(dateElements.length).toBeGreaterThan(0);
    });
  });

  describe('User Feedback Mutations', () => {
    it('should render feedback form when no userFeedback exists', () => {
      render(<PromptDetail {...mockProps} />);

      expect(screen.getByPlaceholderText(/add your feedback/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /submit feedback/i })).toBeInTheDocument();
    });

    it('should submit feedback using mutation hook', async () => {
      const user = userEvent.setup();
      render(<PromptDetail {...mockProps} />);

      const feedbackInput = screen.getByPlaceholderText(/add your feedback/i);
      const submitButton = screen.getByRole('button', { name: /submit feedback/i });

      await user.type(feedbackInput, 'The mountains look too bright');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          {
            promptId: 'prompt-1',
            data: { userFeedback: 'The mountains look too bright' },
          },
          expect.any(Object)
        );
      });
    });

    it('should disable submit button when feedback is empty', () => {
      render(<PromptDetail {...mockProps} />);

      const submitButton = screen.getByRole('button', { name: /submit feedback/i });
      expect(submitButton).toBeDisabled();
    });

    it('should disable form during mutation', () => {
      vi.mocked(hooks.useUpdatePrompt).mockReturnValue({
        ...defaultMutationState,
        isPending: true,
      } as any);

      render(<PromptDetail {...mockProps} />);

      const feedbackInput = screen.getByPlaceholderText(/add your feedback/i);
      const submitButton = screen.getByRole('button', { name: /submitting/i });

      expect(feedbackInput).toBeDisabled();
      expect(submitButton).toBeDisabled();
    });

    it('should clear feedback input after successful submission', async () => {
      const user = userEvent.setup();
      let onSuccessCallback: ((result: any) => void) | undefined;

      // Capture the onSuccess callback
      mockMutate.mockImplementation((variables, options) => {
        onSuccessCallback = options?.onSuccess;
      });

      render(<PromptDetail {...mockProps} />);

      const feedbackInput = screen.getByPlaceholderText(/add your feedback/i) as HTMLTextAreaElement;
      const submitButton = screen.getByRole('button', { name: /submit feedback/i });

      await user.type(feedbackInput, 'Great work!');
      expect(feedbackInput.value).toBe('Great work!');

      await user.click(submitButton);

      // Simulate successful mutation
      if (onSuccessCallback) {
        onSuccessCallback({ success: true, data: {} });
      }

      await waitFor(() => {
        expect(feedbackInput.value).toBe('');
      });
    });

    it('should display error message when mutation fails', () => {
      vi.mocked(hooks.useUpdatePrompt).mockReturnValue({
        ...defaultMutationState,
        isError: true,
        error: new Error('Failed to update'),
      } as any);

      render(<PromptDetail {...mockProps} />);

      expect(screen.getByRole('alert')).toHaveTextContent(/failed to submit feedback/i);
    });

    it('should hide feedback form when userFeedback already exists', () => {
      const promptWithFeedback: Prompt = {
        ...mockPrompt,
        userFeedback: 'Already submitted feedback',
      };

      render(<PromptDetail {...mockProps} prompt={promptWithFeedback} />);

      expect(screen.queryByPlaceholderText(/add your feedback/i)).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /submit feedback/i })).not.toBeInTheDocument();
    });

    it('should handle multiline feedback input', async () => {
      const user = userEvent.setup();
      render(<PromptDetail {...mockProps} />);

      const feedbackInput = screen.getByPlaceholderText(/add your feedback/i);
      const multilineFeedback = 'Line 1\nLine 2\nLine 3';

      await user.type(feedbackInput, multilineFeedback);
      await user.click(screen.getByRole('button', { name: /submit feedback/i }));

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          {
            promptId: 'prompt-1',
            data: { userFeedback: multilineFeedback },
          },
          expect.any(Object)
        );
      });
    });

    it('should trim whitespace-only feedback', async () => {
      const user = userEvent.setup();
      render(<PromptDetail {...mockProps} />);

      const feedbackInput = screen.getByPlaceholderText(/add your feedback/i);
      await user.type(feedbackInput, '   ');

      const submitButton = screen.getByRole('button', { name: /submit feedback/i });
      expect(submitButton).toBeDisabled();
    });
  });
});

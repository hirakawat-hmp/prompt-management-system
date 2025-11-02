import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { PromptDetail, type PromptDetailProps, type Prompt, type Asset } from './PromptDetail';

describe('PromptDetail', () => {
  const mockPrompt: Prompt = {
    id: 'prompt-1',
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

    it('should render all action buttons', () => {
      render(<PromptDetail {...mockProps} />);

      expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
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
      render(<PromptDetail {...mockProps} />);

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
    it('should have proper ARIA labels for action buttons', () => {
      render(<PromptDetail {...mockProps} />);

      expect(screen.getByRole('button', { name: /generate image/i })).toBeInTheDocument();
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
});

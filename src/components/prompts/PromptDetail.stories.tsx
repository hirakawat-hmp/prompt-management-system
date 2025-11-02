import type { Meta, StoryObj } from '@storybook/react';
import { PromptDetail } from './PromptDetail';
import type { Prompt, Asset } from '@/types';

const meta = {
  title: 'Components/Prompts/PromptDetail',
  component: PromptDetail,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    prompt: {
      control: 'object',
      description: 'The prompt object to display',
    },
    onGenerateImage: {
      action: 'generate-image',
      description: 'Callback when Generate Image button is clicked',
    },
    onGenerateVideo: {
      action: 'generate-video',
      description: 'Callback when Generate Video button is clicked',
    },
    onCreateDerivative: {
      action: 'create-derivative',
      description: 'Callback when Create Derivative button is clicked',
    },
  },
  args: {
    onGenerateImage: () => console.log('Generate Image clicked'),
    onGenerateVideo: () => console.log('Generate Video clicked'),
    onCreateDerivative: () => console.log('Create Derivative clicked'),
  },
} satisfies Meta<typeof PromptDetail>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock data
const basePrompt: Prompt = {
  id: 'prompt-1',
  type: 'image',
  content: 'Create a beautiful landscape with mountains, rivers, and a sunset in the background. The scene should be peaceful and serene, with vibrant colors in the sky.',
  createdAt: new Date('2025-01-15T10:30:00Z'),
  updatedAt: new Date('2025-01-15T14:45:00Z'),
  assets: [],
};

const imageAssets: Asset[] = [
  {
    id: 'asset-1',
    promptId: 'prompt-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    provider: 'dall-e',
    createdAt: new Date('2025-01-15T11:00:00Z'),
  },
  {
    id: 'asset-2',
    promptId: 'prompt-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=400&fit=crop',
    provider: 'midjourney',
    createdAt: new Date('2025-01-15T11:15:00Z'),
  },
];

const mixedAssets: Asset[] = [
  {
    id: 'asset-1',
    promptId: 'prompt-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop',
    provider: 'dall-e',
    createdAt: new Date('2025-01-15T11:00:00Z'),
  },
  {
    id: 'asset-2',
    promptId: 'prompt-1',
    type: 'video',
    url: 'https://example.com/video.mp4',
    provider: 'veo',
    createdAt: new Date('2025-01-15T11:30:00Z'),
  },
  {
    id: 'asset-3',
    promptId: 'prompt-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1454496522488-7a8e488e8606?w=400&h=400&fit=crop',
    provider: 'midjourney',
    createdAt: new Date('2025-01-15T12:00:00Z'),
  },
  {
    id: 'asset-4',
    promptId: 'prompt-1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=400&h=400&fit=crop',
    provider: 'stable-diffusion',
    createdAt: new Date('2025-01-15T12:30:00Z'),
  },
];

export const Default: Story = {
  args: {
    prompt: basePrompt,
  },
};

export const WithParent: Story = {
  args: {
    prompt: {
      ...basePrompt,
      parent: {
        id: 'parent-1',
        content: 'Create a landscape with mountains and rivers',
      },
    },
  },
};

export const WithImageAssets: Story = {
  args: {
    prompt: {
      ...basePrompt,
      assets: imageAssets,
    },
  },
};

export const WithMixedAssets: Story = {
  args: {
    prompt: {
      ...basePrompt,
      assets: mixedAssets,
    },
  },
};

export const WithParentAndAssets: Story = {
  args: {
    prompt: {
      ...basePrompt,
      parent: {
        id: 'parent-1',
        content: 'Create a landscape with mountains and rivers',
      },
      assets: imageAssets,
    },
  },
};

export const WithManyAssets: Story = {
  args: {
    prompt: {
      ...basePrompt,
      assets: Array.from({ length: 8 }, (_, i) => ({
        id: `asset-${i + 1}`,
        promptId: 'prompt-1',
        type: 'image' as const,
        url: `https://images.unsplash.com/photo-${1506905925346 + i * 1000}?w=400&h=400&fit=crop`,
        provider: ['dall-e', 'midjourney', 'stable-diffusion'][i % 3] as any,
        createdAt: new Date(`2025-01-15T${11 + i}:00:00Z`),
      })),
    },
  },
};

export const EmptyContent: Story = {
  args: {
    prompt: {
      ...basePrompt,
      content: '',
    },
  },
};

export const LongContent: Story = {
  args: {
    prompt: {
      ...basePrompt,
      content: `Create a beautiful landscape with mountains, rivers, and a sunset in the background.

The scene should be peaceful and serene, with vibrant colors in the sky.
Include the following elements:
- Majestic snow-capped mountains in the distance
- A winding river reflecting the sunset
- Lush green forests in the foreground
- A golden sunset with pink and orange hues
- Soft clouds in the sky
- Perhaps a small cabin or bridge for scale

The overall mood should be tranquil and inspiring, evoking a sense of wonder and connection with nature.`,
    },
  },
};

export const NoPromptSelected: Story = {
  args: {
    prompt: null,
  },
};

/**
 * Veo3GenerationModal Storybook Stories
 *
 * Interactive documentation for the Veo3 video generation modal.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Veo3GenerationModal } from './Veo3GenerationModal';

/**
 * Test wrapper with React Query provider
 */
function StoryWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const meta: Meta<typeof Veo3GenerationModal> = {
  title: 'Generation/Modals/Veo3GenerationModal',
  component: Veo3GenerationModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: `
Veo3GenerationModal is a comprehensive modal for creating video generation tasks using Google Veo3.

## Features

- **Pre-filled Prompt**: Prompts are pre-filled from the parent prompt, but can be edited
- **Model Variants**: Choose between veo3 (higher quality) and veo3_fast (faster generation)
- **Generation Types**:
  - TEXT_2_VIDEO: Generate video from text only (no images required)
  - FIRST_AND_LAST_FRAMES_2_VIDEO: Generate video from first and last frame images
  - REFERENCE_2_VIDEO: Generate video from 1-3 reference images
- **Multiple Image Upload**: Supports uploading up to 3 reference images
- **Aspect Ratios**: 16:9 (landscape), 9:16 (portrait), or Auto
- **Seed Control**: Optional seed (10000-99999) for reproducible results
- **Form Validation**: Validates all inputs before submission
- **Loading States**: Shows loading state during generation task creation
        `,
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
  args: {
    onOpenChange: fn(),
    onSuccess: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Veo3GenerationModal>;

/**
 * Default state with TEXT_2_VIDEO generation type
 */
export const Default: Story = {
  args: {
    open: true,
    promptId: 'prompt_123',
    promptContent: 'A serene Japanese garden with cherry blossoms in full bloom, gentle breeze moving the petals',
  },
};

/**
 * Modal in closed state
 */
export const Closed: Story = {
  args: {
    open: false,
    promptId: 'prompt_123',
    promptContent: 'A beautiful sunset over mountains',
  },
};

/**
 * Long prompt content to test textarea scrolling
 */
export const LongPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_456',
    promptContent: `A cinematic aerial drone shot starting from a mountain peak at sunrise, slowly descending through misty clouds, revealing a vast forest canopy with morning dew glistening on leaves. The camera continues to descend, weaving between ancient trees, until it reaches a crystal-clear stream flowing through moss-covered rocks. Wildlife including deer and birds appear naturally in their habitat. The lighting shifts from warm golden sunrise tones to cooler forest shadows, creating a dramatic contrast. Shot in 8K resolution with cinematic color grading, professional stabilization, and realistic physics.`,
  },
};

/**
 * Empty prompt to demonstrate validation
 */
export const EmptyPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_789',
    promptContent: '',
  },
};

/**
 * Short prompt for quick testing
 */
export const ShortPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_012',
    promptContent: 'A cat playing with yarn',
  },
};

/**
 * Video prompt with action
 */
export const ActionPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_345',
    promptContent: 'A skateboarder performing a kickflip in slow motion at a skate park during golden hour',
  },
};

/**
 * Nature scene prompt
 */
export const NaturePrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_678',
    promptContent: 'Underwater coral reef teeming with colorful tropical fish, sea turtles, and rays, captured with cinematic lighting',
  },
};

/**
 * Urban scene prompt
 */
export const UrbanPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_901',
    promptContent: 'Time-lapse of a busy city intersection at night with car light trails, neon signs, and pedestrians',
  },
};

/**
 * Fantasy/Creative prompt
 */
export const FantasyPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_234',
    promptContent: 'A magical floating island with waterfalls cascading into clouds below, ancient ruins covered in glowing crystals',
  },
};

/**
 * Technical/Product prompt
 */
export const ProductPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_567',
    promptContent: 'Professional product reveal of a luxury watch rotating on a pedestal with dramatic studio lighting and reflective surface',
  },
};

/**
 * Interactive example showing all form fields
 * Users can interact with all controls to see how they work
 */
export const Interactive: Story = {
  args: {
    open: true,
    promptId: 'prompt_interactive',
    promptContent: 'Edit this prompt and try different settings!',
  },
  parameters: {
    docs: {
      description: {
        story: 'Try interacting with all form fields: change the prompt, select different model variants, generation types, aspect ratios, and add a seed value.',
      },
    },
  },
};

/**
 * Example with seed value pre-configured
 */
export const WithSeed: Story = {
  args: {
    open: true,
    promptId: 'prompt_seed',
    promptContent: 'A reproducible scene with a specific seed value',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example showing how to use seed values for reproducible results. Enter a seed between 10000-99999.',
      },
    },
  },
};

/**
 * Portrait aspect ratio use case
 */
export const PortraitVideo: Story = {
  args: {
    open: true,
    promptId: 'prompt_portrait',
    promptContent: 'A person walking through a forest path, shot in vertical format for social media',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example for portrait (9:16) videos, commonly used for mobile and social media platforms.',
      },
    },
  },
};

/**
 * Landscape aspect ratio use case
 */
export const LandscapeVideo: Story = {
  args: {
    open: true,
    promptId: 'prompt_landscape',
    promptContent: 'Wide panoramic shot of a desert landscape at sunset with dramatic clouds',
  },
  parameters: {
    docs: {
      description: {
        story: 'Example for landscape (16:9) videos, the standard format for YouTube and traditional media.',
      },
    },
  },
};

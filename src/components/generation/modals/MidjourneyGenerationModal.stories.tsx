/**
 * MidjourneyGenerationModal Storybook Stories
 *
 * Interactive documentation for Midjourney generation modal.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MidjourneyGenerationModal } from './MidjourneyGenerationModal';

/**
 * Story wrapper with React Query provider
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

const meta: Meta<typeof MidjourneyGenerationModal> = {
  title: 'Generation/Modals/MidjourneyGenerationModal',
  component: MidjourneyGenerationModal,
  decorators: [
    (Story) => (
      <StoryWrapper>
        <Story />
      </StoryWrapper>
    ),
  ],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal for generating images/videos with Midjourney via Kie.ai. Supports advanced parameters like variety, stylization, and weirdness.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Whether the modal is open',
    },
    onOpenChange: {
      description: 'Callback when modal open state changes',
    },
    promptId: {
      control: 'text',
      description: 'ID of the prompt node',
    },
    promptContent: {
      control: 'text',
      description: 'Pre-filled prompt content',
    },
    onSuccess: {
      description: 'Callback after successful generation',
    },
  },
  args: {
    open: true,
    onOpenChange: fn(),
    onSuccess: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof MidjourneyGenerationModal>;

/**
 * Default modal state with basic prompt
 */
export const Default: Story = {
  args: {
    promptId: 'prompt_123',
    promptContent: 'A beautiful sunset over mountains',
  },
};

/**
 * Short prompt for text-to-image generation
 */
export const ShortPrompt: Story = {
  args: {
    promptId: 'prompt_456',
    promptContent: 'Cute cat',
  },
};

/**
 * Long descriptive prompt
 */
export const LongPrompt: Story = {
  args: {
    promptId: 'prompt_789',
    promptContent:
      'A highly detailed, photorealistic landscape painting of a serene mountain valley at golden hour, with dramatic clouds in the sky, a winding river flowing through lush green meadows, and snow-capped peaks in the distance. The lighting is warm and ethereal, creating long shadows and highlighting the textures of rocks and vegetation. Style inspired by Albert Bierstadt and Thomas Moran, with rich colors and atmospheric perspective.',
  },
};

/**
 * Empty prompt (validation state)
 */
export const EmptyPrompt: Story = {
  args: {
    promptId: 'prompt_empty',
    promptContent: '',
  },
};

/**
 * Near max length prompt (validation boundary)
 */
export const NearMaxLength: Story = {
  args: {
    promptId: 'prompt_long',
    promptContent:
      'A '.repeat(666) + 'beautiful sunset', // ~1998 characters
  },
};

/**
 * Anime style prompt (Niji mode)
 */
export const AnimeStyle: Story = {
  args: {
    promptId: 'prompt_anime',
    promptContent:
      'Anime girl with pink hair, wearing a school uniform, standing in a cherry blossom garden, soft lighting, Studio Ghibli style, detailed background',
  },
};

/**
 * Portrait format prompt
 */
export const PortraitFormat: Story = {
  args: {
    promptId: 'prompt_portrait',
    promptContent: 'Professional headshot of a businesswoman, studio lighting, neutral background',
  },
};

/**
 * Landscape format prompt
 */
export const LandscapeFormat: Story = {
  args: {
    promptId: 'prompt_landscape',
    promptContent: 'Panoramic view of a coastal city at night, city lights reflecting on water',
  },
};

/**
 * Video generation prompt
 */
export const VideoGeneration: Story = {
  args: {
    promptId: 'prompt_video',
    promptContent: 'A drone flying over a forest, smooth camera movement, cinematic lighting',
  },
};

/**
 * Style reference prompt
 */
export const StyleReference: Story = {
  args: {
    promptId: 'prompt_style',
    promptContent: 'A futuristic city with neon lights, cyberpunk aesthetic, vibrant colors',
  },
};

/**
 * Abstract art prompt
 */
export const AbstractArt: Story = {
  args: {
    promptId: 'prompt_abstract',
    promptContent:
      'Abstract geometric shapes floating in space, gradient colors, minimalist composition, 3D render',
  },
};

/**
 * Photorealistic prompt
 */
export const Photorealistic: Story = {
  args: {
    promptId: 'prompt_photo',
    promptContent:
      'Photorealistic portrait of an elderly man with weathered features, dramatic side lighting, black and white, high contrast, Hasselblad camera',
  },
};

/**
 * Fantasy scene prompt
 */
export const FantasyScene: Story = {
  args: {
    promptId: 'prompt_fantasy',
    promptContent:
      'A magical forest with glowing mushrooms, ethereal light beams filtering through ancient trees, mystical atmosphere, fairy tale setting, detailed fantasy illustration',
  },
};

/**
 * Architectural prompt
 */
export const Architecture: Story = {
  args: {
    promptId: 'prompt_arch',
    promptContent:
      'Modern minimalist house in the mountains, large glass windows, surrounded by pine trees, golden hour lighting, architectural photography',
  },
};

/**
 * Product photography prompt
 */
export const ProductPhotography: Story = {
  args: {
    promptId: 'prompt_product',
    promptContent:
      'Luxury watch on a marble surface, studio lighting, reflections, high-end product photography, macro detail, professional composition',
  },
};

/**
 * Closed modal state
 */
export const Closed: Story = {
  args: {
    open: false,
    promptId: 'prompt_closed',
    promptContent: 'This modal is closed',
  },
};

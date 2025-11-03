/**
 * Imagen4GenerationModal Storybook Stories
 *
 * Interactive documentation for Imagen4 generation modal component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import { Imagen4GenerationModal } from './Imagen4GenerationModal';

const meta: Meta<typeof Imagen4GenerationModal> = {
  title: 'Generation/Modals/Imagen4GenerationModal',
  component: Imagen4GenerationModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal for creating Imagen4 image generation tasks. Provides form for configuring generation parameters including prompt, negative prompt, aspect ratio, number of images, and seed.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls modal visibility',
    },
    onOpenChange: {
      description: 'Callback fired when modal open state changes',
    },
    promptId: {
      control: 'text',
      description: 'ID of the prompt to generate from',
    },
    promptContent: {
      control: 'text',
      description: 'Initial prompt content to pre-fill',
    },
    onSuccess: {
      description: 'Callback fired on successful task creation',
    },
  },
  args: {
    onOpenChange: fn(),
    onSuccess: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof Imagen4GenerationModal>;

/**
 * Default state of the modal with a sample prompt
 */
export const Default: Story = {
  args: {
    open: true,
    promptId: 'prompt_123',
    promptContent: 'A beautiful sunset over mountains with dramatic clouds',
  },
};

/**
 * Modal with a longer, more detailed prompt
 */
export const LongPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_456',
    promptContent:
      'A hyper-realistic photograph of a serene Japanese garden in spring, with cherry blossom trees in full bloom, ' +
      'traditional stone lanterns, a koi pond with wooden bridge, perfectly maintained zen rock garden, soft morning ' +
      'light filtering through the trees, professional photography, 8k resolution, National Geographic style',
  },
};

/**
 * Modal with a short, simple prompt
 */
export const ShortPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_789',
    promptContent: 'A cat wearing sunglasses',
  },
};

/**
 * Modal with an image generation prompt focused on style
 */
export const StyleFocusedPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_abc',
    promptContent:
      'Studio Ghibli style illustration of a cozy coffee shop on a rainy day',
  },
};

/**
 * Modal with a technical/architectural prompt
 */
export const TechnicalPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_def',
    promptContent:
      'Modern minimalist architecture, glass and concrete building, golden hour lighting, architectural photography',
  },
};

/**
 * Modal closed (for testing open state transition)
 */
export const Closed: Story = {
  args: {
    open: false,
    promptId: 'prompt_closed',
    promptContent: 'This modal is closed',
  },
};

/**
 * Interactive example with all controls enabled
 */
export const Interactive: Story = {
  args: {
    open: true,
    promptId: 'prompt_interactive',
    promptContent: 'An abstract painting with vibrant colors',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive example where you can modify all props and see how the modal responds.',
      },
    },
  },
};

/**
 * Example showing validation (empty prompt would trigger error)
 */
export const EmptyPrompt: Story = {
  args: {
    open: true,
    promptId: 'prompt_empty',
    promptContent: '',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example with empty prompt. Clicking "Generate" will show validation error.',
      },
    },
  },
};

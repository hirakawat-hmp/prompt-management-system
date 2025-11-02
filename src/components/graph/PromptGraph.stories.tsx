import type { Meta, StoryObj } from '@storybook/react';
import { PromptGraph } from './PromptGraph';
import type { Prompt } from '@/types/prompt';

const meta: Meta<typeof PromptGraph> = {
  title: 'Components/Graph/PromptGraph',
  component: PromptGraph,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
  argTypes: {
    prompts: {
      description: 'Array of prompts to visualize in the graph',
    },
    selectedPromptId: {
      description: 'ID of the currently selected prompt',
      control: 'text',
    },
    onPromptSelect: {
      description: 'Callback when a prompt is selected',
      action: 'prompt-selected',
    },
    showMinimap: {
      description: 'Whether to show the minimap',
      control: 'boolean',
    },
    showControls: {
      description: 'Whether to show zoom controls',
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof PromptGraph>;

// Helper function to generate mock prompts
function createMockPrompt(
  id: string,
  content: string,
  type: 'image' | 'video' = 'image',
  parentId?: string
): Prompt {
  return {
    id,
    type,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    assets: [],
    ...(parentId && {
      parent: {
        id: parentId,
        content: `Parent content for ${parentId}`,
      },
    }),
  };
}

// Linear derivation chain
const linearPrompts: Prompt[] = [
  createMockPrompt(
    'prompt-1',
    'A beautiful mountain landscape with a clear blue sky and snow-capped peaks',
    'image'
  ),
  createMockPrompt(
    'prompt-2',
    'Same landscape but during golden hour with warm sunset colors illuminating the mountains',
    'image',
    'prompt-1'
  ),
  createMockPrompt(
    'prompt-3',
    'Add dramatic storm clouds rolling over the mountains with lightning strikes',
    'image',
    'prompt-2'
  ),
  createMockPrompt(
    'prompt-4',
    'Transform the storm into a time-lapse video showing the weather changing',
    'video',
    'prompt-3'
  ),
  createMockPrompt(
    'prompt-5',
    'Animate the clouds moving and the lightning flashing in slow motion',
    'video',
    'prompt-4'
  ),
];

// Branching tree structure
const branchingPrompts: Prompt[] = [
  createMockPrompt(
    'root',
    'A serene Japanese garden with a koi pond and cherry blossom trees',
    'image'
  ),
  createMockPrompt(
    'branch-1a',
    'Focus on the koi fish swimming gracefully in the crystal-clear water',
    'image',
    'root'
  ),
  createMockPrompt(
    'branch-1b',
    'Zoom in on the cherry blossoms with petals gently falling',
    'image',
    'root'
  ),
  createMockPrompt(
    'branch-1c',
    'Show the traditional stone lantern with moss growing on it',
    'image',
    'root'
  ),
  createMockPrompt(
    'branch-2a',
    'Animate the koi fish movement in a peaceful underwater scene',
    'video',
    'branch-1a'
  ),
  createMockPrompt(
    'branch-2b',
    'Create a slow-motion video of cherry blossom petals floating down',
    'video',
    'branch-1b'
  ),
  createMockPrompt(
    'branch-2c',
    'Add traditional Japanese music and ambient garden sounds',
    'video',
    'branch-2a'
  ),
];

// Large graph for stress testing
const largePrompts: Prompt[] = Array.from({ length: 20 }, (_, i) => {
  const id = `prompt-${i + 1}`;
  const parentId = i > 0 ? `prompt-${Math.floor(Math.random() * i) + 1}` : undefined;
  const type = i % 3 === 0 ? 'video' : 'image';

  return createMockPrompt(
    id,
    `This is prompt ${i + 1} with some descriptive content about the image or video generation task`,
    type,
    parentId
  );
});

/**
 * Default story showing a linear derivation chain of 5 prompts.
 * This demonstrates how prompts evolve from one to another in a simple hierarchy.
 */
export const Default: Story = {
  args: {
    prompts: linearPrompts,
    showMinimap: false,
    showControls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Branching tree structure showing multiple derivations from a single root prompt.
 * This demonstrates how a single idea can spawn multiple creative directions.
 */
export const WithBranching: Story = {
  args: {
    prompts: branchingPrompts,
    showMinimap: true,
    showControls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Large graph with 20 prompts demonstrating performance with many nodes.
 * Includes both minimap and controls for easier navigation.
 */
export const Large: Story = {
  args: {
    prompts: largePrompts,
    showMinimap: true,
    showControls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Graph with a selected prompt to demonstrate the selection highlight.
 * The selected prompt is shown with a highlighted border.
 */
export const WithSelection: Story = {
  args: {
    prompts: linearPrompts,
    selectedPromptId: 'prompt-3',
    showMinimap: false,
    showControls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Minimal graph with just two prompts showing a parent-child relationship.
 * Useful for testing and demonstrating the basic functionality.
 */
export const Minimal: Story = {
  args: {
    prompts: [
      createMockPrompt('parent', 'Original prompt idea', 'image'),
      createMockPrompt('child', 'Derived prompt with modifications', 'image', 'parent'),
    ],
    showMinimap: false,
    showControls: false,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

/**
 * Empty graph showing the component with no prompts.
 * Demonstrates the empty state gracefully.
 */
export const Empty: Story = {
  args: {
    prompts: [],
    showMinimap: false,
    showControls: true,
  },
  decorators: [
    (Story) => (
      <div style={{ width: '100vw', height: '100vh' }}>
        <Story />
      </div>
    ),
  ],
};

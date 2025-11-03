/**
 * Sora2GenerationModal Storybook Stories
 *
 * Interactive documentation for the Sora2 video generation modal.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sora2GenerationModal } from './Sora2GenerationModal';
import { Button } from '@/components/ui/button';

// Create a QueryClient for stories
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

/**
 * Wrapper component to handle state
 */
function Sora2GenerationModalWrapper({
  initialOpen = false,
  promptId = 'prompt_demo',
  promptContent = 'A serene Japanese garden with cherry blossoms in full bloom, gentle wind creating a peaceful atmosphere',
}: {
  initialOpen?: boolean;
  promptId?: string;
  promptContent?: string;
}) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Button onClick={() => setOpen(true)}>Open Sora2 Generation Modal</Button>
        <Sora2GenerationModal
          promptId={promptId}
          promptContent={promptContent}
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => {
            console.log('Sora2 video generation task created successfully!');
          }}
        />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof Sora2GenerationModal> = {
  title: 'Components/Generation/Sora2GenerationModal',
  component: Sora2GenerationModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal for generating videos with Sora2 AI model. Configure aspect ratio, duration, watermark settings, and prompt to create high-quality AI-generated videos.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    promptId: {
      description: 'ID of the prompt to generate video for',
      control: 'text',
    },
    promptContent: {
      description: 'Initial prompt content (editable)',
      control: 'text',
    },
    open: {
      description: 'Whether the modal is open',
      control: 'boolean',
    },
    onOpenChange: {
      description: 'Callback when open state changes',
      action: 'onOpenChange',
    },
    onSuccess: {
      description: 'Callback when generation task is created successfully',
      action: 'onSuccess',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Sora2GenerationModal>;

/**
 * Default story - modal closed, click button to open
 */
export const Default: Story = {
  render: () => <Sora2GenerationModalWrapper initialOpen={false} />,
  parameters: {
    docs: {
      description: {
        story:
          'Default state with the modal closed. Click the button to open the modal and configure Sora2 video generation parameters.',
      },
    },
  },
};

/**
 * Modal open - showing the generation form
 */
export const Open: Story = {
  render: () => <Sora2GenerationModalWrapper initialOpen={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Modal in open state, ready for video generation. Users can configure aspect ratio, duration, and watermark settings.',
      },
    },
  },
};

/**
 * Landscape video (default)
 */
export const LandscapeVideo: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <QueryClientProvider client={queryClient}>
        <div>
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            Default configuration with landscape aspect ratio (16:9) and 10 second duration.
          </p>
          <Sora2GenerationModal
            promptId="prompt_demo"
            promptContent="A drone flyover of a futuristic city at sunset, neon lights reflecting off glass buildings"
            open={open}
            onOpenChange={setOpen}
            onSuccess={() => console.log('Landscape video generation started!')}
          />
        </div>
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Generate a landscape (16:9) video. This is the default aspect ratio, ideal for standard video content and YouTube.',
      },
    },
  },
};

/**
 * Portrait video (for mobile/social media)
 */
export const PortraitVideo: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <QueryClientProvider client={queryClient}>
        <div>
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            Portrait aspect ratio (9:16) optimized for mobile viewing and social media platforms like TikTok, Instagram Reels, and YouTube Shorts.
          </p>
          <Sora2GenerationModal
            promptId="prompt_demo"
            promptContent="A person walking through a busy Tokyo street at night, neon signs and crowds creating a vibrant atmosphere"
            open={open}
            onOpenChange={setOpen}
            onSuccess={() => console.log('Portrait video generation started!')}
          />
        </div>
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Generate a portrait (9:16) video optimized for mobile devices and social media platforms.',
      },
    },
  },
};

/**
 * Long duration video (15 seconds)
 */
export const LongDuration: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <QueryClientProvider client={queryClient}>
        <div>
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            Extended 15-second duration for more complex scenes and narratives.
          </p>
          <Sora2GenerationModal
            promptId="prompt_demo"
            promptContent="A time-lapse of clouds moving over a mountain range, sunrise slowly illuminating the peaks with golden light"
            open={open}
            onOpenChange={setOpen}
            onSuccess={() => console.log('15-second video generation started!')}
          />
        </div>
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Generate a 15-second video for more elaborate scenes that need additional time to unfold.',
      },
    },
  },
};

/**
 * With watermark removal
 */
export const WithoutWatermark: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <QueryClientProvider client={queryClient}>
        <div>
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            Enable "Remove Watermark" option to generate videos without branding for commercial use.
          </p>
          <Sora2GenerationModal
            promptId="prompt_demo"
            promptContent="A professional product showcase video of a luxury watch rotating on a pedestal"
            open={open}
            onOpenChange={setOpen}
            onSuccess={() => console.log('Watermark-free video generation started!')}
          />
        </div>
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Generate videos without watermarks for professional or commercial use. Check the "Remove Watermark" option.',
      },
    },
  },
};

/**
 * Custom prompt editing
 */
export const EditablePrompt: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <QueryClientProvider client={queryClient}>
        <div>
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            The prompt is pre-filled but fully editable. Refine your prompt to get the perfect video.
          </p>
          <Sora2GenerationModal
            promptId="prompt_demo"
            promptContent="Original prompt text that can be edited"
            open={open}
            onOpenChange={setOpen}
            onSuccess={() => console.log('Custom prompt video generation started!')}
          />
        </div>
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Prompts are pre-filled from the prompt content but can be edited before generation. Refine the prompt to achieve your desired video output.',
      },
    },
  },
};

/**
 * Complex scene prompt
 */
export const ComplexScene: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <QueryClientProvider client={queryClient}>
        <div>
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            Example of a detailed, complex prompt for cinematic video generation.
          </p>
          <Sora2GenerationModal
            promptId="prompt_demo"
            promptContent="Cinematic aerial shot of a medieval castle perched on a cliff overlooking the ocean during a dramatic storm. Lightning illuminates the dark clouds while waves crash against the rocks below. Camera slowly orbits the castle revealing intricate architecture and flickering torches in the windows. Ultra-realistic, 4K quality, dramatic lighting, moody atmosphere."
            open={open}
            onOpenChange={setOpen}
            onSuccess={() => console.log('Complex scene video generation started!')}
          />
        </div>
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Example of a detailed, cinematic prompt with specific camera movements, lighting, and atmosphere descriptions for high-quality video generation.',
      },
    },
  },
};

/**
 * Closed state - for reference
 */
export const Closed: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col gap-4 items-center">
          <p className="text-sm text-muted-foreground">
            Modal is closed. Click the button below to open it.
          </p>
          <Button onClick={() => setOpen(true)}>Open Sora2 Modal</Button>
          <Sora2GenerationModal
            promptId="prompt_demo"
            promptContent="A serene Japanese garden with cherry blossoms"
            open={open}
            onOpenChange={setOpen}
          />
        </div>
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal in closed state. This demonstrates the trigger mechanism.',
      },
    },
  },
};

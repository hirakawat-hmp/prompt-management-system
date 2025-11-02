/**
 * NewPromptModal Storybook Stories
 *
 * Interactive documentation for the new prompt creation modal.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NewPromptModal } from './NewPromptModal';
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
function NewPromptModalWrapper({
  initialOpen = false,
  projectId = 'proj_demo',
}: {
  initialOpen?: boolean;
  projectId?: string;
}) {
  const [open, setOpen] = useState(initialOpen);

  return (
    <QueryClientProvider client={queryClient}>
      <div>
        <Button onClick={() => setOpen(true)}>Open New Prompt Modal</Button>
        <NewPromptModal
          projectId={projectId}
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => {
            console.log('Prompt created successfully!');
          }}
        />
      </div>
    </QueryClientProvider>
  );
}

const meta: Meta<typeof NewPromptModal> = {
  title: 'Components/Prompts/NewPromptModal',
  component: NewPromptModal,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Modal for creating new root prompts with manual input or AI generation. Supports both image and video content types.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    projectId: {
      description: 'ID of the project to create the prompt in',
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
      description: 'Callback when prompt is created successfully',
      action: 'onSuccess',
    },
  },
};

export default meta;
type Story = StoryObj<typeof NewPromptModal>;

/**
 * Default story - modal closed, click button to open
 */
export const Default: Story = {
  render: () => <NewPromptModalWrapper initialOpen={false} />,
  parameters: {
    docs: {
      description: {
        story:
          'Default state with the modal closed. Click the button to open the modal and create a new prompt.',
      },
    },
  },
};

/**
 * Modal open - showing the creation form
 */
export const Open: Story = {
  render: () => <NewPromptModalWrapper initialOpen={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Modal in open state, ready for prompt creation. Users can enter manual content or use AI generation.',
      },
    },
  },
};

/**
 * With manual content - example of manual input
 */
export const WithManualContent: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <QueryClientProvider client={queryClient}>
        <NewPromptModal
          projectId="proj_demo"
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => console.log('Success!')}
        />
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal with manual content entry. Users can type their prompt directly into the textarea.',
      },
    },
  },
};

/**
 * Video type - demonstrating video content type
 */
export const VideoType: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <QueryClientProvider client={queryClient}>
        <NewPromptModal
          projectId="proj_demo"
          open={open}
          onOpenChange={setOpen}
          onSuccess={() => console.log('Video prompt created!')}
        />
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Modal configured for video content type. Change the type selector to "Video" to create video prompts.',
      },
    },
  },
};

/**
 * AI generation flow - interactive demo
 */
export const AIGeneration: Story = {
  render: () => {
    const [open, setOpen] = useState(true);

    return (
      <QueryClientProvider client={queryClient}>
        <div>
          <p className="mb-4 text-sm text-muted-foreground max-w-md">
            Enter requirements in the "Requirements" field and click "Generate
            with AI" to automatically create an optimized prompt.
          </p>
          <NewPromptModal
            projectId="proj_demo"
            open={open}
            onOpenChange={setOpen}
            onSuccess={() => console.log('AI-generated prompt created!')}
          />
        </div>
      </QueryClientProvider>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the AI generation workflow. Enter requirements like "A peaceful garden with cherry blossoms" and the AI will generate an optimized prompt.',
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
          <Button onClick={() => setOpen(true)}>Open Modal</Button>
          <NewPromptModal
            projectId="proj_demo"
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

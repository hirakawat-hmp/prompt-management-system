/**
 * GenerationTaskList Component Stories
 *
 * Visual examples and documentation for the generation task list component.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GenerationTaskList } from './GenerationTaskList';
import type { GenerationTask } from '@prisma/client';

// Mock tasks
const mockTasks: GenerationTask[] = [
  {
    id: 'task_1',
    promptId: 'prompt_123',
    service: 'KIE',
    model: 'IMAGEN4',
    externalTaskId: 'ext_1',
    status: 'SUCCESS',
    providerParams: {},
    resultJson: JSON.stringify({
      resultUrls: [
        'https://picsum.photos/seed/1/400/400',
        'https://picsum.photos/seed/2/400/400',
      ],
    }),
    failCode: null,
    failMsg: null,
    createdAt: new Date('2025-01-01T12:00:00Z'),
    completedAt: new Date('2025-01-01T12:05:00Z'),
  } as GenerationTask,
  {
    id: 'task_2',
    promptId: 'prompt_123',
    service: 'KIE',
    model: 'VEO3',
    externalTaskId: 'ext_2',
    status: 'PENDING',
    providerParams: {},
    resultJson: null,
    failCode: null,
    failMsg: null,
    createdAt: new Date('2025-01-01T11:55:00Z'),
    completedAt: null,
  } as GenerationTask,
  {
    id: 'task_3',
    promptId: 'prompt_123',
    service: 'KIE',
    model: 'MIDJOURNEY',
    externalTaskId: 'ext_3',
    status: 'FAILED',
    providerParams: {},
    resultJson: null,
    failCode: '422',
    failMsg: 'Invalid parameters provided',
    createdAt: new Date('2025-01-01T11:50:00Z'),
    completedAt: new Date('2025-01-01T11:50:30Z'),
  } as GenerationTask,
];

// Query client wrapper
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

function Wrapper({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

const meta: Meta<typeof GenerationTaskList> = {
  title: 'Generation/GenerationTaskList',
  component: GenerationTaskList,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Displays a list of generation tasks with status indicators, metadata, and result previews.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <Wrapper>
        <div className="w-[800px]">
          <Story />
        </div>
      </Wrapper>
    ),
  ],
  argTypes: {
    promptId: {
      description: 'The ID of the prompt to fetch tasks for',
      control: 'text',
    },
  },
};

export default meta;
type Story = StoryObj<typeof GenerationTaskList>;

/**
 * Default list with mixed task statuses
 */
export const Default: Story = {
  args: {
    promptId: 'prompt_123',
  },
  parameters: {
    msw: {
      handlers: [
        // Mock API response would go here
      ],
    },
  },
};

/**
 * Loading state with skeleton
 */
export const Loading: Story = {
  args: {
    promptId: 'prompt_123',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows skeleton loaders while data is being fetched.',
      },
    },
  },
};

/**
 * Empty state when no tasks exist
 */
export const Empty: Story = {
  args: {
    promptId: 'prompt_empty',
  },
  parameters: {
    docs: {
      description: {
        story: 'Displays a helpful message when there are no generation tasks.',
      },
    },
  },
};

/**
 * Error state when fetch fails
 */
export const Error: Story = {
  args: {
    promptId: 'prompt_error',
  },
  parameters: {
    docs: {
      description: {
        story: 'Shows error message when fetching tasks fails.',
      },
    },
  },
};

/**
 * List with successful tasks and results
 */
export const WithResults: Story = {
  args: {
    promptId: 'prompt_results',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Tasks with SUCCESS status display thumbnail previews of the generated images.',
      },
    },
  },
};

/**
 * List with pending tasks
 */
export const PendingTasks: Story = {
  args: {
    promptId: 'prompt_pending',
  },
  parameters: {
    docs: {
      description: {
        story: 'Pending tasks show a spinner and "waiting" message.',
      },
    },
  },
};

/**
 * List with failed tasks
 */
export const FailedTasks: Story = {
  args: {
    promptId: 'prompt_failed',
  },
  parameters: {
    docs: {
      description: {
        story: 'Failed tasks display error codes and messages for debugging.',
      },
    },
  },
};

/**
 * Full example with all task states
 */
export const AllStates: Story = {
  render: () => (
    <Wrapper>
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold">All Task States</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            This example shows all possible task states: SUCCESS with results, PENDING with
            spinner, and FAILED with error message.
          </p>
          <GenerationTaskList promptId="prompt_123" />
        </div>
      </div>
    </Wrapper>
  ),
};

/**
 * Multiple models example
 */
export const MultipleModels: Story = {
  render: () => (
    <Wrapper>
      <div className="space-y-6">
        <div>
          <h3 className="mb-4 text-lg font-semibold">Different AI Models</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            Tasks can be generated using different models: IMAGEN4 for images, VEO3 for
            videos, MIDJOURNEY for artistic images, and SORA2 for high-quality videos.
          </p>
          <GenerationTaskList promptId="prompt_123" />
        </div>
      </div>
    </Wrapper>
  ),
};

/**
 * With custom styling
 */
export const CustomStyling: Story = {
  args: {
    promptId: 'prompt_123',
    className: 'rounded-lg border-2 border-primary/20 p-4',
  },
  parameters: {
    docs: {
      description: {
        story: 'Component accepts custom className for styling flexibility.',
      },
    },
  },
};

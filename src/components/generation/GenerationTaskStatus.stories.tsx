/**
 * GenerationTaskStatus Component Stories
 *
 * Visual examples and documentation for the generation task status indicator.
 */

import type { Meta, StoryObj } from '@storybook/react';
import { GenerationTaskStatus } from './GenerationTaskStatus';
import type { GenerationTask } from '@prisma/client';

// Base mock task
const baseMockTask: GenerationTask = {
  id: 'task_123',
  promptId: 'prompt_123',
  service: 'KIE',
  model: 'IMAGEN4',
  externalTaskId: 'ext_123',
  status: 'PENDING',
  providerParams: {},
  resultJson: null,
  failCode: null,
  failMsg: null,
  createdAt: new Date('2025-01-01T12:00:00Z'),
  completedAt: null,
} as GenerationTask;

const meta: Meta<typeof GenerationTaskStatus> = {
  title: 'Generation/GenerationTaskStatus',
  component: GenerationTaskStatus,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Status indicator for generation tasks with color-coded badges and error messages.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    task: {
      description: 'The generation task to display status for',
      control: false,
    },
  },
};

export default meta;
type Story = StoryObj<typeof GenerationTaskStatus>;

/**
 * Pending status with spinner animation
 */
export const Pending: Story = {
  args: {
    task: {
      ...baseMockTask,
      status: 'PENDING',
    },
  },
};

/**
 * Success status with checkmark icon
 */
export const Success: Story = {
  args: {
    task: {
      ...baseMockTask,
      status: 'SUCCESS',
      completedAt: new Date('2025-01-01T12:05:00Z'),
    },
  },
};

/**
 * Failed status with error message
 */
export const Failed: Story = {
  args: {
    task: {
      ...baseMockTask,
      status: 'FAILED',
      failCode: '422',
      failMsg: 'Invalid parameters provided',
      completedAt: new Date('2025-01-01T12:01:00Z'),
    },
  },
};

/**
 * Failed with rate limit error
 */
export const FailedRateLimit: Story = {
  args: {
    task: {
      ...baseMockTask,
      status: 'FAILED',
      failCode: '429',
      failMsg: 'Rate limit exceeded. Please try again later.',
      completedAt: new Date('2025-01-01T12:00:30Z'),
    },
  },
};

/**
 * Failed with server error
 */
export const FailedServerError: Story = {
  args: {
    task: {
      ...baseMockTask,
      status: 'FAILED',
      failCode: '500',
      failMsg: 'Internal server error',
      completedAt: new Date('2025-01-01T12:00:15Z'),
    },
  },
};

/**
 * Failed with insufficient credits
 */
export const FailedInsufficientCredits: Story = {
  args: {
    task: {
      ...baseMockTask,
      status: 'FAILED',
      failCode: '402',
      failMsg: 'Insufficient credits. Please purchase more credits to continue.',
      completedAt: new Date('2025-01-01T12:00:10Z'),
    },
  },
};

/**
 * Multiple statuses displayed together
 */
export const AllStatuses: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Pending</h3>
        <GenerationTaskStatus
          task={{
            ...baseMockTask,
            status: 'PENDING',
          }}
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Success</h3>
        <GenerationTaskStatus
          task={{
            ...baseMockTask,
            status: 'SUCCESS',
            completedAt: new Date(),
          }}
        />
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Failed</h3>
        <GenerationTaskStatus
          task={{
            ...baseMockTask,
            status: 'FAILED',
            failCode: '422',
            failMsg: 'Validation error',
            completedAt: new Date(),
          }}
        />
      </div>
    </div>
  ),
};

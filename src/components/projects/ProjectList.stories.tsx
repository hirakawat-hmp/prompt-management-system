import type { Meta, StoryObj } from '@storybook/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fn } from '@storybook/test';
import { ProjectList } from './ProjectList';
import type { Project } from './types';

// Create a query client for Storybook
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      staleTime: Infinity,
    },
  },
});

// Helper function to generate mock projects
function generateMockProjects(count: number): Project[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `project-${i + 1}`,
    name: `Project ${i + 1}`,
    createdAt: new Date(2025, 0, i + 1), // Jan 1-N, 2025
    _count: {
      prompts: Math.floor(Math.random() * 20),
    },
  }));
}

const meta = {
  title: 'Components/Projects/ProjectList',
  component: ProjectList,
  parameters: {
    layout: 'padded',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  args: {
    onSelectProject: fn(),
  },
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <Story />
      </QueryClientProvider>
    ),
  ],
} satisfies Meta<typeof ProjectList>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default story with 3 projects
 */
export const Default: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: [
          {
            id: '1',
            name: 'Marketing Campaign',
            createdAt: new Date('2025-01-15'),
            _count: {
              prompts: 12,
            },
          },
          {
            id: '2',
            name: 'Product Documentation',
            createdAt: new Date('2025-01-20'),
            _count: {
              prompts: 8,
            },
          },
          {
            id: '3',
            name: 'Customer Support',
            createdAt: new Date('2025-01-25'),
            _count: {
              prompts: 5,
            },
          },
        ],
      },
    ],
  },
};

/**
 * Selected state - second project is selected
 */
export const WithSelection: Story = {
  args: {
    selectedProjectId: '2',
  },
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: [
          {
            id: '1',
            name: 'Marketing Campaign',
            createdAt: new Date('2025-01-15'),
            _count: {
              prompts: 12,
            },
          },
          {
            id: '2',
            name: 'Product Documentation',
            createdAt: new Date('2025-01-20'),
            _count: {
              prompts: 8,
            },
          },
          {
            id: '3',
            name: 'Customer Support',
            createdAt: new Date('2025-01-25'),
            _count: {
              prompts: 5,
            },
          },
        ],
      },
    ],
  },
};

/**
 * Empty state - no projects
 */
export const Empty: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: [],
      },
    ],
  },
};

/**
 * Loading state
 */
export const Loading: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: [],
        delay: 5000, // Simulate slow network
      },
    ],
  },
};

/**
 * Error state
 */
export const Error: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 500,
        response: { error: 'Internal server error' },
      },
    ],
  },
};

/**
 * Single project
 */
export const SingleProject: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: [
          {
            id: '1',
            name: 'My First Project',
            createdAt: new Date(),
            _count: {
              prompts: 1,
            },
          },
        ],
      },
    ],
  },
};

/**
 * Projects with no prompts
 */
export const ProjectsWithoutPrompts: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: [
          {
            id: '1',
            name: 'Empty Project 1',
            createdAt: new Date('2025-01-10'),
            _count: {
              prompts: 0,
            },
          },
          {
            id: '2',
            name: 'Empty Project 2',
            createdAt: new Date('2025-01-12'),
            _count: {
              prompts: 0,
            },
          },
        ],
      },
    ],
  },
};

/**
 * Many projects - tests scrolling behavior
 */
export const ManyProjects: Story = {
  args: {
    selectedProjectId: 'project-10',
  },
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: generateMockProjects(20),
      },
    ],
    docs: {
      description: {
        story: 'This story demonstrates the scrollable container with many projects.',
      },
    },
  },
};

/**
 * Projects with long names - tests text truncation
 */
export const LongProjectNames: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: [
          {
            id: '1',
            name: 'Very Long Project Name That Should Be Displayed Properly Without Breaking The Layout',
            createdAt: new Date('2025-01-01'),
            _count: {
              prompts: 15,
            },
          },
          {
            id: '2',
            name: 'Another Extremely Long Project Name For Testing UI Responsiveness And Text Overflow Handling',
            createdAt: new Date('2025-01-05'),
            _count: {
              prompts: 23,
            },
          },
          {
            id: '3',
            name: 'Short Name',
            createdAt: new Date('2025-01-10'),
            _count: {
              prompts: 3,
            },
          },
        ],
      },
    ],
  },
};

/**
 * Recent projects - shows date formatting
 */
export const RecentProjects: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: [
          {
            id: '1',
            name: 'Created Today',
            createdAt: new Date(),
            _count: {
              prompts: 5,
            },
          },
          {
            id: '2',
            name: 'Created Yesterday',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            _count: {
              prompts: 3,
            },
          },
          {
            id: '3',
            name: 'Created 3 Days Ago',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            _count: {
              prompts: 8,
            },
          },
          {
            id: '4',
            name: 'Created 2 Weeks Ago',
            createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            _count: {
              prompts: 12,
            },
          },
        ],
      },
    ],
    docs: {
      description: {
        story: 'Demonstrates different date formats: Today, Yesterday, X days ago, and full date.',
      },
    },
  },
};

/**
 * Projects missing _count - tests graceful handling
 */
export const ProjectsWithoutCount: Story = {
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: [
          {
            id: '1',
            name: 'Project Without Count',
            createdAt: new Date('2025-01-01'),
          },
          {
            id: '2',
            name: 'Project With Count',
            createdAt: new Date('2025-01-05'),
            _count: {
              prompts: 5,
            },
          },
        ],
      },
    ],
    docs: {
      description: {
        story: 'Tests that projects without _count display 0 prompts gracefully.',
      },
    },
  },
};

/**
 * Interactive example - full height container
 */
export const FullHeight: Story = {
  decorators: [
    (Story) => (
      <QueryClientProvider client={queryClient}>
        <div style={{ height: '600px', border: '1px solid #e5e7eb', borderRadius: '8px', padding: '1rem' }}>
          <Story />
        </div>
      </QueryClientProvider>
    ),
  ],
  parameters: {
    mockData: [
      {
        url: '/api/projects',
        method: 'GET',
        status: 200,
        response: generateMockProjects(15),
      },
    ],
    docs: {
      description: {
        story: 'This story shows the component in a full-height container to demonstrate scrolling.',
      },
    },
  },
};

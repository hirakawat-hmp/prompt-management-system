import type { Meta, StoryObj } from '@storybook/react';
import { ThreeColumnLayout } from './ThreeColumnLayout';

const meta = {
  title: 'Layout/ThreeColumnLayout',
  component: ThreeColumnLayout,
  parameters: {
    layout: 'fullscreen',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
  argTypes: {
    leftSidebarWidth: {
      control: { type: 'range', min: 200, max: 400, step: 10 },
      description: 'Width of the left sidebar in pixels',
    },
    centerPanelDefaultSize: {
      control: { type: 'range', min: 30, max: 70, step: 1 },
      description: 'Default size for center panel (percentage)',
    },
    rightPanelDefaultSize: {
      control: { type: 'range', min: 30, max: 70, step: 1 },
      description: 'Default size for right panel (percentage)',
    },
    centerPanelMinSize: {
      control: { type: 'range', min: 20, max: 60, step: 1 },
      description: 'Minimum size for center panel (percentage)',
    },
    rightPanelMinSize: {
      control: { type: 'range', min: 20, max: 60, step: 1 },
      description: 'Minimum size for right panel (percentage)',
    },
    rightPanelMaxSize: {
      control: { type: 'range', min: 40, max: 80, step: 1 },
      description: 'Maximum size for right panel (percentage)',
    },
  },
} satisfies Meta<typeof ThreeColumnLayout>;

export default meta;
type Story = StoryObj<typeof meta>;

// Sample content components for stories
const LeftPanelContent = () => (
  <div className="flex h-full flex-col gap-4 bg-neutral-50 p-4 dark:bg-neutral-900">
    <h2 className="text-lg font-semibold">Navigation</h2>
    <nav className="flex flex-col gap-2">
      <a href="#" className="rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
        Dashboard
      </a>
      <a href="#" className="rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
        Projects
      </a>
      <a href="#" className="rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800">
        Settings
      </a>
    </nav>
  </div>
);

const CenterPanelContent = () => (
  <div className="flex h-full flex-col gap-4 p-6">
    <h1 className="text-2xl font-bold">Main Content</h1>
    <div className="flex flex-col gap-4">
      <p>
        This is the main content area. It takes up the center of the layout and is resizable.
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Card 1</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Some content in the first card.
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Card 2</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Some content in the second card.
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Card 3</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Some content in the third card.
          </p>
        </div>
        <div className="rounded-lg border p-4">
          <h3 className="mb-2 font-semibold">Card 4</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Some content in the fourth card.
          </p>
        </div>
      </div>
    </div>
  </div>
);

const RightPanelContent = () => (
  <div className="flex h-full flex-col gap-4 bg-neutral-50 p-4 dark:bg-neutral-900">
    <h2 className="text-lg font-semibold">Sidebar</h2>
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border bg-white p-3 dark:bg-neutral-800">
        <h3 className="mb-1 text-sm font-medium">Info Panel</h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400">
          Additional information and tools.
        </p>
      </div>
      <div className="rounded-lg border bg-white p-3 dark:bg-neutral-800">
        <h3 className="mb-1 text-sm font-medium">Quick Actions</h3>
        <div className="flex flex-col gap-1">
          <button className="rounded-sm p-1 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700">
            Action 1
          </button>
          <button className="rounded-sm p-1 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700">
            Action 2
          </button>
        </div>
      </div>
    </div>
  </div>
);

export const Default: Story = {
  args: {
    leftPanel: <LeftPanelContent />,
    centerPanel: <CenterPanelContent />,
    rightPanel: <RightPanelContent />,
  },
  render: (args) => (
    <div className="h-screen w-full">
      <ThreeColumnLayout {...args} />
    </div>
  ),
};

export const SimpleText: Story = {
  args: {
    leftPanel: <div className="p-4">Left Panel</div>,
    centerPanel: <div className="p-4">Center Panel</div>,
    rightPanel: <div className="p-4">Right Panel</div>,
  },
  render: (args) => (
    <div className="h-screen w-full">
      <ThreeColumnLayout {...args} />
    </div>
  ),
};

export const WithSemanticHTML: Story = {
  args: {
    leftPanel: (
      <nav className="flex h-full flex-col gap-2 p-4" aria-label="Main navigation">
        <h2 className="text-lg font-semibold">Navigation</h2>
        <a href="#" className="text-blue-600 hover:underline">
          Home
        </a>
        <a href="#" className="text-blue-600 hover:underline">
          About
        </a>
        <a href="#" className="text-blue-600 hover:underline">
          Contact
        </a>
      </nav>
    ),
    centerPanel: (
      <main className="p-6">
        <h1 className="mb-4 text-3xl font-bold">Main Content</h1>
        <article>
          <p className="mb-4">
            This layout uses semantic HTML elements for better accessibility.
          </p>
          <p>The left panel is a nav, the center is main, and the right is aside.</p>
        </article>
      </main>
    ),
    rightPanel: (
      <aside className="p-4">
        <h2 className="mb-2 text-lg font-semibold">Related Links</h2>
        <ul className="flex flex-col gap-1">
          <li>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Link 1
            </a>
          </li>
          <li>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Link 2
            </a>
          </li>
        </ul>
      </aside>
    ),
  },
  render: (args) => (
    <div className="h-screen w-full">
      <ThreeColumnLayout {...args} />
    </div>
  ),
};

export const CustomSizes: Story = {
  args: {
    leftPanel: <div className="p-4">Left Sidebar (280px)</div>,
    centerPanel: <div className="p-4">Wide Center (60%)</div>,
    rightPanel: <div className="p-4">Right Panel (40%)</div>,
    leftSidebarWidth: 280,
    centerPanelDefaultSize: 60,
    rightPanelDefaultSize: 40,
  },
  render: (args) => (
    <div className="h-screen w-full">
      <ThreeColumnLayout {...args} />
    </div>
  ),
};

export const EqualWidths: Story = {
  args: {
    leftPanel: <div className="p-4">Left Sidebar (280px)</div>,
    centerPanel: <div className="p-4">Center (50%)</div>,
    rightPanel: <div className="p-4">Right (50%)</div>,
    leftSidebarWidth: 280,
    centerPanelDefaultSize: 50,
    rightPanelDefaultSize: 50,
  },
  render: (args) => (
    <div className="h-screen w-full">
      <ThreeColumnLayout {...args} />
    </div>
  ),
};

export const WithCustomClassName: Story = {
  args: {
    leftPanel: <div className="p-4">Left</div>,
    centerPanel: <div className="p-4">Center</div>,
    rightPanel: <div className="p-4">Right</div>,
    className: 'border-2 border-blue-500',
  },
  render: (args) => (
    <div className="h-screen w-full p-4">
      <ThreeColumnLayout {...args} />
    </div>
  ),
};

export const InteractiveDemo: Story = {
  args: {
    leftPanel: (
      <div className="flex h-full flex-col gap-2 bg-blue-50 p-4 dark:bg-blue-950">
        <h2 className="font-semibold text-blue-900 dark:text-blue-100">Left Panel</h2>
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Try dragging the resize handles to adjust panel widths!
        </p>
      </div>
    ),
    centerPanel: (
      <div className="flex h-full flex-col gap-2 bg-green-50 p-4 dark:bg-green-950">
        <h2 className="font-semibold text-green-900 dark:text-green-100">Center Panel</h2>
        <p className="text-sm text-green-700 dark:text-green-300">
          This panel has a minimum width of 40% to ensure readability.
        </p>
      </div>
    ),
    rightPanel: (
      <div className="flex h-full flex-col gap-2 bg-purple-50 p-4 dark:bg-purple-950">
        <h2 className="font-semibold text-purple-900 dark:text-purple-100">Right Panel</h2>
        <p className="text-sm text-purple-700 dark:text-purple-300">
          Each panel scrolls independently when content overflows.
        </p>
      </div>
    ),
  },
  render: (args) => (
    <div className="h-screen w-full">
      <ThreeColumnLayout {...args} />
    </div>
  ),
};

export const OverflowContent: Story = {
  args: {
    leftPanel: (
      <div className="p-4">
        <h2 className="mb-2 font-semibold">Long List</h2>
        {Array.from({ length: 50 }, (_, i) => (
          <div key={i} className="mb-1">
            Item {i + 1}
          </div>
        ))}
      </div>
    ),
    centerPanel: (
      <div className="p-4">
        <h1 className="mb-4 text-2xl font-bold">Long Article</h1>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i} className="mb-4">
            Paragraph {i + 1}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        ))}
      </div>
    ),
    rightPanel: (
      <div className="p-4">
        <h2 className="mb-2 font-semibold">Notes</h2>
        {Array.from({ length: 30 }, (_, i) => (
          <div key={i} className="mb-2 rounded border p-2 text-sm">
            Note {i + 1}
          </div>
        ))}
      </div>
    ),
  },
  render: (args) => (
    <div className="h-screen w-full">
      <ThreeColumnLayout {...args} />
    </div>
  ),
};

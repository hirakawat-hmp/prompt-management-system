/**
 * Example Usage of ThreeColumnLayout Component
 *
 * This file demonstrates various ways to use the ThreeColumnLayout component
 * in a Next.js application.
 */

import { ThreeColumnLayout } from '@/components/layout';

// Example 1: Basic Usage with Semantic HTML
export function BasicLayoutExample() {
  return (
    <div className="h-screen">
      <ThreeColumnLayout
        leftPanel={
          <nav className="p-4" aria-label="Main navigation">
            <h2 className="mb-4 text-lg font-semibold">Navigation</h2>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-blue-600 hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="text-blue-600 hover:underline">
                  About
                </a>
              </li>
            </ul>
          </nav>
        }
        centerPanel={
          <main className="p-6">
            <h1 className="mb-4 text-3xl font-bold">Main Content</h1>
            <p>Your main content goes here.</p>
          </main>
        }
        rightPanel={
          <aside className="p-4">
            <h2 className="mb-2 text-lg font-semibold">Sidebar</h2>
            <p className="text-sm text-neutral-600">Additional information</p>
          </aside>
        }
      />
    </div>
  );
}

// Example 2: Dashboard Layout with Custom Sizes
export function DashboardLayoutExample() {
  return (
    <div className="h-screen">
      <ThreeColumnLayout
        leftSidebarWidth={240}
        centerPanelDefaultSize={60}
        rightPanelDefaultSize={40}
        leftPanel={
          <nav className="flex h-full flex-col bg-neutral-50 p-4 dark:bg-neutral-900">
            <h2 className="mb-4 text-sm font-semibold uppercase text-neutral-500">
              Menu
            </h2>
            <div className="space-y-1">
              <a
                href="#"
                className="flex items-center rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Dashboard
              </a>
              <a
                href="#"
                className="flex items-center rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Projects
              </a>
              <a
                href="#"
                className="flex items-center rounded-md p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Settings
              </a>
            </div>
          </nav>
        }
        centerPanel={
          <main className="p-6">
            <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Metric 1</h3>
                <p className="text-3xl font-bold">1,234</p>
              </div>
              <div className="rounded-lg border p-4">
                <h3 className="mb-2 font-semibold">Metric 2</h3>
                <p className="text-3xl font-bold">5,678</p>
              </div>
            </div>
          </main>
        }
        rightPanel={
          <aside className="flex flex-col gap-4 bg-neutral-50 p-4 dark:bg-neutral-900">
            <div className="rounded-lg border bg-white p-3 dark:bg-neutral-800">
              <h3 className="mb-2 text-sm font-medium">Recent Activity</h3>
              <ul className="space-y-1 text-xs">
                <li>Activity 1</li>
                <li>Activity 2</li>
                <li>Activity 3</li>
              </ul>
            </div>
          </aside>
        }
      />
    </div>
  );
}

// Example 3: Project Management Layout
export function ProjectManagementLayoutExample() {
  return (
    <div className="h-screen">
      <ThreeColumnLayout
        leftPanel={
          <div className="flex h-full flex-col p-4">
            <h2 className="mb-4 text-lg font-semibold">Projects</h2>
            <div className="flex flex-1 flex-col gap-2 overflow-auto">
              {['Project A', 'Project B', 'Project C', 'Project D'].map((project) => (
                <button
                  key={project}
                  className="rounded-md border p-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-900"
                >
                  <div className="font-medium">{project}</div>
                  <div className="text-xs text-neutral-500">Active</div>
                </button>
              ))}
            </div>
          </div>
        }
        centerPanel={
          <div className="flex h-full flex-col p-6">
            <header className="mb-6">
              <h1 className="mb-2 text-2xl font-bold">Project Details</h1>
              <p className="text-neutral-600">View and manage project information</p>
            </header>
            <div className="flex-1 overflow-auto">
              <div className="space-y-4">
                <section>
                  <h2 className="mb-2 text-lg font-semibold">Overview</h2>
                  <p>Project overview content goes here...</p>
                </section>
                <section>
                  <h2 className="mb-2 text-lg font-semibold">Tasks</h2>
                  <div className="space-y-2">
                    <div className="rounded-lg border p-3">
                      <div className="font-medium">Task 1</div>
                      <div className="text-sm text-neutral-500">In Progress</div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="font-medium">Task 2</div>
                      <div className="text-sm text-neutral-500">Completed</div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        }
        rightPanel={
          <div className="flex h-full flex-col p-4">
            <h2 className="mb-4 text-lg font-semibold">Details</h2>
            <div className="space-y-4 overflow-auto">
              <div>
                <h3 className="mb-1 text-sm font-medium text-neutral-500">Status</h3>
                <p className="font-medium">Active</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium text-neutral-500">Due Date</h3>
                <p className="font-medium">Dec 31, 2025</p>
              </div>
              <div>
                <h3 className="mb-1 text-sm font-medium text-neutral-500">Team</h3>
                <div className="space-y-1">
                  <div className="text-sm">Alice Johnson</div>
                  <div className="text-sm">Bob Smith</div>
                </div>
              </div>
            </div>
          </div>
        }
      />
    </div>
  );
}

// Example 4: With Custom Styling
export function CustomStyledLayoutExample() {
  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4">
      <ThreeColumnLayout
        className="rounded-lg border-2 border-blue-200 shadow-xl"
        leftPanel={
          <div className="h-full bg-gradient-to-b from-blue-100 to-blue-50 p-4">
            <h2 className="text-blue-900">Styled Left Panel</h2>
          </div>
        }
        centerPanel={
          <div className="h-full bg-white p-6">
            <h1 className="text-purple-900">Styled Center Panel</h1>
          </div>
        }
        rightPanel={
          <div className="h-full bg-gradient-to-b from-purple-100 to-purple-50 p-4">
            <h2 className="text-purple-900">Styled Right Panel</h2>
          </div>
        }
      />
    </div>
  );
}

// Example 5: Code Editor Layout Pattern
export function CodeEditorLayoutExample() {
  return (
    <div className="h-screen bg-neutral-900 text-white">
      <ThreeColumnLayout
        leftSidebarWidth={200}
        centerPanelDefaultSize={70}
        rightPanelDefaultSize={30}
        leftPanel={
          <div className="h-full bg-neutral-800 p-2">
            <h2 className="mb-2 px-2 text-sm font-semibold">Explorer</h2>
            <div className="space-y-0.5 text-sm">
              <div className="rounded p-1 hover:bg-neutral-700">📁 src</div>
              <div className="rounded p-1 pl-4 hover:bg-neutral-700">📄 index.ts</div>
              <div className="rounded p-1 pl-4 hover:bg-neutral-700">📄 utils.ts</div>
            </div>
          </div>
        }
        centerPanel={
          <div className="h-full bg-neutral-900 p-4">
            <h2 className="mb-2 text-sm text-neutral-400">index.ts</h2>
            <pre className="font-mono text-sm">
              <code>
                {`export function hello() {
  console.log("Hello, World!");
}`}
              </code>
            </pre>
          </div>
        }
        rightPanel={
          <div className="h-full bg-neutral-800 p-2">
            <h2 className="mb-2 px-2 text-sm font-semibold">Outline</h2>
            <div className="space-y-1 text-sm">
              <div className="rounded p-1 hover:bg-neutral-700">function hello()</div>
            </div>
          </div>
        }
      />
    </div>
  );
}

/**
 * Integration with Next.js App Router
 *
 * In a Next.js page:
 */
export default function Page() {
  return <BasicLayoutExample />;
}

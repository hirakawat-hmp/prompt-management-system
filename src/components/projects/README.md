# ProjectList Component

A responsive and accessible project list component built with TDD principles using shadcn/ui components.

## Features

- Display projects in card format
- Show project metadata (name, creation date, prompt count)
- Select/highlight projects
- Keyboard navigation support (Enter/Space)
- Empty state handling
- Scrollable container for many projects
- Responsive hover effects
- Graceful handling of missing data

## Usage

```tsx
import { ProjectList } from '@/components/projects';

function MyPage() {
  const [selectedId, setSelectedId] = useState<string>();
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'My Project',
      createdAt: new Date(),
      _count: { prompts: 5 },
    },
  ]);

  return (
    <ProjectList
      projects={projects}
      selectedProjectId={selectedId}
      onSelectProject={setSelectedId}
      onCreateProject={() => {
        // Handle project creation
      }}
    />
  );
}
```

## Props

### `projects` (required)

Array of project objects to display.

```typescript
type Project = {
  id: string;
  name: string;
  createdAt: Date;
  _count?: {
    prompts: number;
  };
};
```

### `selectedProjectId` (optional)

The ID of the currently selected project. If provided, the matching project will be highlighted with a primary border.

### `onSelectProject` (required)

Callback function called when a project is clicked or selected via keyboard (Enter/Space).

```typescript
(projectId: string) => void
```

### `onCreateProject` (required)

Callback function called when the "New Project" button is clicked.

```typescript
() => void
```

## Accessibility

- **Keyboard Navigation**: Projects can be focused and selected using Tab + Enter/Space
- **ARIA Roles**: Project cards use `role="button"` for proper semantics
- **ARIA Labels**: "New Project" button has proper labeling
- **Focus Indicators**: Visible focus states for keyboard navigation

## Date Formatting

The component formats dates intelligently:
- "Today" - for current day
- "Yesterday" - for previous day
- "X days ago" - for last 7 days
- "Jan 15, 2025" - for older dates

## Empty State

When no projects are provided, the component displays:
- "No projects yet"
- "Create your first project to get started"
- The "New Project" button remains accessible

## Styling

The component uses Tailwind CSS and shadcn/ui for styling:
- **Default**: Neutral border with hover effect
- **Hover**: Primary border (50% opacity) with shadow
- **Selected**: Primary border with ring effect
- **Scrollable**: Container has `overflow-y-auto` for many projects

## Testing

Comprehensive test coverage using Vitest and React Testing Library:

```bash
npm test -- src/components/projects/ProjectList.test.tsx
```

Test coverage includes:
- ✅ Rendering all projects
- ✅ Displaying project metadata
- ✅ Click interactions
- ✅ Keyboard navigation
- ✅ Selection highlighting
- ✅ Empty state
- ✅ Scrollable container
- ✅ Missing data handling
- ✅ Date formatting
- ✅ Accessibility

## Storybook

View interactive examples in Storybook:

```bash
npm run storybook
```

Navigate to: `Components/Projects/ProjectList`

Available stories:
- **Default**: 3 sample projects
- **WithSelection**: Shows selected state
- **Empty**: No projects
- **SingleProject**: One project
- **ManyProjects**: 20+ projects (scroll test)
- **LongProjectNames**: Text overflow handling
- **RecentProjects**: Date formatting examples
- **FullHeight**: Full container demo

## File Structure

```
src/components/projects/
├── ProjectList.tsx          # Main component
├── ProjectList.test.tsx     # Vitest tests
├── ProjectList.stories.tsx  # Storybook stories
├── types.ts                 # TypeScript types
├── index.ts                 # Public exports
└── README.md                # This file
```

## Dependencies

- **shadcn/ui**: Card, Button components
- **lucide-react**: Plus icon
- **Tailwind CSS**: Styling
- **React 19**: Component framework

## Development Approach

This component was developed using **Test-Driven Development (TDD)**:

1. **RED**: Write failing tests
2. **GREEN**: Implement component to pass tests
3. **REFACTOR**: Optimize and clean up code

All tests passed on first implementation, demonstrating the effectiveness of TDD.

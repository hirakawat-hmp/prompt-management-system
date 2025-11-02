# ThreeColumnLayout Component

A responsive three-column layout component with resizable panels using shadcn/ui's Resizable component.

## Features

- **Resizable Panels**: Users can drag handles to adjust panel widths
- **Configurable Sizes**: Default, minimum, and maximum sizes for each panel
- **Overflow Handling**: Each panel scrolls independently when content overflows
- **Type-Safe**: Full TypeScript support with comprehensive prop types
- **Accessible**: Supports semantic HTML elements (nav, main, aside)
- **Customizable**: Accepts className for styling customization

## Installation

The component uses the shadcn/ui Resizable component, which is already installed in this project.

## Usage

### Basic Example

```tsx
import { ThreeColumnLayout } from '@/components/layout/ThreeColumnLayout';

export default function Page() {
  return (
    <ThreeColumnLayout
      leftPanel={<nav>Navigation</nav>}
      centerPanel={<main>Main Content</main>}
      rightPanel={<aside>Sidebar</aside>}
    />
  );
}
```

### With Custom Sizes

```tsx
<ThreeColumnLayout
  leftPanel={<div>Left</div>}
  centerPanel={<div>Center</div>}
  rightPanel={<div>Right</div>}
  leftPanelDefaultSize={15}
  centerPanelDefaultSize={60}
  rightPanelDefaultSize={25}
  leftPanelMinSize={10}
  leftPanelMaxSize={25}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `leftPanel` | `React.ReactNode` | Required | Content for the left panel |
| `centerPanel` | `React.ReactNode` | Required | Content for the center panel |
| `rightPanel` | `React.ReactNode` | Required | Content for the right panel |
| `className` | `string` | `undefined` | Optional className for the panel group |
| `leftPanelDefaultSize` | `number` | `20` | Default size for left panel (%) |
| `centerPanelDefaultSize` | `number` | `50` | Default size for center panel (%) |
| `rightPanelDefaultSize` | `number` | `30` | Default size for right panel (%) |
| `leftPanelMinSize` | `number` | `15` | Minimum size for left panel (%) |
| `centerPanelMinSize` | `number` | `40` | Minimum size for center panel (%) |
| `rightPanelMinSize` | `number` | `20` | Minimum size for right panel (%) |
| `leftPanelMaxSize` | `number` | `30` | Maximum size for left panel (%) |
| `rightPanelMaxSize` | `number` | `40` | Maximum size for right panel (%) |

## Default Sizes

The component comes with sensible defaults:

- **Left Panel**: 20% (min: 15%, max: 30%)
- **Center Panel**: 50% (min: 40%)
- **Right Panel**: 30% (min: 20%, max: 40%)

## Accessibility

The component supports semantic HTML elements. It's recommended to use:

- `<nav>` for navigation panels
- `<main>` for main content
- `<aside>` for sidebars

Example:

```tsx
<ThreeColumnLayout
  leftPanel={
    <nav aria-label="Main navigation">
      {/* Navigation content */}
    </nav>
  }
  centerPanel={
    <main>
      {/* Main content */}
    </main>
  }
  rightPanel={
    <aside>
      {/* Sidebar content */}
    </aside>
  }
/>
```

## Testing

The component includes comprehensive tests covering:

- Rendering of all three panels
- Resizable functionality
- Custom className support
- Panel content rendering
- Accessibility with semantic HTML

Run tests:

```bash
npm test -- ThreeColumnLayout.test.tsx
```

## Storybook

Interactive examples are available in Storybook:

```bash
npm run storybook
```

Navigate to "Layout → ThreeColumnLayout" to see all variants.

## Technical Details

- Built with React 19 and TypeScript 5
- Uses shadcn/ui Resizable component (react-resizable-panels)
- Styled with Tailwind CSS v4
- Client component (`'use client'`)
- Fully tested with Vitest and Testing Library

## File Structure

```
src/components/layout/
├── ThreeColumnLayout.tsx          # Main component
├── ThreeColumnLayout.test.tsx     # Vitest tests
├── ThreeColumnLayout.stories.tsx  # Storybook stories
└── README.md                      # This file
```

## Future Enhancements

Potential features for future versions:

- Responsive mobile layout with tab switching
- Collapsible panels
- Keyboard shortcuts for resizing
- Persist panel sizes to localStorage
- Vertical layout option
- Drag-and-drop panel reordering

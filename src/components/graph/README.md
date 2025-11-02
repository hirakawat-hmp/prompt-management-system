# PromptGraph Component

A React Flow-based component for visualizing prompt derivation relationships as an interactive graph.

## Features

- **Hierarchical Layout**: Automatic graph layout using dagre algorithm
- **Interactive**: Zoom, pan, and node selection
- **Custom Nodes**: Display prompt ID, content preview, and type icons
- **Dark Theme**: Fully styled for dark mode using project CSS variables
- **Minimap**: Optional minimap for navigation (large graphs)
- **Controls**: Optional zoom controls
- **Accessibility**: Keyboard navigation and proper ARIA labels

## Installation

The component uses the following dependencies (already installed):

```bash
npm install @xyflow/react dagre @types/dagre
```

## Usage

### Basic Example

```tsx
import { PromptGraph } from '@/components/graph';
import type { Prompt } from '@/types/prompt';

const prompts: Prompt[] = [
  {
    id: 'prompt-1',
    type: 'image',
    content: 'A beautiful mountain landscape',
    createdAt: new Date(),
    updatedAt: new Date(),
    assets: [],
  },
  {
    id: 'prompt-2',
    type: 'image',
    content: 'Same landscape with sunset colors',
    parent: {
      id: 'prompt-1',
      content: 'A beautiful mountain landscape',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    assets: [],
  },
];

function MyComponent() {
  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PromptGraph
        prompts={prompts}
        showControls
        showMinimap
      />
    </div>
  );
}
```

### With Selection

```tsx
function MyComponent() {
  const [selectedId, setSelectedId] = useState<string>();

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <PromptGraph
        prompts={prompts}
        selectedPromptId={selectedId}
        onPromptSelect={setSelectedId}
        showControls
      />
    </div>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `prompts` | `Prompt[]` | **required** | Array of prompts to visualize |
| `selectedPromptId` | `string?` | `undefined` | ID of the currently selected prompt |
| `onPromptSelect` | `(promptId: string) => void` | `undefined` | Callback when a prompt is clicked |
| `showMinimap` | `boolean` | `false` | Show minimap for navigation |
| `showControls` | `boolean` | `false` | Show zoom controls |

## Components

### PromptGraph

Main component that renders the graph visualization.

### PromptNode

Custom node component that displays:
- Prompt ID (truncated if needed)
- Content preview (first 50 characters)
- Type icon (Image or Video)
- Selection highlight

### layoutGraph

Utility function for hierarchical graph layout using dagre.

## Styling

The component uses Tailwind CSS and project CSS variables for theming:

- `--color-card`: Node background
- `--color-border`: Node border
- `--color-primary`: Selection highlight
- `--color-foreground`: Text color
- `--color-muted-foreground`: Secondary text color

## Testing

Run tests with:

```bash
npm run test -- src/components/graph/
```

All 21 tests should pass:
- ✅ Rendering (8 tests)
- ✅ Node Content (4 tests)
- ✅ Node Selection (3 tests)
- ✅ Graph Layout (1 test)
- ✅ Edge Cases (3 tests)
- ✅ Accessibility (2 tests)

## Storybook

View interactive examples:

```bash
npm run storybook
```

Stories include:
- **Default**: Linear derivation chain
- **WithBranching**: Multiple branches from root
- **Large**: 20 prompts for performance testing
- **WithSelection**: Selected prompt highlight
- **Minimal**: Two-node graph
- **Empty**: No prompts

## Architecture

```
src/components/graph/
├── PromptGraph.tsx         # Main component
├── PromptGraph.test.tsx    # Test suite (21 tests)
├── PromptGraph.stories.tsx # Storybook stories (6 stories)
├── PromptNode.tsx          # Custom node component
├── utils/
│   └── layoutGraph.ts      # Dagre layout utility
├── index.ts                # Public exports
└── README.md               # This file
```

## Implementation Notes

### TDD Approach

This component was built using Test-Driven Development:

1. **RED**: Wrote 21 comprehensive tests first
2. **GREEN**: Implemented components to pass all tests
3. **REFACTOR**: Optimized with useMemo, accessibility improvements

### React Flow Setup

Important setup steps:

1. **CSS Import**: Must import `@xyflow/react/dist/style.css`
2. **Container Size**: Parent must have explicit width and height
3. **Node Types**: Register custom node types before passing to ReactFlow
4. **Layout**: Apply dagre layout before rendering

### Performance

- Uses `useMemo` to prevent unnecessary recalculations
- Dagre layout runs only when prompts change
- Efficient re-rendering with React Flow's internal optimizations

### Accessibility

- Semantic HTML with proper roles
- Keyboard navigation support
- ARIA labels for icons
- Focus management

## Future Enhancements

Potential improvements:

- [ ] Add edge labels showing derivation type
- [ ] Implement node grouping/clustering
- [ ] Add search/filter functionality
- [ ] Export graph as image
- [ ] Animated layout transitions
- [ ] Collapsible branches
- [ ] Custom edge styling based on relationship

## License

Part of the Prompt Management System project.

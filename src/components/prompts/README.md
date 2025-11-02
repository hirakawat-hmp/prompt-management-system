# PromptDetail Component

A comprehensive component for displaying prompt details, including content, metadata, parent relationships, action buttons, and generated assets.

## Features

- Display prompt content in a read-only, textarea-like format
- Show creation and update timestamps
- Display parent prompt information (if exists)
- Action buttons for:
  - Generate Image
  - Generate Video
  - Create Derivative Prompt
- Grid display of generated assets (images and videos)
- Empty state when no prompt is selected

## Usage

```tsx
import { PromptDetail } from '@/components/prompts/PromptDetail';

function MyComponent() {
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);

  return (
    <PromptDetail
      prompt={selectedPrompt}
      onGenerateImage={() => console.log('Generating image...')}
      onGenerateVideo={() => console.log('Generating video...')}
      onCreateDerivative={() => console.log('Creating derivative...')}
    />
  );
}
```

## Props

### `PromptDetailProps`

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `prompt` | `Prompt \| null` | Yes | The prompt object to display, or null for empty state |
| `onGenerateImage` | `() => void` | Yes | Callback when Generate Image button is clicked |
| `onGenerateVideo` | `() => void` | Yes | Callback when Generate Video button is clicked |
| `onCreateDerivative` | `() => void` | Yes | Callback when Create Derivative button is clicked |

### `Prompt` Type

```typescript
interface Prompt {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  parent?: {
    id: string;
    content: string;
  };
  assets: Asset[];
}
```

### `Asset` Type

```typescript
interface Asset {
  id: string;
  type: 'image' | 'video';
  url: string;
  provider: string;
  createdAt: Date;
}
```

## Examples

### Basic Usage

```tsx
<PromptDetail
  prompt={{
    id: '1',
    content: 'Create a beautiful landscape',
    createdAt: new Date(),
    updatedAt: new Date(),
    assets: [],
  }}
  onGenerateImage={() => {}}
  onGenerateVideo={() => {}}
  onCreateDerivative={() => {}}
/>
```

### With Parent Prompt

```tsx
<PromptDetail
  prompt={{
    id: '1',
    content: 'Create a beautiful landscape with mountains',
    createdAt: new Date(),
    updatedAt: new Date(),
    parent: {
      id: 'parent-1',
      content: 'Create a landscape',
    },
    assets: [],
  }}
  onGenerateImage={() => {}}
  onGenerateVideo={() => {}}
  onCreateDerivative={() => {}}
/>
```

### With Assets

```tsx
<PromptDetail
  prompt={{
    id: '1',
    content: 'Create a beautiful landscape',
    createdAt: new Date(),
    updatedAt: new Date(),
    assets: [
      {
        id: 'asset-1',
        type: 'image',
        url: 'https://example.com/image.jpg',
        provider: 'DALL-E',
        createdAt: new Date(),
      },
    ],
  }}
  onGenerateImage={() => {}}
  onGenerateVideo={() => {}}
  onCreateDerivative={() => {}}
/>
```

### Empty State

```tsx
<PromptDetail
  prompt={null}
  onGenerateImage={() => {}}
  onGenerateVideo={() => {}}
  onCreateDerivative={() => {}}
/>
```

## Styling

The component uses:
- **shadcn/ui** components: `Card`, `Button`, `Badge`, `Separator`
- **Tailwind CSS** for styling
- **lucide-react** icons: `ImageIcon`, `VideoIcon`, `GitBranch`

### Layout

- Assets are displayed in a **2-column grid**
- Images use `aspect-square` and `object-cover`
- Parent prompt is shown in a compact card above actions
- All sections are wrapped in individual cards for clear separation

## Testing

The component is fully tested with Vitest. Run tests with:

```bash
npx vitest run --project=components src/components/prompts/PromptDetail.test.tsx
```

Test coverage includes:
- ✅ Rendering with various prop combinations
- ✅ Parent prompt display
- ✅ Action button interactions
- ✅ Asset grid display (images and videos)
- ✅ Empty state
- ✅ Accessibility (ARIA labels, alt text)
- ✅ Edge cases (empty content, multiple assets)

## Storybook

View all component variants in Storybook:

```bash
npm run storybook
```

Available stories:
- Default
- With Parent
- With Image Assets
- With Mixed Assets (images + videos)
- With Parent and Assets
- With Many Assets
- Empty Content
- Long Content
- No Prompt Selected

## Accessibility

- All action buttons have descriptive text
- Images have proper `alt` attributes
- Keyboard navigation supported
- Semantic HTML elements used throughout
- Empty state provides clear feedback

## Dependencies

- React 19
- Next.js 16
- shadcn/ui components
- lucide-react
- Tailwind CSS v4

# Storybook Documentation

This project uses Storybook v10.0.2 for component development and documentation.

## Quick Start

```bash
# Start Storybook
npm run storybook

# Build Storybook for production
npm run build-storybook
```

Access Storybook at http://localhost:6006

## Creating a New Story

1. Create your component in `src/components/`:

```typescript
// src/components/MyComponent.tsx
export interface MyComponentProps {
  title: string;
  variant?: 'primary' | 'secondary';
}

export function MyComponent({ title, variant = 'primary' }: MyComponentProps) {
  return <div className="p-4">{title}</div>;
}
```

2. Create a story file alongside it:

```typescript
// src/components/MyComponent.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { MyComponent } from './MyComponent';

const meta = {
  title: 'Components/MyComponent',
  component: MyComponent,
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof MyComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    title: 'Hello World',
    variant: 'primary',
  },
};
```

## Key Features

- **Next.js App Router Support**: Full compatibility with Next.js 16 App Router
- **Tailwind CSS**: Project styles automatically loaded
- **TypeScript**: Full type safety with auto-completion
- **Accessibility Testing**: Built-in a11y checks via @storybook/addon-a11y
- **Component Testing**: Vitest integration for testing stories
- **Auto Documentation**: Automatic prop documentation via TypeScript

## Sample Components

Check `src/components/ExampleButton.tsx` and `src/stories/` for example components and stories.

## Configuration Files

- `.storybook/main.ts` - Main Storybook configuration
- `.storybook/preview.ts` - Preview configuration (global styles, parameters)
- `.storybook/vitest.setup.ts` - Vitest integration setup
- `vitest.config.ts` - Component testing configuration

## Resources

- [Storybook Documentation](https://storybook.js.org/docs)
- [Next.js Integration](https://storybook.js.org/docs/get-started/frameworks/nextjs)
- [Writing Stories](https://storybook.js.org/docs/writing-stories)

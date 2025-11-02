# shadcn/ui + Storybook Integration Guide

This project uses **shadcn/ui** for UI components and **Storybook** for component development and documentation.

## Quick Start

### View Components in Storybook
```bash
npm run storybook
```
Access at http://localhost:6006

### Add a New shadcn/ui Component
```bash
npx shadcn@latest add <component-name>
```

Example:
```bash
npx shadcn@latest add dialog
npx shadcn@latest add badge
npx shadcn@latest add toast
```

## Why This Combination?

✅ **Own Your Components** - shadcn/ui components are copied to your codebase
✅ **Full Customization** - Modify any component as needed
✅ **Live Documentation** - Storybook provides interactive component docs
✅ **Consistent Styling** - Both use Tailwind CSS
✅ **Type Safety** - Full TypeScript support

## Installed Components

- **Button** - `src/components/ui/button.tsx`
- **Card** - `src/components/ui/card.tsx`
- **Input** - `src/components/ui/input.tsx`
- **Label** - `src/components/ui/label.tsx`
- **Select** - `src/components/ui/select.tsx`

Each component has a corresponding `.stories.tsx` file in Storybook.

## Usage Example

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Hello World</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## Creating a Story for a New Component

After adding a shadcn/ui component, create a story:

```typescript
// src/components/ui/your-component.stories.tsx
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { YourComponent } from './your-component';

const meta = {
  title: 'shadcn/ui/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered',
    nextjs: { appDirectory: true },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // component props
  },
};
```

## Configuration

### shadcn/ui Config
File: `components.json`

- **Style**: new-york
- **Base Color**: neutral
- **CSS Variables**: enabled
- **Icon Library**: lucide-react

### Path Aliases
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/ui` → `src/components/ui`

## Customization

### Modify a Component
Components are in your codebase at `src/components/ui/`. Edit them directly!

### Change Theme Colors
Edit CSS variables in `src/app/globals.css`:

```css
@layer base {
  :root {
    --primary: ...;
    --secondary: ...;
    /* etc */
  }
}
```

### Add Component Variants
Modify the component's `cva()` variants in the component file.

## Available Components

See all available shadcn/ui components:
```bash
npx shadcn@latest add
```

Popular components:
- Forms: Input, Textarea, Select, Checkbox, Radio, Switch
- Feedback: Alert, Toast, Dialog, Alert Dialog
- Layout: Card, Separator, Tabs, Accordion
- Navigation: Dropdown Menu, Navigation Menu
- Data: Table, Badge, Avatar, Skeleton

## Resources

- [shadcn/ui Docs](https://ui.shadcn.com)
- [Radix UI](https://www.radix-ui.com) (underlying primitives)
- [Storybook Docs](https://storybook.js.org)

# shadcn/ui + Storybook Integration

## Overview
This project successfully integrates shadcn/ui with Storybook for component development and documentation. This combination provides:
- **shadcn/ui**: Copy-paste, customizable UI components based on Radix UI and Tailwind CSS
- **Storybook**: Component development environment with live documentation

## Why This Combination Works

1. **Same Tech Stack**: Both use TypeScript, Tailwind CSS, and React
2. **Ownership**: shadcn/ui components are copied into your codebase, so you own them
3. **Customization**: Full control over component styling and behavior
4. **Documentation**: Storybook provides interactive documentation for shadcn components
5. **Development Workflow**: Develop and test components in isolation

## shadcn/ui Configuration

### Installation Details
- **Style**: new-york
- **Base Color**: neutral
- **CSS Variables**: enabled
- **Icon Library**: lucide-react
- **TypeScript**: enabled
- **React Server Components**: enabled

### File Structure
```
src/
  components/
    ui/               # shadcn/ui components
      button.tsx
      card.tsx
      input.tsx
      label.tsx
      select.tsx
      *.stories.tsx   # Storybook stories
  lib/
    utils.ts          # Utility functions (cn, etc.)
components.json       # shadcn/ui configuration
```

### Path Aliases (defined in components.json)
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/ui` → `src/components/ui`
- `@/hooks` → `src/hooks`

## Component Installation

### Install a Single Component
```bash
npx shadcn@latest add button
```

### Install Multiple Components
```bash
npx shadcn@latest add button card input label select
```

### Install All Components
```bash
npx shadcn@latest add -a
```

## Installed Components

### Button
- **Location**: `src/components/ui/button.tsx`
- **Stories**: `src/components/ui/button.stories.tsx`
- **Variants**: default, destructive, outline, secondary, ghost, link
- **Sizes**: default, sm, lg, icon, icon-sm, icon-lg

### Card
- **Location**: `src/components/ui/card.tsx`
- **Stories**: `src/components/ui/card.stories.tsx`
- **Sub-components**: Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

### Input
- **Location**: `src/components/ui/input.tsx`
- **Stories**: `src/components/ui/input.stories.tsx`
- **Types**: text, email, password, number, tel, url, file

### Label
- **Location**: `src/components/ui/label.tsx`
- **Used**: Typically paired with Input or Select components

### Select
- **Location**: `src/components/ui/select.tsx`
- **Stories**: `src/components/ui/select.stories.tsx`
- **Sub-components**: Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel

## Creating Storybook Stories for shadcn Components

### Basic Story Template
```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { ComponentName } from './component-name';

const meta = {
  title: 'shadcn/ui/ComponentName',
  component: ComponentName,
  parameters: {
    layout: 'centered',
    nextjs: {
      appDirectory: true,
    },
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    // component props
  },
};
```

### Best Practices for Stories

1. **Group by Category**: Use `shadcn/ui/` prefix in title
2. **Show All Variants**: Create stories for each variant, size, and state
3. **Include Combinations**: Show components used together (e.g., Input + Label)
4. **Add Descriptions**: Use argTypes to document props
5. **Interactive Examples**: Include onClick handlers to demonstrate functionality

## Usage Examples

### Using shadcn/ui Button in Next.js Page
```typescript
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <div>
      <Button variant="default">Click me</Button>
      <Button variant="destructive">Delete</Button>
      <Button variant="outline">Cancel</Button>
    </div>
  );
}
```

### Form with shadcn/ui Components
```typescript
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export function LoginForm() {
  return (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Login</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="Enter email" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Enter password" />
          </div>
          <Button type="submit" className="w-full">Login</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

## Utility Functions

### cn() Function
Located in `src/lib/utils.ts`, the `cn()` function is used throughout shadcn/ui components:

```typescript
import { cn } from '@/lib/utils';

// Merge Tailwind classes conditionally
<div className={cn(
  'base-classes',
  condition && 'conditional-classes',
  className
)}>
```

## Styling and Customization

### CSS Variables
All shadcn/ui components use CSS variables defined in `src/app/globals.css`:
- Colors: `--primary`, `--secondary`, `--destructive`, etc.
- Radii: `--radius`
- Backgrounds, foregrounds, borders, etc.

### Customizing Components
Since components are in your codebase, you can:
1. Modify component source directly
2. Adjust Tailwind classes
3. Change CSS variables in `globals.css`
4. Add new variants to component variants

### Dark Mode
shadcn/ui components support dark mode automatically through Tailwind CSS dark mode classes.

## Development Workflow

### 1. Add a Component
```bash
npx shadcn@latest add dialog
```

### 2. Create a Story
Create `src/components/ui/dialog.stories.tsx`:
```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Dialog, DialogTrigger, DialogContent } from './dialog';

// Story definition...
```

### 3. View in Storybook
```bash
npm run storybook
```

### 4. Use in Application
```typescript
import { Dialog } from '@/components/ui/dialog';
```

## Available shadcn/ui Components

To see all available components:
```bash
npx shadcn@latest add
```

Popular components include:
- **Layout**: Card, Separator, Aspect Ratio
- **Forms**: Input, Label, Select, Checkbox, Radio, Textarea, Switch
- **Feedback**: Alert, Toast, Dialog, Alert Dialog
- **Navigation**: Tabs, Accordion, Dropdown Menu, Navigation Menu
- **Data Display**: Table, Badge, Avatar, Skeleton
- **Overlays**: Dialog, Sheet, Popover, Tooltip, Hover Card

## Troubleshooting

### Import Errors
- Ensure path aliases are configured in `tsconfig.json`
- Check that `@/` points to `src/` directory

### Styling Issues
- Verify Tailwind CSS is properly configured
- Check that `globals.css` is imported in Storybook preview
- Ensure CSS variables are defined

### Component Not Found
- Run `npx shadcn@latest add <component>` to install
- Check import path matches configured aliases

## Resources

- **shadcn/ui Documentation**: https://ui.shadcn.com
- **Component Gallery**: https://ui.shadcn.com/docs/components
- **Radix UI (Underlying library)**: https://www.radix-ui.com
- **Storybook Documentation**: https://storybook.js.org

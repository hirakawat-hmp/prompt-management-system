# Storybook Setup and Usage

## Overview
Storybook v10.0.2 has been successfully configured for this Next.js 16 + TypeScript project. It uses the `@storybook/nextjs-vite` framework for optimal integration with Next.js App Router and Vite.

## Installation Details

### Installed Packages
- **storybook**: ^10.0.2
- **@storybook/nextjs-vite**: ^10.0.2 (framework)
- **@storybook/addon-docs**: ^10.0.2 (documentation)
- **@storybook/addon-a11y**: ^10.0.2 (accessibility testing)
- **@storybook/addon-vitest**: ^10.0.2 (component testing)
- **@storybook/addon-onboarding**: ^10.0.2 (onboarding guide)
- **@chromatic-com/storybook**: ^4.1.2 (visual testing)
- **eslint-plugin-storybook**: ^10.0.2 (linting)

### Testing Dependencies
- **vitest**: ^4.0.6
- **playwright**: ^1.56.1
- **@vitest/browser-playwright**: ^4.0.6
- **@vitest/coverage-v8**: ^4.0.6

## Commands

### Start Storybook
```bash
npm run storybook
```
Starts the Storybook development server on http://localhost:6006

### Build Storybook
```bash
npm run build-storybook
```
Creates a static build of Storybook in the `storybook-static` directory.

## Configuration

### Main Configuration (.storybook/main.ts)
- **Framework**: @storybook/nextjs-vite
- **Stories Location**: `src/**/*.stories.@(js|jsx|mjs|ts|tsx)` and `src/**/*.mdx`
- **Static Assets**: Serves from `./public` directory
- **TypeScript**: Uses `react-docgen` for prop documentation
- **Addons**: Chromatic, Docs, Onboarding, A11y, Vitest

### Preview Configuration (.storybook/preview.ts)
- **Global Styles**: Imports `src/app/globals.css` (Tailwind CSS)
- **Next.js App Directory**: Enabled via `nextjs.appDirectory: true`
- **Accessibility**: A11y violations shown in test UI (mode: 'todo')
- **Controls**: Auto-detection for color and date controls

## Creating Stories

### Story File Structure
Stories should be placed alongside components or in the `src/stories` directory:
```
src/
  components/
    Button.tsx
    Button.stories.tsx
  stories/
    Example.stories.tsx
```

### Story Template (TypeScript)
```typescript
import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { YourComponent } from './YourComponent';

const meta = {
  title: 'Components/YourComponent',
  component: YourComponent,
  parameters: {
    layout: 'centered', // 'centered' | 'fullscreen' | 'padded'
    nextjs: {
      appDirectory: true, // Enable Next.js App Router support
    },
  },
  tags: ['autodocs'], // Auto-generate documentation
  argTypes: {
    // Define control types for props
    propName: {
      control: 'text', // 'text' | 'boolean' | 'number' | 'select' | etc.
    },
  },
} satisfies Meta<typeof YourComponent>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    // Component props
  },
};
```

### Next.js Specific Features

#### App Directory Support
All stories automatically support Next.js App Router features:
```typescript
parameters: {
  nextjs: {
    appDirectory: true,
  },
}
```

#### Mocking Next.js Navigation
```typescript
parameters: {
  nextjs: {
    navigation: {
      pathname: '/profile',
      query: { user: '1' },
    },
  },
}
```

#### Image Component
Next.js `Image` component works out of the box. Place images in the `public/` directory.

## Sample Components

### Example Button Component
Location: `src/components/ExampleButton.tsx`
- Demonstrates Tailwind CSS styling
- Includes TypeScript props interface
- Supports variants (primary, secondary, outline)
- Supports sizes (small, medium, large)
- Includes disabled state

### Example Button Stories
Location: `src/components/ExampleButton.stories.tsx`
- Multiple story variants
- Interactive controls
- Auto-generated documentation
- Accessibility testing enabled

## Best Practices

### Component Design
1. Create components in `src/components/` directory
2. Export components with named exports
3. Define TypeScript interfaces for props
4. Use Tailwind CSS for styling
5. Support dark mode where applicable

### Story Organization
1. Place stories next to components (`.stories.tsx`)
2. Use descriptive story names
3. Group related stories using `title` property
4. Include multiple variants showing different states
5. Add `tags: ['autodocs']` for automatic documentation

### Testing
1. Use `@storybook/addon-a11y` for accessibility checks
2. Use `@storybook/addon-vitest` for component tests
3. Run tests with `npx vitest`
4. Check accessibility in Storybook UI

### Documentation
1. Use MDX files for custom documentation pages
2. Add JSDoc comments to components for better docs
3. Use `argTypes` to document prop controls
4. Include usage examples in stories

## Integration with Project

### Tailwind CSS
Global styles from `src/app/globals.css` are automatically loaded in Storybook, ensuring consistent styling with the main application.

### TypeScript
Storybook respects the project's `tsconfig.json` settings, including path aliases (`@/*` -> `src/*`).

### ESLint
The `eslint-plugin-storybook` is installed and will lint story files according to Storybook best practices.

## Accessibility Testing

The `@storybook/addon-a11y` addon is configured with the following settings:
- **Mode**: 'todo' (violations shown in UI, won't fail builds)
- **Location**: Accessibility panel in Storybook UI
- **Checks**: WCAG 2.0 Level A & AA compliance

To change the mode:
- 'todo': Show violations in UI only
- 'error': Fail CI on violations
- 'off': Skip checks entirely

## Component Testing with Vitest

### Setup
The `@storybook/addon-vitest` integrates Vitest with Storybook for component testing.

### Configuration
- **Vitest Config**: `vitest.config.ts`
- **Setup File**: `.storybook/vitest.setup.ts`
- **Browser Testing**: Playwright (Chromium)
- **Coverage**: V8 provider

### Running Tests
```bash
npx vitest
```

### Writing Tests
Stories can be imported and tested in Vitest:
```typescript
import { composeStories } from '@storybook/react';
import * as stories from './Button.stories';

const { Primary } = composeStories(stories);

test('renders primary button', () => {
  const { getByText } = render(<Primary />);
  expect(getByText('Click me')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

1. **Styles not loading**: Ensure `globals.css` is imported in `.storybook/preview.ts`
2. **Image component errors**: Check that images are in `public/` directory
3. **TypeScript errors**: Verify `tsconfig.json` paths are correct
4. **Build failures**: Run `npm run lint` and fix any ESLint errors

### Debugging
- Check browser console for errors
- Review Storybook logs in terminal
- Use `console.log()` in stories for debugging
- Check Network tab for asset loading issues

## Resources

- **Storybook Documentation**: https://storybook.js.org/docs
- **Next.js Integration Guide**: https://storybook.js.org/docs/get-started/frameworks/nextjs
- **Addon Documentation**: https://storybook.js.org/docs/addons
- **Component Testing**: https://storybook.js.org/docs/writing-tests

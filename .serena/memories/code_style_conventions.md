# Code Style and Conventions

## TypeScript Configuration

### Compiler Options
- **Target**: ES2017
- **Strict Mode**: Enabled (type checking is strict)
- **Module System**: ESNext with bundler resolution
- **JSX**: react-jsx (React 19)
- **Path Alias**: `@/*` maps to `./src/*`

### Import Style
```typescript
// Prefer absolute imports using path alias
import { Component } from '@/components/Component';

// External packages
import { Agent } from '@mastra/core/agent';
```

## Naming Conventions

### Variables and Functions
- **camelCase** for variables and functions
```typescript
const weatherAgent = new Agent({ ... });
const weatherTool = createTool({ ... });
```

### Types and Interfaces
- **PascalCase** for types, interfaces, and classes
```typescript
type WeatherData = { ... };
interface AgentConfig { ... }
class MyComponent extends React.Component { ... }
```

### Files and Folders
- **kebab-case** for file names
  - `weather-agent.ts`
  - `weather-workflow.ts`
  - `weather-tool.ts`

## Code Style

### Indentation
- **2 spaces** (no tabs)

### Quotes
- **Single quotes** for most strings
- **Backticks** for template literals

### Semicolons
- **Required** at end of statements

### Exports
- Prefer **named exports** over default exports
```typescript
export const weatherAgent = new Agent({ ... });
```

### Type Annotations
- Use type inference where possible
- Add explicit types for function parameters and return types when clarity is needed
```typescript
// Good - types inferred
const weatherAgent = new Agent({...});

// Good - explicit types for clarity
function processWeather(data: WeatherData): FormattedWeather {
  // ...
}
```

## React/Next.js Conventions

### Components
- Use **function components** (not class components)
- Use **named exports**
```typescript
export function MyComponent() {
  return <div>...</div>;
}
```

### Styling
- Use **Tailwind CSS** utility classes
- Follow mobile-first responsive design
```typescript
<div className="flex min-h-screen items-center justify-center">
```

## ESLint Configuration
- Extends Next.js core-web-vitals and TypeScript configurations
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts`

## Project Structure Patterns

### Mastra Organization
```
src/mastra/
  ├── agents/      # AI agent definitions
  ├── workflows/   # Workflow orchestrations
  ├── tools/       # Tool implementations
  └── index.ts     # Main Mastra instance setup
```

### Next.js App Router
```
src/app/
  ├── page.tsx     # Route pages
  ├── layout.tsx   # Layouts
  └── globals.css  # Global styles
```

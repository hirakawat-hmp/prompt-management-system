# Project Overview

## Project Purpose
This is a **Prompt Management System** built with Next.js and the Mastra AI framework. The project provides a comprehensive UI for managing prompts with the following capabilities:

### Core Features
1. **Project Management**: Browse and select projects
2. **Prompt Visualization**: View prompt details and relationships
3. **Graph Visualization**: Interactive hierarchical graph of prompt dependencies
4. **Resizable Layout**: Three-column interface with adjustable panels

### Current Implementation Status

#### ✅ Fully Implemented
- **Three-column resizable layout** using react-resizable-panels
- **Project list component** with selection state management
- **Prompt detail view** showing name, description, tags, and relationships
- **Interactive graph visualization** using ReactFlow with ELKjs automatic layout
- **Main application page** integrating all components with mock data
- **Component library** with 10+ shadcn/ui components
- **Storybook documentation** for all components
- **Comprehensive test coverage** with Vitest

#### 🚧 Planned Features
- Backend API routes for CRUD operations
- Database persistence with LibSQL
- AI agent integration for prompt suggestions
- User authentication and authorization
- Real-time collaboration features
- Export/import functionality

## Tech Stack

### Core Framework
- **Next.js 16.0.1** - React framework with App Router
- **React 19.2.0** - UI library (with React Compiler)
- **TypeScript 5** - Type-safe JavaScript

### UI/UX Stack
- **Tailwind CSS 4** - Utility-first CSS framework
- **shadcn/ui** - Customizable component library
- **Radix UI** - Accessible UI primitives
- **Lucide React** - Icon library
- **ReactFlow (@xyflow/react)** - Graph visualization
- **ELKjs** - Automatic graph layout algorithm
- **react-resizable-panels** - Resizable panel layouts

### AI/LLM Stack
- **Mastra Core 0.23.3** - AI Agent Framework
- **Mastra LibSQL 0.16.1** - Database/storage layer
- **Mastra Memory 0.15.10** - Memory management for agents
- **Mastra Loggers 0.10.18** - Logging utilities
- **Google Gemini 2.5 Pro** - LLM model

### Development Tools
- **Storybook 10** - Component development and documentation
- **Vitest 4** - Fast unit testing framework
- **Playwright** - E2E testing (via @vitest/browser-playwright)
- **ESLint 9** - Code linting
- **Babel React Compiler** - React optimizations

### Supporting Libraries
- **Zod 4.1.12** - Schema validation
- **class-variance-authority** - Component variant management
- **clsx** + **tailwind-merge** - Conditional class names
- **@testing-library/react** - Component testing utilities
- **jest-axe** - Accessibility testing

## Environment Requirements
- Node.js runtime (v20+)
- Google Generative AI API key (required for LLM functionality)
- Linux environment (WSL2 supported)

## Key Architecture Decisions

### Component-First Development
All UI components follow a consistent pattern:
1. **Component file** (`Component.tsx`)
2. **Test file** (`Component.test.tsx`) - Vitest unit tests
3. **Story file** (`Component.stories.tsx`) - Storybook documentation
4. **Documentation** (`README.md`) - Usage guide
5. **Type exports** (`index.ts`) - Clean public API

### Type Safety
- Strict TypeScript configuration
- Centralized type definitions in `src/types/`
- Zod schemas for runtime validation
- Path aliases for clean imports

### Testing Strategy
- **Component tests** with Vitest + @testing-library/react
- **Accessibility tests** with jest-axe
- **Storybook stories** serve as living documentation
- **E2E tests** with Playwright (planned)

### Styling Approach
- **Utility-first** with Tailwind CSS v4
- **CSS variables** for theming (shadcn/ui convention)
- **Responsive design** (mobile-first)
- **Consistent spacing** using Tailwind's spacing scale

### Graph Visualization
- **ReactFlow** for interactive graph rendering
- **ELKjs** for automatic hierarchical layout
- **Custom nodes** for prompt representation
- **Custom edges** for relationship display

## Project Structure

```
src/
├── app/              # Next.js App Router (main application)
├── components/       # UI components
│   ├── ui/          # shadcn/ui base components
│   ├── layout/      # Layout components (ThreeColumnLayout)
│   ├── prompts/     # Prompt-related components
│   ├── projects/    # Project-related components
│   └── graph/       # Graph visualization
├── lib/             # Utility functions
├── mastra/          # AI agent framework
│   ├── agents/      # Agent definitions
│   ├── workflows/   # Workflow orchestrations
│   └── tools/       # Tool implementations
└── types/           # TypeScript type definitions
```

## Development Workflow

### TDD Approach (from CLAUDE.md)
The project follows Test-Driven Development:
1. **RED**: Write failing tests first
2. **GREEN**: Implement to pass tests
3. **REFACTOR**: Improve code quality

### Component Development
1. Design component API and types
2. Write Vitest tests
3. Implement component
4. Create Storybook stories
5. Document in README
6. Integrate into application

### Using Custom Agents (from CLAUDE.md)
The project uses Claude Code custom agents:
- **serena-explore**: Codebase exploration
- **research**: External documentation research
- **tdd-planner**: Test-first planning
- **ui-implementor**: Frontend TDD implementation
- **backend-implementor**: Backend TDD implementation

## Sample Data Structure

### Prompt Type
```typescript
interface Prompt {
  id: string;
  name: string;
  description?: string;
  tags?: string[];
  parentId?: string;
  children?: Prompt[];
}
```

### Project Type
```typescript
interface Project {
  id: string;
  name: string;
  type: 'local' | 'remote';
  path?: string;
}
```

## Current Test Coverage

### Passing Tests
- ✅ `src/app/page.test.tsx` - 15 tests
- ✅ `src/components/projects/ProjectList.test.tsx` - 12 tests
- ✅ `src/components/prompts/PromptDetail.test.tsx` - All tests
- ✅ `src/components/graph/PromptGraph.test.tsx` - Core functionality

### Known Test Issues
- ⚠️ `ThreeColumnLayout.test.tsx` - 3 tests failing (panel rendering, className)
- ⚠️ `PromptGraph.test.tsx` - ReactFlow warnings (test environment setup)

## Next Steps

### Immediate Priorities
1. Fix failing ThreeColumnLayout tests
2. Resolve ReactFlow test warnings
3. Add API routes for prompt CRUD
4. Integrate LibSQL for data persistence

### Medium-term Goals
1. Implement Mastra agent integration
2. Add user authentication
3. Build prompt editor UI
4. Create workflow builder

### Long-term Vision
1. Real-time collaboration
2. AI-powered prompt suggestions
3. Version control for prompts
4. Team management features
5. Integration with popular LLM platforms
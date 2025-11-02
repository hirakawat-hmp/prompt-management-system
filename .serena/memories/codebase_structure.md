# Codebase Structure

## Directory Layout

```
prompt-management-system/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx               # Home page (main application)
│   │   ├── page.test.tsx          # Home page tests
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Global styles (Tailwind + shadcn)
│   │   └── favicon.ico            # Site icon
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   │   ├── button.tsx         # Button component
│   │   │   ├── button.stories.tsx # Button Storybook stories
│   │   │   ├── card.tsx
│   │   │   ├── card.stories.tsx
│   │   │   ├── input.tsx
│   │   │   ├── input.stories.tsx
│   │   │   ├── label.tsx
│   │   │   ├── select.tsx
│   │   │   ├── select.stories.tsx
│   │   │   ├── badge.tsx          # Badge for labels/tags
│   │   │   ├── separator.tsx      # Visual separator
│   │   │   ├── collapsible.tsx    # Collapsible content
│   │   │   └── resizable.tsx      # Resizable panels (react-resizable-panels wrapper)
│   │   ├── layout/                # Layout components
│   │   │   ├── ThreeColumnLayout.tsx        # 3-column resizable layout
│   │   │   ├── ThreeColumnLayout.test.tsx   # Layout tests
│   │   │   ├── ThreeColumnLayout.stories.tsx # Layout stories
│   │   │   ├── example-usage.tsx            # Usage examples
│   │   │   ├── index.ts                     # Public exports
│   │   │   ├── README.md                    # Component documentation
│   │   │   └── IMPLEMENTATION_SUMMARY.md    # Implementation details
│   │   ├── prompts/               # Prompt-related components
│   │   │   ├── PromptDetail.tsx             # Prompt detail view
│   │   │   ├── PromptDetail.test.tsx        # Detail view tests
│   │   │   ├── PromptDetail.stories.tsx     # Detail view stories
│   │   │   ├── index.ts                     # Public exports
│   │   │   └── README.md                    # Component documentation
│   │   ├── projects/              # Project-related components
│   │   │   ├── ProjectList.tsx              # Project list view
│   │   │   ├── ProjectList.test.tsx         # List view tests
│   │   │   ├── ProjectList.stories.tsx      # List view stories
│   │   │   ├── types.ts                     # Component-specific types
│   │   │   ├── index.ts                     # Public exports
│   │   │   └── README.md                    # Component documentation
│   │   ├── graph/                 # Graph visualization components
│   │   │   ├── PromptGraph.tsx              # Main graph component (ReactFlow + ELKjs)
│   │   │   ├── PromptGraph.test.tsx         # Graph tests
│   │   │   ├── PromptGraph.stories.tsx      # Graph stories
│   │   │   ├── PromptNode.tsx               # Custom node component
│   │   │   ├── PromptEdge.tsx               # Custom edge component
│   │   │   ├── utils/
│   │   │   │   └── elkLayoutGraph.ts        # ELKjs layout algorithm
│   │   │   ├── index.ts                     # Public exports
│   │   │   └── README.md                    # Component documentation
│   │   ├── ExampleButton.tsx      # Example component
│   │   └── ExampleButton.stories.tsx
│   ├── lib/
│   │   └── utils.ts               # Utility functions (cn, etc.)
│   ├── mastra/                    # Mastra AI framework code
│   │   ├── agents/                # AI agent definitions
│   │   │   └── weather-agent.ts   # Example weather agent
│   │   ├── workflows/             # Workflow orchestrations
│   │   │   └── weather-workflow.ts
│   │   ├── tools/                 # Tool implementations
│   │   │   └── weather-tool.ts    # Weather API tool
│   │   └── index.ts               # Main Mastra instance setup
│   ├── types/                     # TypeScript type definitions
│   │   ├── index.ts               # Type exports
│   │   ├── prompt.ts              # Prompt-related types
│   │   ├── project.ts             # Project-related types
│   │   ├── graph.ts               # Graph visualization types
│   │   └── asset.ts               # Asset types (AVIF image declarations)
│   └── stories/                   # Example Storybook stories
│       ├── Button.tsx
│       ├── Button.stories.ts
│       ├── Header.tsx
│       ├── Header.stories.ts
│       ├── Page.tsx
│       ├── Page.stories.ts
│       ├── Configure.mdx
│       ├── assets/                # Story assets
│       ├── button.css
│       ├── header.css
│       └── page.css
├── docs/                          # Documentation
│   ├── README.md                  # Documentation index
│   ├── development/               # Development guides
│   │   ├── storybook.md          # Storybook guide
│   │   └── shadcn-storybook.md   # shadcn/ui + Storybook integration
│   └── kie/                       # Kie service documentation
├── .storybook/                    # Storybook configuration
│   ├── main.ts                    # Main configuration
│   ├── preview.ts                 # Preview configuration
│   └── vitest.setup.ts            # Vitest setup for testing
├── .claude/                       # Claude Code configuration
│   ├── agents/                    # Custom subagent definitions
│   └── settings.local.json        # Local settings
├── public/                        # Static assets
├── .next/                         # Next.js build output (generated)
├── node_modules/                  # Dependencies (generated)
├── .serena/                       # Serena MCP server data
├── components.json                # shadcn/ui configuration
├── package.json                   # Project dependencies and scripts
├── package-lock.json              # Dependency lock file
├── tsconfig.json                  # TypeScript configuration
├── tsconfig.tsbuildinfo           # TypeScript build cache
├── eslint.config.mjs              # ESLint configuration
├── next.config.ts                 # Next.js configuration
├── postcss.config.mjs             # PostCSS configuration
├── vitest.config.ts               # Vitest testing configuration
├── vitest.setup.ts                # Vitest setup file
├── vitest.shims.d.ts              # Vitest type declarations
├── next-env.d.ts                  # Next.js TypeScript definitions
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
├── CLAUDE.md                      # Claude Code development guidelines
└── README.md                      # Project documentation
```

## Key Components

### Application Layer (`src/app/`)

#### Main Application (page.tsx)
The main application page demonstrates the prompt management system:
- Three-column resizable layout
- Project list (left panel)
- Prompt detail view (center panel)
- Graph visualization (right panel)
- Fully integrated example with mock data

### UI Components (`src/components/`)

#### shadcn/ui Components (`src/components/ui/`)
shadcn/ui components are copied into the codebase, allowing full customization:

**Core Components:**
- **button.tsx**: Versatile button with multiple variants and sizes
- **card.tsx**: Container component with header, content, footer sections
- **input.tsx**: Form input with various types
- **label.tsx**: Accessible form label
- **select.tsx**: Dropdown select component

**Layout & Display:**
- **badge.tsx**: Label/tag display component
- **separator.tsx**: Visual divider
- **collapsible.tsx**: Expandable/collapsible content
- **resizable.tsx**: Resizable panel wrapper (react-resizable-panels)

Each component has a corresponding `.stories.tsx` file for Storybook documentation.

#### Layout Components (`src/components/layout/`)

**ThreeColumnLayout:**
- Three-column resizable layout using react-resizable-panels
- Left, center, right panels with resize handles
- Customizable sizing and constraints
- Fully tested and documented
- Used in main application page

**Files:**
- `ThreeColumnLayout.tsx` - Main component
- `ThreeColumnLayout.test.tsx` - Vitest tests (8 tests)
- `ThreeColumnLayout.stories.tsx` - Storybook stories
- `example-usage.tsx` - Usage examples
- `README.md` - Component documentation
- `IMPLEMENTATION_SUMMARY.md` - Implementation details

#### Prompt Components (`src/components/prompts/`)

**PromptDetail:**
- Displays detailed information about a prompt
- Shows name, description, tags (badges)
- Parent/child relationship display
- Responsive design with Tailwind CSS
- Fully tested with Vitest

**Files:**
- `PromptDetail.tsx` - Main component
- `PromptDetail.test.tsx` - Vitest tests
- `PromptDetail.stories.tsx` - Storybook stories
- `README.md` - Component documentation

#### Project Components (`src/components/projects/`)

**ProjectList:**
- Displays list of projects
- Selection state management
- Project type badges (local/remote)
- Click to select functionality
- Fully tested with Vitest (12 tests)

**Files:**
- `ProjectList.tsx` - Main component
- `ProjectList.test.tsx` - Vitest tests
- `ProjectList.stories.tsx` - Storybook stories
- `types.ts` - Component-specific types
- `README.md` - Component documentation

#### Graph Components (`src/components/graph/`)

**PromptGraph:**
- Interactive graph visualization using ReactFlow
- Automatic hierarchical layout with ELKjs
- Custom node and edge components
- Minimap and controls
- Zoom, pan, fit view functionality
- Fully tested with Vitest

**Components:**
- `PromptGraph.tsx` - Main graph component
- `PromptNode.tsx` - Custom node rendering
- `PromptEdge.tsx` - Custom edge rendering
- `utils/elkLayoutGraph.ts` - ELKjs layout algorithm

**Files:**
- `PromptGraph.test.tsx` - Vitest tests
- `PromptGraph.stories.tsx` - Storybook stories
- `README.md` - Component documentation

### Type Definitions (`src/types/`)

**Centralized TypeScript types:**
- `prompt.ts` - Prompt data structures
- `project.ts` - Project data structures
- `graph.ts` - Graph visualization types (nodes, edges)
- `asset.ts` - Asset type declarations (AVIF images)
- `index.ts` - Type exports

### Mastra Framework (`src/mastra/`)

#### Agents (`src/mastra/agents/`)
Contains AI agent definitions. Agents are autonomous entities that can:
- Process natural language instructions
- Use tools to accomplish tasks
- Maintain conversation memory
- Execute workflows

**Example: weather-agent.ts**
- Provides weather information and activity suggestions
- Uses Google Gemini 2.5 Pro model
- Integrates weatherTool for data fetching
- Stores conversation history in LibSQL database

#### Workflows (`src/mastra/workflows/`)
Orchestrate complex multi-step AI operations. Workflows can chain multiple agents and tools together.

#### Tools (`src/mastra/tools/`)
Reusable functions that agents can call to interact with external services or perform specific operations (e.g., weather API calls, database queries).

#### Main Setup (`src/mastra/index.ts`)
Central configuration file that:
- Initializes Mastra instance
- Registers agents and workflows
- Configures storage (LibSQL)
- Sets up logging (Pino)
- Enables observability/tracing

### Documentation (`docs/`)

#### Structure
- **README.md**: Documentation index and quick links
- **development/**: Development-related guides
  - `storybook.md`: Storybook setup and usage
  - `shadcn-storybook.md`: shadcn/ui + Storybook integration guide
- **kie/**: Kie service documentation (future use)

### Storybook (`.storybook/`)

#### Configuration Files
- **main.ts**: Framework setup, addons, story locations
- **preview.ts**: Global parameters, decorators, Next.js App Router support
- **vitest.setup.ts**: Vitest integration for component testing

#### Features
- Component development in isolation
- Interactive documentation
- Accessibility testing (a11y addon)
- Component testing with Vitest
- Auto-generated prop documentation

## Important Files

### Configuration Files

- **components.json**: shadcn/ui configuration (style, colors, paths)
- **tsconfig.json**: TypeScript compiler settings, strict mode, path aliases
- **eslint.config.mjs**: Linting rules based on Next.js standards
- **next.config.ts**: Next.js framework configuration
- **vitest.config.ts**: Component testing configuration
- **vitest.setup.ts**: Test environment setup (@testing-library/jest-dom)
- **vitest.shims.d.ts**: Vitest type declarations
- **package.json**: Dependencies, scripts, project metadata
- **CLAUDE.md**: Claude Code development guidelines and TDD practices

### Environment Files

- **.env.example**: Template for required environment variables
- **.env** (not in repo): Actual environment variables including API keys

## Ignored Directories

- `.next/` - Build output
- `node_modules/` - Dependencies
- `.serena/` - MCP server workspace
- `storybook-static/` - Built Storybook
- `build/`, `out/` - Alternative build outputs

## Path Aliases

Configured in `tsconfig.json` and `components.json`:
- `@/` → `src/`
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/ui` → `src/components/ui`
- `@/hooks` → `src/hooks`
- `@/types` → `src/types`

## Development Workflow

### UI Development
1. Add shadcn/ui component: `npx shadcn@latest add <component>`
2. Create Storybook story: `src/components/ui/<component>.stories.tsx`
3. Develop in Storybook: `npm run storybook`
4. Use in app: Import from `@/components/ui/<component>`

### Feature Component Development
1. Create component in `src/components/<feature>/`
2. Write Vitest tests: `<Component>.test.tsx`
3. Create Storybook stories: `<Component>.stories.tsx`
4. Document in `README.md`
5. Export from `index.ts`

### AI Agent Development
1. Define agent in `src/mastra/agents/`
2. Create tools in `src/mastra/tools/`
3. Register in `src/mastra/index.ts`
4. Integrate via API routes or server actions

## Testing Strategy

### Test Files
- **Unit/Component Tests**: `*.test.tsx` files alongside components
- **Test Coverage**: Vitest with @testing-library/react
- **E2E Tests**: Playwright (configured via @vitest/browser-playwright)

### Running Tests
```bash
npm run test              # Run all tests
npm run test:watch        # Watch mode
npm run test:coverage     # Coverage report
```

## Current Implementation Status

### ✅ Implemented Features
1. **Three-column resizable layout** (ThreeColumnLayout)
2. **Project list** with selection state (ProjectList)
3. **Prompt detail view** (PromptDetail)
4. **Graph visualization** with ReactFlow + ELKjs (PromptGraph)
5. **Main application page** integrating all components
6. **shadcn/ui component library** (10+ components)
7. **Storybook setup** with stories for all components
8. **Vitest testing** with good coverage

### ⚠️ Known Issues
- ThreeColumnLayout: 3 tests failing (panel/handle rendering, className prop)
- PromptGraph: ReactFlow warnings (size/style setup) in test environment

### 🚧 Future Enhancements
- API routes for CRUD operations
- Database integration with LibSQL
- Mastra agent integration
- Authentication and user management
- Real-time updates
- Advanced graph features (filtering, search, zoom controls)
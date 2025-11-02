# Codebase Structure

## Directory Layout

```
prompt-management-system/
├── src/
│   ├── app/                       # Next.js App Router
│   │   ├── page.tsx               # Home page
│   │   ├── layout.tsx             # Root layout
│   │   ├── globals.css            # Global styles (Tailwind + shadcn)
│   │   └── favicon.ico            # Site icon
│   ├── components/
│   │   └── ui/                    # shadcn/ui components
│   │       ├── button.tsx         # Button component
│   │       ├── button.stories.tsx # Button Storybook stories
│   │       ├── card.tsx
│   │       ├── card.stories.tsx
│   │       ├── input.tsx
│   │       ├── input.stories.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       └── select.stories.tsx
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
│   └── stories/                   # Example Storybook stories
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
├── public/                        # Static assets
├── .next/                         # Next.js build output (generated)
├── node_modules/                  # Dependencies (generated)
├── .serena/                       # Serena MCP server data
├── .claude/                       # Claude Code configuration
├── components.json                # shadcn/ui configuration
├── package.json                   # Project dependencies and scripts
├── package-lock.json              # Dependency lock file
├── tsconfig.json                  # TypeScript configuration
├── eslint.config.mjs              # ESLint configuration
├── next.config.ts                 # Next.js configuration
├── postcss.config.mjs             # PostCSS configuration
├── vitest.config.ts               # Vitest testing configuration
├── next-env.d.ts                  # Next.js TypeScript definitions
├── .env.example                   # Environment variables template
├── .gitignore                     # Git ignore rules
└── README.md                      # Project documentation
```

## Key Components

### Documentation (`docs/`)

#### Structure
- **README.md**: Documentation index and quick links
- **development/**: Development-related guides
  - `storybook.md`: Storybook setup and usage
  - `shadcn-storybook.md`: shadcn/ui + Storybook integration guide
- **kie/**: Kie service documentation (future use)

### UI Components (`src/components/ui/`)

#### shadcn/ui Components
shadcn/ui components are copied into the codebase, allowing full customization:

- **button.tsx**: Versatile button with multiple variants and sizes
- **card.tsx**: Container component with header, content, footer sections
- **input.tsx**: Form input with various types
- **label.tsx**: Accessible form label
- **select.tsx**: Dropdown select component

Each component has a corresponding `.stories.tsx` file for Storybook documentation.

#### Storybook Stories
Stories demonstrate component usage and variations:
- All variants and sizes
- Different states (default, hover, disabled, etc.)
- Interactive controls
- Usage examples

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

### Next.js App (`src/app/`)

#### App Router Structure
Uses Next.js 13+ App Router paradigm:
- `layout.tsx` - Root layout wrapper for all pages
- `page.tsx` - Route-specific page components
- `globals.css` - Application-wide styles (Tailwind CSS + shadcn/ui CSS variables)

The app currently serves as a frontend shell, ready for integration with Mastra agents via API routes or server actions.

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
- **package.json**: Dependencies, scripts, project metadata

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

## Development Workflow

### UI Development
1. Add shadcn/ui component: `npx shadcn@latest add <component>`
2. Create Storybook story: `src/components/ui/<component>.stories.tsx`
3. Develop in Storybook: `npm run storybook`
4. Use in app: Import from `@/components/ui/<component>`

### AI Agent Development
1. Define agent in `src/mastra/agents/`
2. Create tools in `src/mastra/tools/`
3. Register in `src/mastra/index.ts`
4. Integrate via API routes or server actions

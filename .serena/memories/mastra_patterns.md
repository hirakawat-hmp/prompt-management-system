# Mastra Framework Patterns and Best Practices

## Agent Pattern

### Creating an Agent
```typescript
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';

export const myAgent = new Agent({
  name: 'Agent Name',
  instructions: `
    Clear instructions for the agent's behavior and capabilities.
    Specify input expectations and output format.
  `,
  model: 'google/gemini-2.5-pro', // or other supported models
  tools: { toolName1, toolName2 },   // Tools the agent can use
  memory: new Memory({
    storage: new LibSQLStore({
      url: 'file:../mastra.db',
    }),
  }),
});
```

### Agent Instructions Best Practices
- Be specific about the agent's role and capabilities
- Clearly define input expectations
- Specify output format requirements
- Include edge case handling guidelines
- List available tools and when to use them

## Tool Pattern

### Creating a Tool
Tools are functions that agents can call to perform specific operations:
```typescript
export const myTool = {
  // Tool definition following Mastra conventions
  // Typically includes:
  // - name: string
  // - description: string
  // - parameters: schema
  // - execute: function
};
```

### Tool Best Practices
- Keep tools focused on a single responsibility
- Provide clear descriptions for the agent to understand when to use
- Use Zod schemas for parameter validation
- Handle errors gracefully
- Return structured data that agents can easily interpret

## Workflow Pattern

### Creating a Workflow
Workflows orchestrate multiple steps and can coordinate agents and tools:
```typescript
export const myWorkflow = {
  // Workflow definition
  // Coordinates multiple operations
  // Can chain agent calls and tool executions
};
```

## Mastra Instance Setup

### Central Configuration
The `src/mastra/index.ts` file serves as the central configuration:
```typescript
export const mastra = new Mastra({
  workflows: { workflow1, workflow2 },
  agents: { agent1, agent2 },
  storage: new LibSQLStore({
    url: ":memory:", // or "file:../mastra.db" for persistence
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    enabled: false, // Deprecated
  },
  observability: {
    default: { enabled: true }, // AI tracing
  },
});
```

## Memory and Storage

### Storage Options
- **In-Memory**: `url: ":memory:"` - Fast, but data lost on restart
- **File-Based**: `url: "file:../mastra.db"` - Persistent storage
  - Path is relative to `.mastra/output` directory
  - Use for conversation history, agent memory, etc.

### When to Use Memory
- **Agent Memory**: For maintaining conversation context
- **Storage**: For persisting observability data, scores, logs
- Separate storage instances can be used for agents vs. main Mastra instance

## Model Configuration

### Supported Models
- Google Gemini models (requires GOOGLE_GENERATIVE_AI_API_KEY)
- Format: `'google/gemini-2.5-pro'`

### Model Selection Criteria
- **Gemini 2.5 Pro**: For complex reasoning, tool use, long context

## Observability and Logging

### Logging
- Uses Pino logger for structured logging
- Set appropriate log level: 'info', 'debug', 'error'
- Logs are crucial for debugging agent behavior

### Observability
- Default exporter enabled for AI tracing
- Helps track agent decisions, tool calls, and performance
- Useful for debugging and optimization

## Integration with Next.js

### API Route Pattern (Recommended)
Create API routes to expose Mastra functionality:
```typescript
// src/app/api/agent/route.ts
import { mastra } from '@/mastra';

export async function POST(request: Request) {
  const { message } = await request.json();
  const result = await mastra.agents.myAgent.generate(message);
  return Response.json(result);
}
```

### Server Action Pattern
Use Next.js server actions for server-side agent calls:
```typescript
'use server'
import { mastra } from '@/mastra';

export async function callAgent(message: string) {
  return await mastra.agents.myAgent.generate(message);
}
```

## Common Patterns

### Error Handling
Always wrap agent/tool calls in try-catch:
```typescript
try {
  const result = await agent.generate(input);
  return result;
} catch (error) {
  logger.error('Agent error:', error);
  throw error;
}
```

### Type Safety
Leverage TypeScript for agent inputs/outputs:
```typescript
interface AgentInput {
  message: string;
  context?: Record<string, unknown>;
}

interface AgentOutput {
  response: string;
  metadata?: Record<string, unknown>;
}
```

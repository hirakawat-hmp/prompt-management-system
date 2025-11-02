# Database Integration Strategy - FINAL

## Overview

This project uses a **unified database approach** where Mastra AI framework and Prisma ORM share the same SQLite database file.

## Database Architecture

### Single Unified Database: `prisma/mastra.db`

```
prisma/mastra.db (SQLite/LibSQL) - SINGLE SOURCE OF TRUTH
├── Mastra Tables (Auto-managed by Mastra)
│   ├── mastra_threads       - AI conversation threads
│   ├── mastra_messages      - AI messages
│   ├── mastra_resources     - Resource management
│   ├── mastra_ai_spans      - AI tracing spans
│   ├── mastra_evals         - Evaluation data
│   ├── mastra_scorers       - Scoring data
│   ├── mastra_traces        - Trace logs
│   └── mastra_workflow_snapshot - Workflow snapshots
│
└── Application Tables (Managed by Prisma)
    ├── projects             - User projects (id = threadId)
    ├── prompts              - Generated prompts (mastraMessageId reference)
    ├── assets               - Associated media assets
    └── _prisma_migrations   - Prisma migration history
```

**✅ VERIFIED: Both Mastra and Prisma tables coexist successfully in the same database file.**

## Path Resolution

### Mastra Configuration (`src/mastra/index.ts`)

```typescript
export const mastra = new Mastra({
  storage: new LibSQLStore({
    url: "file:../../prisma/mastra.db",  // Relative to .mastra/output
  }),
});
```

**How it works:**
1. Next.js compiles Mastra code into `.mastra/output/`
2. From `.mastra/output/`, the path `../../prisma/mastra.db` resolves to project root's `prisma/mastra.db`
3. ✅ Same database file used by both systems

### Prisma Configuration

**`prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}
```

**`.env`:**
```env
DATABASE_URL="file:./mastra.db"  # Relative to prisma/ directory
```

**How it works:**
1. Prisma commands run from project root
2. Schema file is in `prisma/` directory
3. Path `file:./mastra.db` resolves to `prisma/mastra.db`
4. ✅ Same database file

## Key Integration Points

### 1. Project ↔ Mastra Thread Relationship

**Strategy**: `projectId` serves as both the Prisma Project ID and the Mastra threadId.

```typescript
// Creating a Project with Mastra Thread integration
import { cuid } from '@paralleldrive/cuid2';

const projectId = cuid();

// 1. Create Mastra thread with custom ID
const agent = mastra.getAgent('promptGenerator');
const memory = await agent.getMemory();
const thread = await memory.createThread({
  threadId: projectId,  // ✅ Custom ID (same as Project ID)
  resourceId: 'app-projects',
  title: projectName,
  metadata: { createdBy: 'user-123' }
});

// 2. Create Prisma Project with same ID
const project = await prisma.project.create({
  data: {
    id: projectId,  // ✅ Same ID as Mastra thread
    name: projectName
  }
});

// Result: project.id === thread.id
// Both records exist in the same database file!
```

**Database State:**
```sql
-- In prisma/mastra.db:
SELECT id, name FROM projects WHERE id = 'cuid123';
-- Returns: cuid123, "My Project"

SELECT id, title FROM mastra_threads WHERE id = 'cuid123';
-- Returns: cuid123, "My Project"
```

**Benefits:**
- ✅ 1:1 mapping between Project and AI conversation thread
- ✅ No synchronization issues (single DB file)
- ✅ Simple queries: `projectId` directly retrieves thread
- ✅ Complete AI conversation traceability
- ✅ Atomic operations possible (same database)

### 2. Prompt ↔ Mastra Message Relationship

**Strategy**: `Prompt.mastraMessageId` references the Mastra message that generated it.

```typescript
// Generating a Prompt via AI
const response = await agent.generate(userMessage, {
  memory: {
    thread: projectId,  // Uses Project ID as thread ID
    resource: 'app-projects'
  }
});

const prompt = await prisma.prompt.create({
  data: {
    projectId,
    content: response.text,
    mastraMessageId: response.metadata?.messageId,  // ✅ Link to Mastra message
    type: 'IMAGE'
  }
});
```

**Database State:**
```sql
-- In prisma/mastra.db:
SELECT id, content, mastraMessageId FROM prompts WHERE id = 'prompt123';
-- Returns: prompt123, "A beautiful sunset...", "msg456"

-- Query Mastra message using raw SQL:
SELECT id, content FROM mastra_messages WHERE id = 'msg456';
-- Returns: msg456, "Generate a prompt about sunset"
```

**Benefits:**
- ✅ Bidirectional tracing: Prompt ↔ AI Message
- ✅ Audit trail for AI-generated content
- ✅ Debug AI behavior by referencing original message
- ✅ All data in single file for easy backup

## Schema Design

### Prisma Models

```prisma
model Project {
  id        String   @id @default(cuid())  // Also serves as Mastra threadId
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  prompts   Prompt[]
  @@map("projects")
}

model Prompt {
  id               String     @id @default(cuid())
  projectId        String     // FK to Project (= Mastra threadId)
  type             PromptType
  content          String
  userFeedback     String?
  aiComment        String?
  mastraMessageId  String?    @unique  // Reference to Mastra message
  parentId         String?
  createdAt        DateTime   @default(now())
  updatedAt        DateTime   @updatedAt
  
  project          Project    @relation(fields: [projectId], references: [id], onDelete: Cascade)
  parent           Prompt?    @relation("PromptHierarchy", fields: [parentId], references: [id])
  children         Prompt[]   @relation("PromptHierarchy")
  assets           Asset[]
  
  @@index([projectId])
  @@index([parentId])
  @@index([mastraMessageId])
  @@map("prompts")
}

model Asset {
  id         String        @id @default(cuid())
  promptId   String
  type       AssetType
  url        String
  provider   AssetProvider
  // ... other fields
  prompt     Prompt        @relation(fields: [promptId], references: [id], onDelete: Cascade)
  @@map("assets")
}
```

### Table Verification

**Verified tables in `prisma/mastra.db`:**

```bash
$ sqlite3 prisma/mastra.db ".tables"

# Prisma Tables:
projects                  # ✅ Application projects
prompts                   # ✅ Generated prompts
assets                    # ✅ Media assets
_prisma_migrations        # ✅ Migration history

# Mastra Tables:
mastra_threads            # ✅ AI conversation threads
mastra_messages           # ✅ AI messages
mastra_resources          # ✅ Resource management
mastra_ai_spans           # ✅ AI tracing
mastra_evals              # ✅ Evaluation data
mastra_scorers            # ✅ Scoring data
mastra_traces             # ✅ Trace logs
mastra_workflow_snapshot  # ✅ Workflow state
```

## Migration Workflow

### ⚠️ CRITICAL: Migration Safety

**Safe operations:**
```bash
# Add new models/fields (safe - only affects Prisma tables)
npx prisma migrate dev --name add_new_field

# Generate Prisma Client
npx prisma generate
```

**DANGEROUS operations:**
```bash
# ⚠️ THIS WILL DELETE ENTIRE DATABASE (including Mastra tables!)
npx prisma migrate reset  # ❌ NEVER USE unless intentional

# ⚠️ THIS WILL DELETE ALL DATA
npx prisma db push --force-reset  # ❌ NEVER USE
```

**Best practice:**
- Always use `prisma migrate dev` for schema changes
- Prisma only modifies its own tables (`projects`, `prompts`, `assets`)
- Mastra tables (`mastra_*`) are untouched by Prisma migrations
- Backup `prisma/mastra.db` before major changes

### Database File Management

**Location:**
- **Physical file**: `./prisma/mastra.db` (from project root)
- **Mastra reference**: `file:../../prisma/mastra.db` (from `.mastra/output`)
- **Prisma reference**: `file:./mastra.db` (from `prisma/` directory)

**SQLite WAL files:**
- `mastra.db-shm` - Shared memory file (active connections)
- `mastra.db-wal` - Write-Ahead Log (pending commits)
- These are auto-managed by SQLite, don't delete while app is running

**.gitignore:**
```gitignore
# Database files (add to .gitignore)
*.db
*.db-shm
*.db-wal
prisma/mastra.db
prisma/mastra.db-shm
prisma/mastra.db-wal
```

## Usage Examples

### Create Project with AI Integration

```typescript
import { mastra } from '@/mastra';
import { prisma } from '@/lib/prisma';
import { cuid } from '@paralleldrive/cuid2';

export async function createProject(name: string) {
  const projectId = cuid();
  
  // Create Mastra thread
  const agent = mastra.getAgent('promptGenerator');
  const memory = await agent.getMemory();
  await memory.createThread({
    threadId: projectId,
    resourceId: 'app-projects',
    title: name,
    metadata: { createdBy: 'user-123' }
  });
  
  // Create Prisma project
  const project = await prisma.project.create({
    data: { id: projectId, name }
  });
  
  return project;
}
```

### Generate Prompt with AI

```typescript
export async function generatePrompt(projectId: string, userMessage: string) {
  const agent = mastra.getAgent('promptGenerator');
  
  // Generate with AI (uses projectId as threadId)
  const response = await agent.generate(userMessage, {
    memory: {
      thread: projectId,
      resource: 'app-projects'
    }
  });
  
  // Save to database
  const prompt = await prisma.prompt.create({
    data: {
      projectId,
      type: 'IMAGE',
      content: response.text,
      mastraMessageId: response.metadata?.messageId
    }
  });
  
  return prompt;
}
```

### Trace AI Conversation from Prompt

```typescript
export async function getPromptWithAIHistory(promptId: string) {
  // Get prompt from Prisma
  const prompt = await prisma.prompt.findUnique({
    where: { id: promptId },
    include: { project: true }
  });
  
  if (!prompt) return null;
  
  // Get AI conversation from Mastra
  const agent = mastra.getAgent('promptGenerator');
  const memory = await agent.getMemory();
  const thread = await memory.getThreadById({
    threadId: prompt.project.id  // projectId = threadId
  });
  
  return {
    prompt,
    aiConversation: thread?.messages || [],
    specificMessage: thread?.messages.find(
      msg => msg.id === prompt.mastraMessageId
    )
  };
}
```

### Query Both Systems

```typescript
// Example: Get all projects with AI conversation counts
export async function getProjectsWithStats() {
  const projects = await prisma.project.findMany({
    include: {
      _count: {
        select: { prompts: true }
      }
    }
  });
  
  const agent = mastra.getAgent('promptGenerator');
  const memory = await agent.getMemory();
  
  const projectsWithStats = await Promise.all(
    projects.map(async (project) => {
      const thread = await memory.getThreadById({ threadId: project.id });
      return {
        ...project,
        aiMessageCount: thread?.messages?.length || 0
      };
    })
  );
  
  return projectsWithStats;
}
```

## Advantages of Unified Database

### ✅ Benefits

1. **Single Source of Truth**
   - All data in one file: `prisma/mastra.db`
   - Easier backups, simpler deployment

2. **Data Integrity**
   - Atomic operations possible (same SQLite connection)
   - Consistent state across Mastra and Prisma

3. **Simplified Architecture**
   - No need to synchronize separate databases
   - Easier to understand and maintain

4. **Easy Migration**
   - Future migration to PostgreSQL/MySQL: both systems use same connection
   - Can use Prisma's migration tools for entire database

5. **Development Experience**
   - Single database file to backup/restore
   - Prisma Studio shows all data
   - Simpler connection management

### ⚠️ Considerations

1. **Schema Independence**
   - Prisma manages `projects`, `prompts`, `assets`
   - Mastra manages `mastra_*` tables
   - No cross-system foreign keys (use ID references instead)

2. **Migration Coordination**
   - Prisma migrations only touch Prisma tables
   - Mastra auto-creates/updates its own tables
   - Both safe to run independently

3. **Backup Strategy**
   - Backup entire `prisma/mastra.db` file
   - Includes both application and AI data

## Troubleshooting

### Issue: "Unable to open connection to database"

**Cause:** Path resolution issue

**Solution:** Verify paths:
```bash
# Check Mastra path (from .mastra/output)
cd .mastra/output
ls ../../prisma/mastra.db  # Should exist

# Check Prisma path (from project root)
ls prisma/mastra.db  # Should exist
```

### Issue: "Table already exists"

**Cause:** Running Prisma migration on existing database

**Solution:** This is normal! Prisma adds its tables alongside Mastra tables.

### Issue: Can't see Mastra tables in Prisma Studio

**Expected behavior:** Prisma Studio only shows tables defined in `schema.prisma`.

**Solution:** Use SQLite CLI or database viewer:
```bash
sqlite3 prisma/mastra.db ".tables"
sqlite3 prisma/mastra.db "SELECT * FROM mastra_threads;"
```

## Summary

✅ **Unified database** (`prisma/mastra.db`) shared between Mastra and Prisma
✅ **No conflicts**: Different table naming schemes (`mastra_*` vs `projects`, `prompts`, `assets`)
✅ **Seamless integration**: `projectId = threadId`, `mastraMessageId` reference
✅ **Type-safe**: Prisma Client for application data, Mastra API for AI data
✅ **Traceability**: Complete audit trail from UI → Prisma → Mastra AI
✅ **Safe migrations**: Prisma only touches its own tables
✅ **Single file**: Easy backup, simple deployment

This architecture provides the best of both worlds:
- **Mastra** handles AI conversation memory and thread management
- **Prisma** provides type-safe ORM for application business logic
- **Unified DB** ensures data consistency and simplifies operations
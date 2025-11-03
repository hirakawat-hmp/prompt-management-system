# Generation Task Model Design

## Overview

This document describes the unified task model for handling asynchronous image/video generation across all 4 Kie.ai API providers:
- **Imagen4**: Google's fast image generation
- **Veo3**: Google's video generation (Fast & Quality)
- **Midjourney**: Popular image generation
- **Sora2**: OpenAI's text-to-video generation

All 4 APIs follow an **asynchronous task-based pattern** with polling.

## Key Findings

### Common Pattern Across All APIs

```typescript
// 1. Create Task
POST /api/v1/.../createTask or /generate
Request: { model, input, callBackUrl? }
Response: { code: 200, data: { taskId } }

// 2. Poll Status (repeated until complete)
GET /api/v1/.../recordInfo?taskId=xxx
Response: {
  code: 200,
  data: {
    taskId,
    state: "waiting" | "success" | "fail",  // or successFlag: 0 | 1 | 2
    resultJson: string,  // JSON string with resultUrls
    failCode?: string,
    failMsg?: string
  }
}

// 3. Extract Results
resultJson = JSON.parse(data.resultJson)
// { resultUrls: ["https://..."] } for image/video
```

### API Endpoint Mapping

| Provider | Create Endpoint | Query Endpoint | Status Field | Result Field |
|----------|----------------|----------------|--------------|--------------|
| **Imagen4** | `POST /api/v1/jobs/createTask` | `GET /api/v1/jobs/recordInfo` | `state` (string) | `resultJson.resultUrls` |
| **Veo3** | `POST /api/v1/veo/generate` | `GET /api/v1/veo/record-info` | `successFlag` (int) | `response.resultUrls` |
| **Midjourney** | `POST /api/v1/mj/generate` | `GET /api/v1/mj/record-info` | `successFlag` (int) | `response.resultUrls` |
| **Sora2** | `POST /api/v1/jobs/createTask` | `GET /api/v1/jobs/recordInfo` | `state` (string) | `resultJson.resultUrls` |

### Status State Normalization

Different providers use different status formats:

**String-based (Imagen4, Sora2)**:
- `"waiting"` → PENDING
- `"success"` → SUCCESS
- `"fail"` → FAILED

**Integer-based (Veo3, Midjourney)**:
- `0` → PENDING
- `1` → SUCCESS
- `2` or `3` → FAILED

## Key Design Decisions

### Multi-Service Architecture

This system is designed to support **multiple AI service providers** beyond Kie.ai:

| Service | Supported Models | API Type |
|---------|------------------|----------|
| **Kie.ai** | Imagen4, Veo3, Midjourney, Sora2 | Task-based async (polling) |
| **Google AI** (Future) | Imagen4, Gemini 2.0, Veo3 | Direct API |
| **Azure OpenAI** (Future) | GPT-4o, DALL-E 3 | REST API |
| **OpenAI** (Future) | DALL-E 3, Sora | REST API |

**Design Principle**: Separate **Service** (where we call) from **Model** (what we use) to allow flexibility in routing the same model through different services.

### Why Service + Model Separation?

```typescript
// ✅ Good: Explicit service routing
service: 'KIE'
model: 'IMAGEN4'
// → Use Kie.ai's Imagen4 API (task-based, polling)

service: 'GOOGLE'
model: 'IMAGEN4'
// → Use Google AI's Imagen4 API directly (different auth, endpoints)

// ❌ Bad: Ambiguous provider
provider: 'IMAGEN4'
// → Which service? Kie.ai or Google AI?
```

### Why Provider-Specific Parameters?

After analyzing all 4 Kie.ai APIs, we discovered **significant differences** in capabilities:

| Model | Generation Modes | Unique Features |
|-------|-----------------|----------------|
| **Veo3** | TEXT_2_VIDEO, FIRST_AND_LAST_FRAMES_2_VIDEO, REFERENCE_2_VIDEO | 2 model variants (veo3/veo3_fast), imageUrls (0-3), complex mode constraints |
| **Midjourney** | 6 task types (txt2img, img2img, style_reference, omni_reference, video, video_hd) | Speed settings, model versions (7, 6.1, niji6), advanced params (variety, stylization, weirdness, ow), video batch sizes |
| **Imagen4** | TEXT_2_IMAGE only | Simple, supports 1-4 images per task, negative_prompt, seed |
| **Sora2** | TEXT_2_VIDEO only | Simple, frame count (10s/15s), watermark removal |

**Conclusion**: Attempting to unify these into a single schema with fixed columns would be inflexible and limiting. Instead, we use **discriminated union types** in TypeScript and **JSON storage** in Prisma.

## Database Schema

### GenerationTask Model

```prisma
model GenerationTask {
  id            String   @id @default(cuid())

  // Relationships
  promptId      String
  prompt        Prompt   @relation(fields: [promptId], references: [id], onDelete: Cascade)

  // Service + Model (2-layer architecture)
  service       GenerationService   // KIE, GOOGLE, AZURE, OPENAI
  model         GenerationModel     // IMAGEN4, VEO3, MIDJOURNEY, SORA2, etc.

  externalTaskId String?            // taskId from external service (nullable for sync APIs)

  // Task Status
  status        TaskStatus          // PENDING, SUCCESS, FAILED

  // Service-Specific Parameters (JSON type for flexibility)
  // TypeScript type: KieImagen4Params | KieVeo3Params | GoogleImagen4Params | ...
  providerParams Json               // Store complete service+model-specific request parameters

  // Response Data
  resultJson    String?             // Raw JSON response from API
  failCode      String?             // Error code if failed
  failMsg       String?             // Error message if failed

  // Generated Assets (1-to-many)
  assets        Asset[]             // Created when status = SUCCESS

  // Timestamps
  createdAt     DateTime @default(now())
  completedAt   DateTime?           // When status changed to SUCCESS/FAILED

  @@index([promptId])
  @@index([service, model])
  @@index([externalTaskId])
  @@index([status])
}

enum GenerationService {
  KIE       // Kie.ai service
  GOOGLE    // Google AI Platform (Vertex AI, AI Studio)
  AZURE     // Azure OpenAI Service
  OPENAI    // OpenAI API
}

enum GenerationModel {
  // Image Generation Models
  IMAGEN4
  MIDJOURNEY
  DALL_E_3

  // Video Generation Models
  VEO3
  SORA2

  // Multimodal Models (can generate images/videos)
  GEMINI_2_0
  GPT_4O
}

enum TaskStatus {
  PENDING    // Task created, waiting or generating
  SUCCESS    // Generation completed successfully
  FAILED     // Generation failed
}
```

### Updated Prompt Model

```prisma
model Prompt {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  // Content
  type            PromptType        // IMAGE, VIDEO
  content         String

  // Graph relationships
  parentId        String?
  parent          Prompt?  @relation("PromptTree", fields: [parentId], references: [id], onDelete: SetNull)
  children        Prompt[] @relation("PromptTree")

  // User Feedback
  feedbackScore   Int?
  feedbackComment String?

  // AI Comment
  aiComment       String?

  // Generation Tasks (1-to-many)
  generationTasks GenerationTask[]  // NEW: Track all generation attempts

  // Generated Assets (indirect via generationTasks)
  assets          Asset[]

  // Timestamps
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([projectId])
  @@index([parentId])
}
```

### Updated Asset Model (No Changes)

```prisma
model Asset {
  id              String   @id @default(cuid())

  // Relationships
  promptId        String
  prompt          Prompt   @relation(fields: [promptId], references: [id], onDelete: Cascade)

  generationTaskId String?
  generationTask   GenerationTask? @relation(fields: [generationTaskId], references: [id], onDelete: SetNull)

  // Asset Info (unchanged)
  type            AssetType         // IMAGE, VIDEO
  url             String
  thumbnailUrl    String?
  metadata        Json?

  // Timestamps
  createdAt       DateTime @default(now())

  @@index([promptId])
  @@index([generationTaskId])
}
```

## TypeScript Type Definitions

### Service Compatibility Matrix

Define which models are supported by which services:

```typescript
// src/types/generation-compatibility.ts

export type ServiceModelCombination =
  // Kie.ai supported models
  | { service: 'KIE'; model: 'IMAGEN4' }
  | { service: 'KIE'; model: 'VEO3' }
  | { service: 'KIE'; model: 'MIDJOURNEY' }
  | { service: 'KIE'; model: 'SORA2' }
  // Google AI supported models (future)
  | { service: 'GOOGLE'; model: 'IMAGEN4' }
  | { service: 'GOOGLE'; model: 'VEO3' }
  | { service: 'GOOGLE'; model: 'GEMINI_2_0' }
  // Azure OpenAI supported models (future)
  | { service: 'AZURE'; model: 'DALL_E_3' }
  | { service: 'AZURE'; model: 'GPT_4O' }
  // OpenAI supported models (future)
  | { service: 'OPENAI'; model: 'DALL_E_3' }
  | { service: 'OPENAI'; model: 'SORA2' }
  | { service: 'OPENAI'; model: 'GPT_4O' };

// Runtime validation helper
export function isValidServiceModelCombination(
  service: string,
  model: string
): boolean {
  const validCombinations: Record<string, string[]> = {
    KIE: ['IMAGEN4', 'VEO3', 'MIDJOURNEY', 'SORA2'],
    GOOGLE: ['IMAGEN4', 'VEO3', 'GEMINI_2_0'],
    AZURE: ['DALL_E_3', 'GPT_4O'],
    OPENAI: ['DALL_E_3', 'SORA2', 'GPT_4O'],
  };

  return validCombinations[service]?.includes(model) ?? false;
}
```

### Provider-Specific Parameter Types

```typescript
// src/types/generation.ts

// Discriminated union type for type safety (Service + Model)
export type ProviderParams =
  // Kie.ai service
  | KieImagen4Params
  | KieVeo3Params
  | KieMidjourneyParams
  | KieSora2Params
  // Google AI service (future)
  | GoogleImagen4Params
  | GoogleVeo3Params
  // Azure/OpenAI (future)
  | AzureDallE3Params;

// ============================================================================
// Kie.ai - Imagen4
// ============================================================================

export interface KieImagen4Params {
  service: 'KIE';
  model: 'IMAGEN4';
  apiModel: 'google/imagen4-fast';  // Kie.ai specific model identifier
  input: {
    prompt: string;  // Max 5000 chars
    negative_prompt?: string;
    aspect_ratio?: '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
    num_images?: '1' | '2' | '3' | '4';
    seed?: number;
  };
  callBackUrl?: string;
}

// ============================================================================
// Kie.ai - Veo3
// ============================================================================

export interface KieVeo3Params {
  service: 'KIE';
  model: 'VEO3';
  prompt: string;
  modelVariant: 'veo3' | 'veo3_fast';  // Kie.ai specific variants
  generationType?: 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO';
  imageUrls?: string[];  // 0-3 images depending on generationType
  aspectRatio?: '16:9' | '9:16' | 'Auto';
  seeds?: number;  // 10000-99999
  watermark?: string;
  callBackUrl?: string;
  enableTranslation?: boolean;
}

// ============================================================================
// Kie.ai - Midjourney
// ============================================================================

export interface KieMidjourneyParams {
  service: 'KIE';
  model: 'MIDJOURNEY';
  taskType: 'mj_txt2img' | 'mj_img2img' | 'mj_style_reference' | 'mj_omni_reference' | 'mj_video' | 'mj_video_hd';
  prompt: string;
  speed?: 'relaxed' | 'fast' | 'turbo';  // Not required for video/omni
  fileUrls?: string[];
  aspectRatio?: '1:2' | '9:16' | '2:3' | '3:4' | '5:6' | '6:5' | '4:3' | '3:2' | '1:1' | '16:9' | '2:1';
  version?: '7' | '6.1' | '6' | '5.2' | '5.1' | 'niji6';
  variety?: number;  // 0-100, increment by 5
  stylization?: number;  // 0-1000, multiple of 50
  weirdness?: number;  // 0-3000, multiple of 100
  ow?: number;  // 1-1000, for omni_reference only
  waterMark?: string;
  enableTranslation?: boolean;
  callBackUrl?: string;
  videoBatchSize?: 1 | 2 | 4;  // For video generation only
  motion?: 'high' | 'low';  // Required for video generation
}

// ============================================================================
// Kie.ai - Sora2
// ============================================================================

export interface KieSora2Params {
  service: 'KIE';
  model: 'SORA2';
  apiModel: 'sora-2-text-to-video';  // Kie.ai specific model identifier
  input: {
    prompt: string;  // Max 5000 chars
    aspect_ratio?: 'portrait' | 'landscape';
    n_frames?: '10' | '15';  // 10s or 15s
    remove_watermark?: boolean;
  };
  callBackUrl?: string;
}

// ============================================================================
// Google AI - Imagen4 (Future)
// ============================================================================

export interface GoogleImagen4Params {
  service: 'GOOGLE';
  model: 'IMAGEN4';
  prompt: string;
  negativePrompt?: string;
  aspectRatio?: '1:1' | '16:9' | '9:16' | '3:4' | '4:3';
  numberOfImages?: 1 | 2 | 3 | 4;
  seed?: number;
  // Google AI specific parameters...
}

// ============================================================================
// Google AI - Veo3 (Future)
// ============================================================================

export interface GoogleVeo3Params {
  service: 'GOOGLE';
  model: 'VEO3';
  prompt: string;
  // Google AI specific parameters...
}

// ============================================================================
// Zod Schemas for Runtime Validation with Service+Model Validation
// ============================================================================

import { z } from 'zod';

// Base schema that validates service+model combination
const baseServiceModelSchema = z.object({
  service: z.enum(['KIE', 'GOOGLE', 'AZURE', 'OPENAI']),
  model: z.enum(['IMAGEN4', 'VEO3', 'MIDJOURNEY', 'SORA2', 'DALL_E_3', 'GEMINI_2_0', 'GPT_4O']),
}).refine(
  (data) => isValidServiceModelCombination(data.service, data.model),
  (data) => ({
    message: `Invalid combination: ${data.service} does not support ${data.model}`,
    path: ['service', 'model'],
  })
);

export const KieImagen4Schema = baseServiceModelSchema.extend({
  service: z.literal('KIE'),
  model: z.literal('IMAGEN4'),
  apiModel: z.literal('google/imagen4-fast'),
  input: z.object({
    prompt: z.string().min(1).max(5000),
    negative_prompt: z.string().max(5000).optional(),
    aspect_ratio: z.enum(['1:1', '16:9', '9:16', '3:4', '4:3']).optional(),
    num_images: z.enum(['1', '2', '3', '4']).optional(),
    seed: z.number().optional(),
  }),
  callBackUrl: z.string().url().optional(),
});

export const KieVeo3Schema = baseServiceModelSchema.extend({
  service: z.literal('KIE'),
  model: z.literal('VEO3'),
  prompt: z.string().min(1).max(5000),
  modelVariant: z.enum(['veo3', 'veo3_fast']),
  generationType: z.enum(['TEXT_2_VIDEO', 'FIRST_AND_LAST_FRAMES_2_VIDEO', 'REFERENCE_2_VIDEO']).optional(),
  imageUrls: z.array(z.string().url()).max(3).optional(),
  aspectRatio: z.enum(['16:9', '9:16', 'Auto']).optional(),
  seeds: z.number().min(10000).max(99999).optional(),
  watermark: z.string().optional(),
  callBackUrl: z.string().url().optional(),
  enableTranslation: z.boolean().optional(),
});

export const KieMidjourneySchema = baseServiceModelSchema.extend({
  service: z.literal('KIE'),
  model: z.literal('MIDJOURNEY'),
  taskType: z.enum(['mj_txt2img', 'mj_img2img', 'mj_style_reference', 'mj_omni_reference', 'mj_video', 'mj_video_hd']),
  prompt: z.string().min(1).max(2000),
  speed: z.enum(['relaxed', 'fast', 'turbo']).optional(),
  fileUrls: z.array(z.string().url()).optional(),
  aspectRatio: z.enum(['1:2', '9:16', '2:3', '3:4', '5:6', '6:5', '4:3', '3:2', '1:1', '16:9', '2:1']).optional(),
  version: z.enum(['7', '6.1', '6', '5.2', '5.1', 'niji6']).optional(),
  variety: z.number().min(0).max(100).optional(),
  stylization: z.number().min(0).max(1000).optional(),
  weirdness: z.number().min(0).max(3000).optional(),
  ow: z.number().min(1).max(1000).optional(),
  waterMark: z.string().optional(),
  enableTranslation: z.boolean().optional(),
  callBackUrl: z.string().url().optional(),
  videoBatchSize: z.enum([1, 2, 4]).optional(),
  motion: z.enum(['high', 'low']).optional(),
});

export const KieSora2Schema = baseServiceModelSchema.extend({
  service: z.literal('KIE'),
  model: z.literal('SORA2'),
  apiModel: z.literal('sora-2-text-to-video'),
  input: z.object({
    prompt: z.string().min(1).max(5000),
    aspect_ratio: z.enum(['portrait', 'landscape']).optional(),
    n_frames: z.enum(['10', '15']).optional(),
    remove_watermark: z.boolean().optional(),
  }),
  callBackUrl: z.string().url().optional(),
});

// Discriminated union on both 'service' and 'model'
export const ProviderParamsSchema = z.discriminatedUnion('service', [
  KieImagen4Schema,
  KieVeo3Schema,
  KieMidjourneySchema,
  KieSora2Schema,
  // Future: GoogleImagen4Schema, AzureDallE3Schema, etc.
]);

// Type guard helpers
export function isKieImagen4Params(params: ProviderParams): params is KieImagen4Params {
  return params.service === 'KIE' && params.model === 'IMAGEN4';
}

export function isKieVeo3Params(params: ProviderParams): params is KieVeo3Params {
  return params.service === 'KIE' && params.model === 'VEO3';
}

export function isKieMidjourneyParams(params: ProviderParams): params is KieMidjourneyParams {
  return params.service === 'KIE' && params.model === 'MIDJOURNEY';
}

export function isKieSora2Params(params: ProviderParams): params is KieSora2Params {
  return params.service === 'KIE' && params.model === 'SORA2';
}
```

## Directory Structure

### Service-Oriented Architecture

Since the same model (e.g., Veo3 Text-to-Video) has **different request logic** depending on the service, we organize code by **service first**, then by **model**.

```
src/
├── lib/
│   └── generation/
│       ├── index.ts                    # Public API exports
│       ├── types.ts                    # Shared types (TaskStatus, etc.)
│       ├── compatibility.ts            # Service+Model validation matrix
│       │
│       ├── services/                   # Service-specific implementations
│       │   ├── kie/
│       │   │   ├── index.ts            # Kie.ai service entry point
│       │   │   ├── client.ts           # Kie.ai HTTP client (base URL, auth)
│       │   │   ├── polling.ts          # Kie.ai polling strategy
│       │   │   ├── types.ts            # Kie.ai-specific types
│       │   │   ├── models/
│       │   │   │   ├── imagen4.ts      # KieImagen4Params, API calls
│       │   │   │   ├── veo3.ts         # KieVeo3Params, API calls
│       │   │   │   ├── midjourney.ts   # KieMidjourneyParams, API calls
│       │   │   │   └── sora2.ts        # KieSora2Params, API calls
│       │   │   └── __tests__/
│       │   │       ├── imagen4.test.ts
│       │   │       └── veo3.test.ts
│       │   │
│       │   ├── google/                 # Future: Google AI service
│       │   │   ├── index.ts
│       │   │   ├── client.ts           # Vertex AI / AI Studio client
│       │   │   ├── types.ts
│       │   │   └── models/
│       │   │       ├── imagen4.ts      # GoogleImagen4Params (different from Kie!)
│       │   │       └── veo3.ts
│       │   │
│       │   ├── azure/                  # Future: Azure OpenAI service
│       │   │   ├── index.ts
│       │   │   ├── client.ts
│       │   │   └── models/
│       │   │       └── dall-e-3.ts
│       │   │
│       │   └── openai/                 # Future: OpenAI service
│       │       ├── index.ts
│       │       ├── client.ts
│       │       └── models/
│       │           └── dall-e-3.ts
│       │
│       └── factory.ts                  # Service factory (routing logic)
│
├── actions/
│   └── generation/
│       ├── create-task.ts              # Server Action: createGenerationTask
│       ├── query-task.ts               # Server Action: queryGenerationTask
│       └── retry-task.ts               # Server Action: retryGenerationTask
│
└── types/
    └── generation.ts                   # Union types (ProviderParams, etc.)
```

### Key Design Principles

#### 1. Service-First Organization

```typescript
// ❌ BAD: Model-first (doesn't scale)
src/lib/generation/
  ├── imagen4/
  │   ├── kie.ts
  │   └── google.ts
  └── veo3/
      ├── kie.ts
      └── google.ts

// ✅ GOOD: Service-first (clear boundaries)
src/lib/generation/services/
  ├── kie/
  │   └── models/
  │       ├── imagen4.ts
  │       └── veo3.ts
  └── google/
      └── models/
          ├── imagen4.ts
          └── veo3.ts
```

**Rationale**: Each service has unique:
- **Authentication** (API keys, OAuth, service accounts)
- **Endpoints** (different base URLs)
- **Response formats** (Kie.ai uses `resultJson` string, Google AI uses direct objects)
- **Error codes** (service-specific error handling)
- **Rate limits** (per-service throttling)

#### 2. Model Files Contain Everything for That Service+Model

Each model file (`kie/models/imagen4.ts`) should contain:

```typescript
// src/lib/generation/services/kie/models/imagen4.ts

import { z } from 'zod';
import { kieClient } from '../client';

// 1. TypeScript types
export interface KieImagen4Params {
  service: 'KIE';
  model: 'IMAGEN4';
  apiModel: 'google/imagen4-fast';
  input: { /* ... */ };
}

// 2. Zod schema
export const KieImagen4Schema = z.object({ /* ... */ });

// 3. API request function
export async function createKieImagen4Task(
  params: KieImagen4Params
): Promise<{ taskId: string }> {
  const response = await kieClient.post('/api/v1/jobs/createTask', {
    model: params.apiModel,
    input: params.input,
  });
  return { taskId: response.data.taskId };
}

// 4. API query function
export async function queryKieImagen4Task(
  taskId: string
): Promise<KieTaskResponse> {
  const response = await kieClient.get('/api/v1/jobs/recordInfo', {
    params: { taskId },
  });
  return response.data;
}

// 5. Result transformer
export function transformKieImagen4Result(
  resultJson: string
): string[] {
  const parsed = JSON.parse(resultJson);
  return parsed.resultUrls || [];
}
```

#### 3. Service Factory for Routing

```typescript
// src/lib/generation/factory.ts

import type { ProviderParams } from '@/types/generation';
import * as kie from './services/kie';
import * as google from './services/google';

export async function createTask(params: ProviderParams) {
  switch (params.service) {
    case 'KIE':
      return kie.createTask(params);
    case 'GOOGLE':
      return google.createTask(params);
    case 'AZURE':
      throw new Error('Azure service not yet implemented');
    case 'OPENAI':
      throw new Error('OpenAI service not yet implemented');
    default:
      const _exhaustive: never = params;
      throw new Error(`Unknown service: ${params}`);
  }
}

export async function queryTask(
  service: GenerationService,
  taskId: string
) {
  switch (service) {
    case 'KIE':
      return kie.queryTask(taskId);
    case 'GOOGLE':
      return google.queryTask(taskId);
    // ...
  }
}
```

#### 4. Service Entry Point Handles Model Routing

```typescript
// src/lib/generation/services/kie/index.ts

import type { ProviderParams } from '@/types/generation';
import * as imagen4 from './models/imagen4';
import * as veo3 from './models/veo3';
import * as midjourney from './models/midjourney';
import * as sora2 from './models/sora2';

export async function createTask(params: ProviderParams) {
  if (params.service !== 'KIE') {
    throw new Error('Invalid service for Kie handler');
  }

  switch (params.model) {
    case 'IMAGEN4':
      return imagen4.createKieImagen4Task(params);
    case 'VEO3':
      return veo3.createKieVeo3Task(params);
    case 'MIDJOURNEY':
      return midjourney.createKieMidjourneyTask(params);
    case 'SORA2':
      return sora2.createKieSora2Task(params);
    default:
      throw new Error(`Unsupported model for KIE: ${params.model}`);
  }
}

export async function queryTask(taskId: string) {
  // Kie.ai uses same endpoint for all models
  return kieClient.get('/api/v1/jobs/recordInfo', {
    params: { taskId },
  });
}
```

### Example: Adding a New Service

To add **Google AI** support for **Imagen4**:

1. **Create directory structure**:
   ```
   src/lib/generation/services/google/
   ├── index.ts
   ├── client.ts
   ├── types.ts
   └── models/
       └── imagen4.ts
   ```

2. **Define Google-specific client** (`google/client.ts`):
   ```typescript
   import { GoogleAuth } from 'google-auth-library';

   const auth = new GoogleAuth({
     keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
     scopes: ['https://www.googleapis.com/auth/cloud-platform'],
   });

   export const googleClient = axios.create({
     baseURL: 'https://us-central1-aiplatform.googleapis.com',
     // ... service account auth
   });
   ```

3. **Implement model** (`google/models/imagen4.ts`):
   ```typescript
   export async function createGoogleImagen4Task(
     params: GoogleImagen4Params
   ) {
     // Call Vertex AI endpoint directly (no task polling!)
     const response = await googleClient.post('/v1/projects/.../images:generate', {
       prompt: params.prompt,
       // ... Google AI specific format
     });

     // Google AI returns results synchronously in many cases
     return {
       status: 'SUCCESS',
       resultUrls: response.data.images.map(img => img.uri),
     };
   }
   ```

4. **Update factory** (`factory.ts`):
   ```typescript
   case 'GOOGLE':
     return google.createTask(params);
   ```

5. **Update compatibility matrix** (`compatibility.ts`):
   ```typescript
   GOOGLE: ['IMAGEN4', 'VEO3', 'GEMINI_2_0'],
   ```

## Implementation Flow

### 1. Create Generation Task

```typescript
// Server Action: src/actions/generate-asset.ts
'use server';

import { prisma } from '@/lib/prisma';
import { createId } from '@paralleldrive/cuid2';
import type { ProviderParams } from '@/types/generation';
import { ProviderParamsSchema } from '@/types/generation';

export async function createGenerationTask(input: {
  promptId: string;
  providerParams: ProviderParams;  // Discriminated union type
}): Promise<ActionResult<GenerationTask>> {
  try {
    // 1. Validate provider params with Zod
    const validated = ProviderParamsSchema.parse(input.providerParams);

    // 2. Call Kie.ai API to create task
    const kieResponse = await createKieTask(validated);

    if (kieResponse.code !== 200) {
      return { success: false, error: kieResponse.msg };
    }

    const externalTaskId = kieResponse.data.taskId;

    // 3. Store GenerationTask in database
    const task = await prisma.generationTask.create({
      data: {
        id: createId(),
        promptId: input.promptId,
        provider: validated.provider,
        externalTaskId,
        status: 'PENDING',
        providerParams: validated as any,  // Stored as JSON in Prisma
      },
    });

    // 4. Start background polling (non-blocking)
    startPolling(task.id, validated.provider, externalTaskId);

    return { success: true, data: task };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: `Validation error: ${error.message}` };
    }
    return { success: false, error: error.message };
  }
}

// Example usage with type safety
async function exampleUsage() {
  // Veo3 example
  await createGenerationTask({
    promptId: 'prompt_123',
    providerParams: {
      provider: 'VEO3',
      prompt: 'A dog playing in a park',
      model: 'veo3_fast',
      generationType: 'TEXT_2_VIDEO',
      aspectRatio: '16:9',
      seeds: 12345,
    },
  });

  // Midjourney example
  await createGenerationTask({
    promptId: 'prompt_456',
    providerParams: {
      provider: 'MIDJOURNEY',
      taskType: 'mj_txt2img',
      prompt: 'A cat in space',
      speed: 'fast',
      version: '7',
      variety: 10,
      stylization: 500,
    },
  });

  // Imagen4 example
  await createGenerationTask({
    promptId: 'prompt_789',
    providerParams: {
      provider: 'IMAGEN4',
      model: 'google/imagen4-fast',
      input: {
        prompt: 'A bird flying',
        num_images: '4',
        seed: 42,
      },
    },
  });
}
```

### 2. Provider-Specific API Calls

```typescript
// lib/kie/api-client.ts

import type { ProviderParams } from '@/types/generation';
import { isVeo3Params, isMidjourneyParams, isImagen4Params, isSora2Params } from '@/types/generation';

interface KieTaskResponse {
  code: number;
  msg: string;
  data: { taskId: string };
}

const PROVIDER_ENDPOINTS = {
  IMAGEN4: {
    create: '/api/v1/jobs/createTask',
    query: '/api/v1/jobs/recordInfo',
  },
  VEO3: {
    create: '/api/v1/veo/generate',
    query: '/api/v1/veo/record-info',
  },
  MIDJOURNEY: {
    create: '/api/v1/mj/generate',
    query: '/api/v1/mj/record-info',
  },
  SORA2: {
    create: '/api/v1/jobs/createTask',
    query: '/api/v1/jobs/recordInfo',
  },
};

/**
 * Transform TypeScript params to Kie.ai API format
 * Each provider has different request structure
 */
function transformToKieFormat(params: ProviderParams): Record<string, any> {
  if (isVeo3Params(params)) {
    // Veo3 API expects flat structure
    const { provider, ...rest } = params;
    return rest;
  }

  if (isMidjourneyParams(params)) {
    // Midjourney API expects flat structure
    const { provider, ...rest } = params;
    return rest;
  }

  if (isImagen4Params(params)) {
    // Imagen4 API expects { model, input, callBackUrl }
    return {
      model: params.model,
      input: params.input,
      ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
    };
  }

  if (isSora2Params(params)) {
    // Sora2 API expects { model, input, callBackUrl }
    return {
      model: params.model,
      input: params.input,
      ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
    };
  }

  throw new Error(`Unknown provider: ${(params as any).provider}`);
}

export async function createKieTask(
  params: ProviderParams
): Promise<KieTaskResponse> {
  const endpoint = PROVIDER_ENDPOINTS[params.provider].create;
  const requestBody = transformToKieFormat(params);

  const response = await fetch(`https://api.kie.ai${endpoint}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`Kie.ai API error: ${response.statusText}`);
  }

  return response.json();
}

export async function queryKieTask(
  provider: GenerationProvider,
  taskId: string
): Promise<KieTaskQueryResponse> {
  const endpoint = PROVIDER_ENDPOINTS[provider].query;

  const response = await fetch(
    `https://api.kie.ai${endpoint}?taskId=${taskId}`,
    {
      headers: {
        'Authorization': `Bearer ${process.env.KIE_API_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Kie.ai API error: ${response.statusText}`);
  }

  return response.json();
}
```

### 3. Polling Strategy

```typescript
// lib/kie/polling.ts

const POLLING_INTERVALS = {
  initial: 2000,      // 2 seconds
  standard: 5000,     // 5 seconds after 3 attempts
  max: 10000,         // 10 seconds max
};

const MAX_POLLING_DURATION = 5 * 60 * 1000; // 5 minutes timeout

export async function startPolling(
  taskId: string,
  provider: GenerationProvider,
  externalTaskId: string
) {
  const startTime = Date.now();
  let attemptCount = 0;

  const poll = async () => {
    attemptCount++;

    // Timeout check
    if (Date.now() - startTime > MAX_POLLING_DURATION) {
      await handleTimeout(taskId);
      return;
    }

    try {
      // Query Kie.ai API
      const response = await queryKieTask(provider, externalTaskId);

      // Normalize status
      const status = normalizeStatus(provider, response.data);

      if (status === 'SUCCESS') {
        await handleSuccess(taskId, response.data);
      } else if (status === 'FAILED') {
        await handleFailure(taskId, response.data);
      } else {
        // Still pending - schedule next poll
        const interval = getPollingInterval(attemptCount);
        setTimeout(poll, interval);
      }
    } catch (error) {
      await handleError(taskId, error);
    }
  };

  // Start polling
  poll();
}

function getPollingInterval(attemptCount: number): number {
  if (attemptCount < 3) return POLLING_INTERVALS.initial;
  if (attemptCount < 10) return POLLING_INTERVALS.standard;
  return POLLING_INTERVALS.max;
}

function normalizeStatus(
  provider: GenerationProvider,
  data: any
): 'PENDING' | 'SUCCESS' | 'FAILED' {
  if (provider === 'VEO3' || provider === 'MIDJOURNEY') {
    // Integer-based successFlag
    if (data.successFlag === 0) return 'PENDING';
    if (data.successFlag === 1) return 'SUCCESS';
    return 'FAILED';
  } else {
    // String-based state
    if (data.state === 'waiting') return 'PENDING';
    if (data.state === 'success') return 'SUCCESS';
    return 'FAILED';
  }
}
```

### 4. Handle Success - Create Assets

```typescript
// lib/kie/handlers.ts

async function handleSuccess(taskId: string, responseData: any) {
  // Extract result URLs
  const resultUrls = extractResultUrls(responseData);

  // Update GenerationTask
  const task = await prisma.generationTask.update({
    where: { id: taskId },
    data: {
      status: 'SUCCESS',
      resultJson: JSON.stringify(responseData),
      completedAt: new Date(),
    },
  });

  // Create Asset records
  const assets = await Promise.all(
    resultUrls.map((url: string) =>
      prisma.asset.create({
        data: {
          id: createId(),
          promptId: task.promptId,
          generationTaskId: task.id,
          type: task.prompt.type, // IMAGE or VIDEO
          url,
          metadata: {
            provider: task.provider,
            externalTaskId: task.externalTaskId,
          },
        },
      })
    )
  );

  // Invalidate React Query cache
  revalidatePath(`/projects/${task.prompt.projectId}`);

  return assets;
}

function extractResultUrls(responseData: any): string[] {
  // Veo3/Midjourney format
  if (responseData.response?.resultUrls) {
    return responseData.response.resultUrls;
  }

  // Imagen4/Sora2 format
  if (responseData.resultJson) {
    const parsed = JSON.parse(responseData.resultJson);
    return parsed.resultUrls || [];
  }

  return [];
}

async function handleFailure(taskId: string, responseData: any) {
  await prisma.generationTask.update({
    where: { id: taskId },
    data: {
      status: 'FAILED',
      resultJson: JSON.stringify(responseData),
      failCode: responseData.failCode || responseData.errorCode?.toString(),
      failMsg: responseData.failMsg || responseData.errorMessage,
      completedAt: new Date(),
    },
  });

  // Notify user (optional)
  // Could use WebSocket, Server-Sent Events, or callback URL
}

async function handleTimeout(taskId: string) {
  await prisma.generationTask.update({
    where: { id: taskId },
    data: {
      status: 'FAILED',
      failCode: 'TIMEOUT',
      failMsg: 'Generation task timed out after 5 minutes',
      completedAt: new Date(),
    },
  });
}

async function handleError(taskId: string, error: any) {
  await prisma.generationTask.update({
    where: { id: taskId },
    data: {
      status: 'FAILED',
      failCode: 'POLLING_ERROR',
      failMsg: error.message,
      completedAt: new Date(),
    },
  });
}
```

## UI Integration

### Query Hooks

```typescript
// hooks/use-generation-tasks.ts

export function useGenerationTasks(promptId: string) {
  return useQuery({
    queryKey: ['generation-tasks', promptId],
    queryFn: async () => {
      const response = await fetch(`/api/generation-tasks?promptId=${promptId}`);
      return response.json();
    },
    refetchInterval: (data) => {
      // Refetch every 3 seconds if any task is pending
      const hasPending = data?.some((task: GenerationTask) => task.status === 'PENDING');
      return hasPending ? 3000 : false;
    },
  });
}

export function useCreateGenerationTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGenerationTask,
    onSuccess: (result, variables) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['generation-tasks', variables.promptId],
        });
      }
    },
  });
}
```

### PromptGraph Enhancement

```typescript
// Show generation status on prompt nodes
export function PromptNode({ data }: NodeProps<PromptNodeData>) {
  const { data: tasks } = useGenerationTasks(data.prompt.id);

  const hasPendingTask = tasks?.some(t => t.status === 'PENDING');
  const hasFailedTask = tasks?.some(t => t.status === 'FAILED');

  return (
    <div className={cn(
      'prompt-node',
      hasPendingTask && 'border-yellow-500 animate-pulse',
      hasFailedTask && 'border-red-500'
    )}>
      {hasPendingTask && <Loader className="animate-spin" />}
      {data.prompt.content}
    </div>
  );
}
```

## Error Handling

### Common Error Codes

| Code | Description | Handling Strategy |
|------|-------------|-------------------|
| **401** | Unauthorized | Check API key, re-authenticate |
| **402** | Insufficient credits | Notify user, link to billing |
| **422** | Validation error | Show specific field errors to user |
| **429** | Rate limited | Exponential backoff, retry later |
| **500** | Server error | Retry with exponential backoff |
| **501** | Generation failed | Allow user to retry with different params |
| **TIMEOUT** | Client-side timeout | Allow manual retry |

### Retry Strategy

```typescript
export async function retryGenerationTask(taskId: string): Promise<ActionResult<GenerationTask>> {
  const originalTask = await prisma.generationTask.findUnique({
    where: { id: taskId },
    include: { prompt: true },
  });

  if (!originalTask) {
    return { success: false, error: 'Task not found' };
  }

  // Create new task with same parameters
  return createGenerationTask({
    promptId: originalTask.promptId,
    provider: originalTask.provider,
    requestParams: originalTask.requestParams as Record<string, any>,
  });
}
```

## Testing Strategy

### Unit Tests

```typescript
// lib/kie/polling.test.ts
describe('normalizeStatus', () => {
  it('should normalize Veo3 integer status', () => {
    expect(normalizeStatus('VEO3', { successFlag: 0 })).toBe('PENDING');
    expect(normalizeStatus('VEO3', { successFlag: 1 })).toBe('SUCCESS');
    expect(normalizeStatus('VEO3', { successFlag: 2 })).toBe('FAILED');
  });

  it('should normalize Imagen4 string status', () => {
    expect(normalizeStatus('IMAGEN4', { state: 'waiting' })).toBe('PENDING');
    expect(normalizeStatus('IMAGEN4', { state: 'success' })).toBe('SUCCESS');
    expect(normalizeStatus('IMAGEN4', { state: 'fail' })).toBe('FAILED');
  });
});
```

### Integration Tests

```typescript
// actions/generate-asset.test.ts
describe('createGenerationTask', () => {
  it('should create task and start polling', async () => {
    const result = await createGenerationTask({
      promptId: 'test-prompt-id',
      provider: 'IMAGEN4',
      requestParams: { prompt: 'A cat', num_images: '1' },
    });

    expect(result.success).toBe(true);
    expect(result.data.status).toBe('PENDING');
  });
});
```

## Performance Considerations

1. **Background Polling**: Use server-side polling (not client-side) to reduce client load
2. **Batch Queries**: Query multiple tasks in a single API call if possible
3. **Caching**: Cache successful results to avoid re-fetching
4. **Rate Limiting**: Implement client-side rate limiting to avoid hitting API limits
5. **Exponential Backoff**: Increase polling interval over time to reduce server load

## Future Enhancements

1. **Webhook Support**: Use callBackUrl for instant notifications instead of polling
2. **WebSocket**: Real-time status updates to UI via WebSocket connection
3. **Batch Generation**: Support generating multiple variations in a single task
4. **Priority Queue**: Prioritize urgent generation tasks
5. **Cost Tracking**: Track credit consumption per task

## References

- [Imagen4 Fast API Docs](../kie/imagen/imagen4-fast.md)
- [Veo3 API Docs](../kie/veo3/generate-veo-3-video.md)
- [Midjourney API Docs](../kie/midjourney/generate-mj-image.md)
- [Sora2 API Docs](../kie/sora2/sora-2-text-to-video.md)

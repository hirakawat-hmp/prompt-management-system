# Generation Task Server Actions

Server Actions for managing AI image/video generation tasks via Kie.ai service.

## Overview

These Server Actions provide a clean, type-safe interface for creating and managing generation tasks from Next.js client components.

## Actions

### 1. `createGenerationTask`

Creates a new image or video generation task.

**Input:**
- `promptId`: Prompt ID to associate with the task
- `providerParams`: Service and model-specific parameters (Zod validated)

**Output:**
- `GenerationTask` with status: PENDING
- Background polling starts automatically

**Example:**
```typescript
import { createGenerationTask } from '@/actions/generation';

const result = await createGenerationTask({
  promptId: 'prompt_123',
  providerParams: {
    service: 'KIE',
    model: 'IMAGEN4',
    apiModel: 'google/imagen4-fast',
    input: {
      prompt: 'A serene mountain landscape',
      aspect_ratio: '16:9',
    },
  },
});

if (result.success) {
  console.log('Task created:', result.data.id);
}
```

### 2. `queryGenerationTask`

Queries the status and results of a generation task.

**Input:**
- `taskId`: GenerationTask ID

**Output:**
- Full `GenerationTask` data with current status

**Example:**
```typescript
import { queryGenerationTask } from '@/actions/generation';

const result = await queryGenerationTask('gen_task_123');

if (result.success) {
  switch (result.data.status) {
    case 'PENDING':
      console.log('Still generating...');
      break;
    case 'SUCCESS':
      const urls = JSON.parse(result.data.resultJson!).resultUrls;
      console.log('Generated images:', urls);
      break;
    case 'FAILED':
      console.error('Failed:', result.data.failMsg);
      break;
  }
}
```

### 3. `uploadGenerationFile`

Uploads a file to Kie.ai temporary storage (3-day expiration).

**Input:**
- `FormData` with:
  - `file`: File object
  - `uploadPath`: Optional storage path (default: 'user-uploads')

**Output:**
- `UploadResult` with downloadUrl and expiry date

**Example:**
```typescript
import { uploadGenerationFile } from '@/actions/generation';

const formData = new FormData();
formData.append('file', fileInput.files[0]);

const result = await uploadGenerationFile(formData);

if (result.success) {
  console.log('File URL:', result.data.downloadUrl);
  console.log('Expires:', result.data.expiresAt);

  // Use in generation task
  await createGenerationTask({
    promptId: 'prompt_123',
    providerParams: {
      service: 'KIE',
      model: 'MIDJOURNEY',
      taskType: 'mj_img2img',
      prompt: 'Transform this image',
      fileUrls: [result.data.downloadUrl],
    },
  });
}
```

## Supported Models

### Image Generation
- **IMAGEN4**: Google's Imagen4 model
  - Text-to-image
  - Aspect ratio control
  - Batch generation (1-4 images)

- **MIDJOURNEY**: Midjourney AI
  - Text-to-image (mj_txt2img)
  - Image-to-image (mj_img2img)
  - Style reference (mj_style_reference)
  - Omni reference (mj_omni_reference)
  - Image-to-video (mj_video, mj_video_hd)

### Video Generation
- **VEO3**: Google's Veo3 model
  - Text-to-video
  - First and last frames-to-video
  - Reference-to-video

- **SORA2**: OpenAI's Sora2 model
  - Text-to-video
  - Aspect ratio control
  - Duration control (10s/15s)

## Type Safety

All actions use Zod schemas for runtime validation:
- Input validation with detailed error messages
- Type-safe provider parameters via discriminated unions
- Service+Model compatibility checking

## Error Handling

All actions return `ActionResult<T>`:
```typescript
type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

**Common errors:**
- `400`: Invalid parameters (Zod validation failed)
- `401`: Unauthorized (API key invalid)
- `402`: Payment required (insufficient credits)
- `404`: Resource not found (prompt/task not found)
- `422`: Validation error (API-level validation)
- `500`: Server error (database/API failure)

## Testing

Each action has comprehensive test coverage:
- `create-task.test.ts`: Task creation, validation, model routing
- `query-task.test.ts`: Task queries, status handling, type conversion
- `upload-file.test.ts`: File validation, upload, error handling

Run tests:
```bash
npm run test src/actions/generation
```

## Architecture

### Workflow

1. **Client** calls Server Action (e.g., `createGenerationTask`)
2. **Server Action** validates input with Zod
3. **Server Action** calls appropriate model function (imagen4/veo3/etc.)
4. **Model function** makes HTTP request to Kie.ai API
5. **Server Action** stores task in Prisma database (status: PENDING)
6. **Background polling** starts (non-blocking, updates database on completion)
7. **Server Action** returns immediately with task data
8. **Client** can poll with `queryGenerationTask` to check status

### Dependencies

```
Server Action
  ├── @/types/generation (Zod schemas, type definitions)
  ├── @/lib/prisma (Database client)
  ├── @/lib/generation/services/kie/models/* (Model implementations)
  ├── @/lib/generation/services/kie/polling (Background polling)
  └── @/lib/generation/upload (File upload utility)
```

## Best Practices

### 1. Always handle both success and error cases
```typescript
const result = await createGenerationTask(input);

if (!result.success) {
  toast.error(result.error);
  return;
}

// Use result.data safely
console.log(result.data.id);
```

### 2. Poll for completion with intervals
```typescript
useEffect(() => {
  if (task.status === 'PENDING') {
    const interval = setInterval(async () => {
      const result = await queryGenerationTask(task.id);
      if (result.success && result.data.status !== 'PENDING') {
        setTask(result.data);
        clearInterval(interval);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }
}, [task]);
```

### 3. Show expiry warnings for uploaded files
```typescript
const uploadResult = await uploadGenerationFile(formData);

if (uploadResult.success) {
  const daysUntilExpiry = Math.floor(
    (uploadResult.data.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  toast.warning(`File will expire in ${daysUntilExpiry} days`);
}
```

## Related Documentation

- [Generation Task Architecture](/docs/development/generation-task-model.md)
- [Kie.ai API Documentation](/docs/kie/)
- [Type Definitions](/src/types/generation.ts)
- [Database Schema](/prisma/schema.prisma)

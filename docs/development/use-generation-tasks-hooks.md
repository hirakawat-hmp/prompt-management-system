# Generation Task Management Hooks

## Overview

React Query hooks for managing AI generation tasks (image/video generation) with automatic polling and optimistic updates.

## Files Created

### 1. `/src/hooks/use-generation-tasks.ts`
Main hook implementations with comprehensive JSDoc documentation.

### 2. `/src/hooks/use-generation-tasks.test.ts`
Complete test suite (17 tests) covering all use cases.

### 3. `/src/actions/generation.ts`
Placeholder server actions with type definitions (to be implemented by backend-implementor).

### 4. `/src/lib/query-client.ts`
Updated with `generationTasks` query keys.

## Hooks

### `useGenerationTasks(promptId: string)`

Fetches generation tasks for a specific prompt with **automatic refetching**.

**Features:**
- Automatically polls every 3 seconds when any task is PENDING
- Stops polling when all tasks are completed (SUCCESS or FAILED)
- Uses React Query's `refetchInterval` for smart polling

**Example:**
```typescript
function TaskList({ promptId }: { promptId: string }) {
  const { data: tasks, isLoading, error } = useGenerationTasks(promptId);

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <ul>
      {tasks?.map((task) => (
        <li key={task.id}>
          {task.model} - {task.status}
        </li>
      ))}
    </ul>
  );
}
```

### `useCreateGenerationTask()`

Creates a new generation task and automatically invalidates the task query.

**Features:**
- Uses server action for type-safe mutations
- Automatically invalidates `generation-tasks` query for the prompt
- Triggers refetch after successful creation

**Example:**
```typescript
function GenerateButton({ promptId }: { promptId: string }) {
  const { mutate, isPending, error } = useCreateGenerationTask();

  const handleGenerate = () => {
    mutate(
      {
        promptId,
        providerParams: {
          service: 'KIE',
          model: 'IMAGEN4',
          apiModel: 'google/imagen4-fast',
          input: {
            prompt: 'A beautiful sunset',
            aspect_ratio: '16:9',
            num_images: '4'
          }
        }
      },
      {
        onSuccess: (result) => {
          if (result.success) {
            console.log('Task created:', result.data.id);
          } else {
            console.error('Error:', result.error);
          }
        }
      }
    );
  };

  return (
    <button onClick={handleGenerate} disabled={isPending}>
      {isPending ? 'Generating...' : 'Generate'}
    </button>
  );
}
```

### `useUploadFile()`

Uploads a file to Kie.ai temporary storage.

**Features:**
- Uploads to Kie.ai temporary storage (expires in 3 days)
- Returns download URL for use in generation tasks
- Supports image and video files

**Example:**
```typescript
function FileUploader() {
  const { mutate: uploadFile, isPending, error } = useUploadFile();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadFile(file, {
      onSuccess: (result) => {
        if (result.success) {
          console.log('File uploaded:', result.data.downloadUrl);
          console.log('Expires at:', result.data.expiresAt);
        } else {
          console.error('Upload failed:', result.error);
        }
      }
    });
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileChange}
        disabled={isPending}
        accept="image/*,video/*"
      />
      {isPending && <p>Uploading...</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}
```

## Query Keys

```typescript
queryKeys.generationTasks.byPrompt(promptId)
// Returns: ['generation-tasks', promptId]
```

## API Endpoints Required

The hooks expect the following API endpoints to be implemented:

### `GET /api/generation/tasks?promptId={promptId}`
Fetches all generation tasks for a prompt.

**Response:**
```typescript
GenerationTask[]
```

## Server Actions Required

The following server actions need to be implemented by the **backend-implementor agent**:

### `createGenerationTask(input: CreateGenerationTaskInput)`
1. Validate provider parameters using Zod schema
2. Create a task record in the database with status PENDING
3. Call the Kie.ai API to create the external task
4. Store the `externalTaskId` from Kie.ai response
5. Return the created task

### `uploadGenerationFile(formData: FormData)`
1. Extract file from FormData
2. Call Kie.ai file upload API
3. Return upload result with download URL and expiry date (3 days)

## Testing

All hooks are fully tested with 17 test cases covering:

- Loading states
- Success cases (image and video generation)
- Error handling (API errors, network errors)
- Query invalidation
- Refetch logic (polling for PENDING tasks)
- Callback support (onSuccess, onError)
- File upload scenarios

**Run tests:**
```bash
npm run test -- src/hooks/use-generation-tasks.test.ts
```

## Type Safety

All hooks use TypeScript discriminated unions for provider parameters, ensuring type-safe generation task creation:

```typescript
type ProviderParams =
  | KieImagen4Params
  | KieVeo3Params
  | KieMidjourneyParams
  | KieSora2Params;
```

## Next Steps

1. Implement server actions in `/src/actions/generation.ts` (backend-implementor agent)
2. Create API route `/api/generation/tasks` (backend-implementor agent)
3. Integrate hooks into UI components (ui-implementor agent)
4. Create Storybook stories for components using these hooks (ui-implementor agent)

## Related Documentation

- [Generation Task Architecture](../kie/generation-task-architecture.md)
- [Kie.ai API Documentation](../kie/)
- [React Query Configuration](../../src/lib/query-client.ts)

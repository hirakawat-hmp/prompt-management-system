# Generation Components

UI components for managing AI generation tasks with file uploads and status tracking.

## Components

### GenerationTaskStatus

Visual status indicator for generation tasks.

**Features:**
- Color-coded badges (PENDING, SUCCESS, FAILED)
- Animated spinner for pending tasks
- Icons: checkmark (success), X (failed)
- Error message display for failed tasks
- Accessible with proper ARIA attributes

**Usage:**
```tsx
import { GenerationTaskStatus } from '@/components/generation';

<GenerationTaskStatus task={generationTask} />
```

**Props:**
```typescript
interface GenerationTaskStatusProps {
  task: GenerationTask;
  className?: string;
}
```

**Stories:** See `GenerationTaskStatus.stories.tsx` for visual examples

---

### ImageUploader

File upload component with drag & drop support.

**Features:**
- Drag & drop file upload
- File size validation (configurable limit)
- File type validation (MIME type patterns)
- Image preview after selection
- Upload progress indicator
- 3-day expiry warning (Kie.ai temporary storage)
- Keyboard accessible

**Usage:**
```tsx
import { ImageUploader } from '@/components/generation';
import type { UploadResult } from '@/types/generation';

function MyComponent() {
  const handleUploadComplete = (result: UploadResult) => {
    console.log('File uploaded:', result.downloadUrl);
    // Use result.downloadUrl in generation task
  };

  return (
    <ImageUploader
      onUploadComplete={handleUploadComplete}
      maxSizeMB={100}
      accept="image/*"
    />
  );
}
```

**Props:**
```typescript
interface ImageUploaderProps {
  onUploadComplete: (result: UploadResult) => void;
  maxSizeMB?: number;        // Default: 100
  accept?: string;           // Default: 'image/*'
  className?: string;
}

interface UploadResult {
  downloadUrl: string;       // URL to use in generation task
  fileName: string;
  fileSize: number;
  mimeType: string;
  expiresAt: Date;          // 3 days from upload
}
```

**Validation:**
- File size: Validates against `maxSizeMB` limit
- File type: Validates against `accept` MIME pattern
- Displays error messages for validation failures

**Stories:** See `ImageUploader.stories.tsx` for visual examples

---

### GenerationTaskList

Displays list of generation tasks for a prompt.

**Features:**
- Task list with status indicators
- Model and service badges
- Created date/time
- Result preview for successful tasks (thumbnail grid)
- Error messages for failed tasks
- Loading skeleton
- Empty state message
- Chronological sorting (newest first)

**Usage:**
```tsx
import { GenerationTaskList } from '@/components/generation';

<GenerationTaskList promptId="prompt_123" />
```

**Props:**
```typescript
interface GenerationTaskListProps {
  promptId: string;
  className?: string;
}
```

**Hook Integration:**
Uses `useGenerationTasks(promptId)` hook from `@/hooks/use-generation-tasks`:
```typescript
interface UseGenerationTasksResult {
  data?: GenerationTask[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
}
```

**States:**
- **Loading:** Shows 3 skeleton cards
- **Empty:** Displays "No generation tasks yet" message
- **Error:** Shows error alert with message
- **Success:** Renders task cards with results

**Stories:** See `GenerationTaskList.stories.tsx` for visual examples

---

## Type Definitions

All components use types from `@/types/generation`:

```typescript
import type { GenerationTask } from '@prisma/client';
import type { UploadResult } from '@/types/generation';
```

**GenerationTask** (Prisma model):
```typescript
{
  id: string;
  promptId: string;
  service: 'KIE' | 'GOOGLE' | 'AZURE' | 'OPENAI';
  model: 'IMAGEN4' | 'VEO3' | 'MIDJOURNEY' | 'SORA2' | ...;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  externalTaskId: string | null;
  providerParams: Json;
  resultJson: string | null;
  failCode: string | null;
  failMsg: string | null;
  createdAt: Date;
  completedAt: Date | null;
}
```

---

## Integration Example

Complete workflow for image-to-video generation:

```tsx
import { useState } from 'react';
import { ImageUploader, GenerationTaskList } from '@/components/generation';
import type { UploadResult } from '@/types/generation';

function ImageToVideoWorkflow({ promptId }: { promptId: string }) {
  const [uploadedImage, setUploadedImage] = useState<UploadResult | null>(null);

  const handleUploadComplete = (result: UploadResult) => {
    setUploadedImage(result);
    // Create generation task with uploaded image URL
    createGenerationTask({
      promptId,
      providerParams: {
        service: 'KIE',
        model: 'VEO3',
        prompt: 'Convert this image to video',
        imageUrls: [result.downloadUrl],
        // ...other params
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Upload Reference Image</h3>
        <ImageUploader
          onUploadComplete={handleUploadComplete}
          maxSizeMB={10}
          accept="image/*"
        />
        {uploadedImage && (
          <p className="mt-2 text-sm text-muted-foreground">
            Uploaded: {uploadedImage.fileName}
            <br />
            Expires: {uploadedImage.expiresAt.toLocaleDateString()}
          </p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold">Generation Tasks</h3>
        <GenerationTaskList promptId={promptId} />
      </div>
    </div>
  );
}
```

---

## Testing

All components have comprehensive test coverage:

```bash
# Run all generation component tests
npm test -- src/components/generation

# Run specific component tests
npm test -- src/components/generation/GenerationTaskStatus.test.tsx
npm test -- src/components/generation/ImageUploader.test.tsx
npm test -- src/components/generation/GenerationTaskList.test.tsx
```

**Test Coverage:**
- ✅ Rendering (all states and variants)
- ✅ User interactions (file upload, drag & drop, button clicks)
- ✅ Validation (file size, file type)
- ✅ Error handling
- ✅ Accessibility (ARIA labels, keyboard navigation)
- ✅ Loading/empty/error states

---

## Storybook

View all component variants and states:

```bash
npm run storybook
```

Navigate to:
- **Generation/GenerationTaskStatus** - All status variants
- **Generation/ImageUploader** - Upload interactions
- **Generation/GenerationTaskList** - List states

---

## Styling

Components use:
- **Tailwind CSS v4** utility classes
- **shadcn/ui** components (Button, Badge, Card)
- **Lucide React** icons
- **CSS variables** for theming

**Responsive Design:**
- Mobile-first approach
- Grid layouts adapt to screen size
- Accessible on all devices

---

## Accessibility

All components follow WCAG guidelines:

- ✅ Semantic HTML elements
- ✅ Proper ARIA roles and labels
- ✅ Keyboard navigation support
- ✅ Focus management
- ✅ Screen reader friendly
- ✅ Color contrast compliance

---

## API Integration

Components integrate with:

1. **Server Actions** (Next.js):
   - `uploadGenerationFile(formData)` - File upload
   - `createGenerationTask(params)` - Task creation
   - `queryGenerationTask(taskId)` - Task status

2. **React Query Hooks**:
   - `useGenerationTasks(promptId)` - Fetch task list
   - `useUploadFile()` - File upload with progress

3. **Kie.ai API**:
   - File Upload API: `POST /api/file-stream-upload`
   - Generation APIs: Imagen4, Veo3, Midjourney, Sora2

See `/docs/kie/` for detailed API documentation.

---

## Future Enhancements

- [ ] Multiple file upload support
- [ ] Upload progress with real-time updates
- [ ] Result download functionality
- [ ] Task filtering and sorting
- [ ] Task retry mechanism
- [ ] Batch task creation
- [ ] Video preview player
- [ ] Result comparison view

---

## Related Documentation

- [Generation Task Architecture](/docs/development/generation-task-model.md)
- [Kie.ai API Documentation](/docs/kie/)
- [Storybook Setup](/docs/development/storybook.md)
- [shadcn/ui Integration](/docs/development/shadcn-storybook.md)

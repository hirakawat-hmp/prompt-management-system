# Generation Task Architecture

## Overview

画像・動画生成タスクを統合的に管理するアーキテクチャ設計。
複数のAIサービス（Kie.ai、Google AI、Azure OpenAI、OpenAI）を統一的に扱えるよう拡張可能に設計。

**MVP Scope**: Kie.ai の4モデル（Imagen4, Veo3, Midjourney, Sora2）の実装に集中。

## Key Design Decisions

### 1. Service + Model の2階層構造

異なるサービス経由で同じモデルを使える可能性を考慮し、`service`と`model`を分離。

```prisma
model GenerationTask {
  service       GenerationService   // KIE, GOOGLE, AZURE, OPENAI
  model         GenerationModel     // IMAGEN4, VEO3, MIDJOURNEY, SORA2, etc.
  providerParams Json               // Service+Model固有のパラメータ
  externalTaskId String?            // 外部サービスのtaskId（同期APIの場合null）
  status        TaskStatus          // PENDING, SUCCESS, FAILED
}
```

**Rationale**:
- Kie.ai経由のImagen4 vs Google AI直接のImagen4 を区別可能
- 将来的なサービス追加が容易

### 2. Service+Model 互換性検証

不正な組み合わせ（例: AZURE + IMAGEN4）を防ぐため、互換性マトリックスを定義。

```typescript
export type ServiceModelCombination =
  | { service: 'KIE'; model: 'IMAGEN4' }
  | { service: 'KIE'; model: 'VEO3' }
  | { service: 'GOOGLE'; model: 'IMAGEN4' }
  // ...

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

ZodスキーマでランタイムバリデーションによりAPI呼び出し前に不正な組み合わせを検出。

### 3. Discriminated Union型 + JSON保存

TypeScript側では型安全性を保ち、Prismaでは柔軟なJSON型として保存。

```typescript
// TypeScript: Service+Model別の型定義
export type ProviderParams =
  | KieImagen4Params
  | KieVeo3Params
  | KieMidjourneyParams
  | KieSora2Params
  | GoogleImagen4Params  // Future
  | AzureDallE3Params;   // Future

// 各サービス+モデルごとの詳細な型
export interface KieVeo3Params {
  service: 'KIE';
  model: 'VEO3';
  prompt: string;
  modelVariant: 'veo3' | 'veo3_fast';
  generationType?: 'TEXT_2_VIDEO' | 'FIRST_AND_LAST_FRAMES_2_VIDEO' | 'REFERENCE_2_VIDEO';
  imageUrls?: string[];  // 0-3 images
  aspectRatio?: '16:9' | '9:16' | 'Auto';
  seeds?: number;
  // ...
}

// Prismaには完全なリクエストパラメータをJSON保存
providerParams: Json  // リトライ・監査用
```

**Benefits**:
- 新しいプロバイダー/パラメータ追加が容易
- リクエスト全体を保存してリトライが確実
- ZodでService+Modelごとにバリデーション

## Directory Structure

**原則**: Service-First Organization

同じモデルでもサービスごとにリクエストロジックが異なるため、サービス単位で分離。

```
src/
├── lib/
│   └── generation/
│       ├── index.ts                    # Public API exports
│       ├── types.ts                    # Shared types
│       ├── compatibility.ts            # Service+Model validation matrix
│       ├── upload.ts                   # ★ NEW: Kie.ai file upload utility
│       │
│       ├── services/                   # Service-specific implementations
│       │   ├── kie/                    # ★ MVP: Kie.ai implementation
│       │   │   ├── index.ts            # Service entry point
│       │   │   ├── client.ts           # HTTP client (auth, base URL)
│       │   │   ├── polling.ts          # Polling strategy
│       │   │   ├── types.ts            # Kie-specific types
│       │   │   ├── models/
│       │   │   │   ├── imagen4.ts      # KieImagen4: types, schema, API calls
│       │   │   │   ├── veo3.ts         # KieVeo3: types, schema, API calls
│       │   │   │   ├── midjourney.ts   # KieMidjourney: types, schema, API calls
│       │   │   │   └── sora2.ts        # KieSora2: types, schema, API calls
│       │   │   └── __tests__/
│       │   │       ├── imagen4.test.ts
│       │   │       └── veo3.test.ts
│       │   │
│       │   ├── google/                 # Future: Google AI service
│       │   ├── azure/                  # Future: Azure OpenAI
│       │   └── openai/                 # Future: OpenAI API
│       │
│       └── factory.ts                  # Service factory (routing)
│
├── actions/
│   └── generation/
│       ├── create-task.ts              # Server Action
│       ├── query-task.ts               # Server Action
│       ├── retry-task.ts               # Server Action
│       └── upload-file.ts              # ★ NEW: Server Action for file upload
│
├── components/
│   └── generation/
│       └── ImageUploader.tsx           # ★ NEW: File upload component
│
└── types/
    └── generation.ts                   # Union types (ProviderParams, etc.)
```

### Model File Structure

各モデルファイル（例: `kie/models/veo3.ts`）には以下を含む：

```typescript
// 1. TypeScript types
export interface KieVeo3Params { /* ... */ }

// 2. Zod schema
export const KieVeo3Schema = z.object({ /* ... */ });

// 3. API request function
export async function createKieVeo3Task(params: KieVeo3Params) { /* ... */ }

// 4. API query function
export async function queryKieVeo3Task(taskId: string) { /* ... */ }

// 5. Result transformer
export function transformKieVeo3Result(resultJson: string): string[] { /* ... */ }
```

**Benefits**:
- 同じService+Modelの関連コードが1ファイルにまとまる
- 各サービスが独立（認証、エンドポイント、レスポンス形式が異なる）
- テスト構造も同じ

### Factory Pattern

2段階ルーティング: Service → Model

```typescript
// factory.ts
export async function createTask(params: ProviderParams) {
  switch (params.service) {
    case 'KIE':
      return kie.createTask(params);  // → kie/index.ts
    case 'GOOGLE':
      return google.createTask(params);
    // ...
  }
}

// kie/index.ts
export async function createTask(params: ProviderParams) {
  if (params.service !== 'KIE') throw new Error('Invalid service');
  
  switch (params.model) {
    case 'IMAGEN4':
      return imagen4.createKieImagen4Task(params);
    case 'VEO3':
      return veo3.createKieVeo3Task(params);
    // ...
  }
}
```

## Kie.ai File Upload API

### ⚠️ Critical Constraints

**Temporary Storage**: アップロードされたファイルは**3日後に自動削除**される。

```json
{
  "data": {
    "downloadUrl": "https://tempfile.redpandaai.co/xxx/images/my-image.jpg",
    "uploadedAt": "2025-01-01T12:00:00.000Z",
    "expiresAt": "2025-01-04T12:00:00.000Z"  // 3日後
  }
}
```

### 3つのアップロード方法

| Method | Endpoint | Use Case | Limitation |
|--------|----------|----------|------------|
| **URL Upload** | `POST https://kieai.redpandaai.co/api/file-url-upload` | 既存の画像URLから取得 | ≤100MB, 30秒timeout |
| **File Stream** | `POST https://kieai.redpandaai.co/api/file-stream-upload` | ローカルファイル直接アップロード | 大容量OK（推奨） |
| **Base64** | `POST https://kieai.redpandaai.co/api/file-base64-upload` | Base64エンコード済みデータ | ≤10MB推奨（33%増） |

**Authentication**: 別のベースURL（`https://kieai.redpandaai.co`）だが、同じAPI Keyを使用。

### Image-to-Video使用フロー（Midjourney/Veo3）

```typescript
// Step 1: ユーザーがローカル画像をアップロード
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('uploadPath', 'user-uploads');

const uploadResponse = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${KIE_API_KEY}` },
  body: formData,
});

const { downloadUrl, expiresAt } = uploadResponse.data;
// → downloadUrl: "https://tempfile.redpandaai.co/xxx/user-uploads/abc123.jpg"
// → expiresAt: "2025-01-04T12:00:00.000Z"

// Step 2: 生成タスク作成時にfileUrlsパラメータで参照
await createGenerationTask({
  promptId: 'prompt_123',
  providerParams: {
    service: 'KIE',
    model: 'MIDJOURNEY',
    taskType: 'mj_img2img',
    prompt: 'Transform this into anime style',
    fileUrls: [downloadUrl],  // アップロードしたファイルのURL
  },
});
```

### Implementation Guidelines

1. **File Upload Utility** (`lib/generation/upload.ts`):
   ```typescript
   export async function uploadFileToKie(
     file: File,
     uploadPath: string = 'user-uploads'
   ): Promise<UploadResult> {
     const formData = new FormData();
     formData.append('file', file);
     formData.append('uploadPath', uploadPath);
     
     const response = await fetch('https://kieai.redpandaai.co/api/file-stream-upload', {
       method: 'POST',
       headers: { 'Authorization': `Bearer ${process.env.KIE_API_KEY}` },
       body: formData,
     });
     
     if (!response.ok) throw new Error('Upload failed');
     
     const result = await response.json();
     return {
       downloadUrl: result.data.downloadUrl,
       fileName: result.data.fileName,
       fileSize: result.data.fileSize,
       expiresAt: result.data.uploadedAt + 3 days,  // Calculate expiry
     };
   }
   ```

2. **UI Component** (`components/generation/ImageUploader.tsx`):
   - ドラッグ&ドロップサポート
   - プレビュー表示
   - アップロード進捗表示
   - 3日期限の警告表示

3. **Server Action** (`actions/generation/upload-file.ts`):
   ```typescript
   'use server';
   
   export async function uploadGenerationFile(
     formData: FormData
   ): Promise<ActionResult<UploadResult>> {
     const file = formData.get('file') as File;
     
     try {
       const result = await uploadFileToKie(file);
       return { success: true, data: result };
     } catch (error) {
       return { success: false, error: error.message };
     }
   }
   ```

4. **Expiry Management**:
   - アップロードしたファイルURLを`providerParams.fileUrls`に保存
   - `expiresAt`を記録（UI警告用）
   - 3日以内に生成タスク実行を推奨

### Use Cases by Model

| Model | Upload Required? | Parameter | Notes |
|-------|-----------------|-----------|-------|
| **Imagen4** | No | - | Text-to-image only |
| **Veo3** | Optional | `imageUrls` (0-3) | Image-to-video modes |
| **Midjourney** | Optional | `fileUrls` | img2img, style_reference, omni_reference, video |
| **Sora2** | No | - | Text-to-video only |

## Database Schema

```prisma
model GenerationTask {
  id            String   @id @default(cuid())
  promptId      String
  prompt        Prompt   @relation(fields: [promptId], references: [id], onDelete: Cascade)

  // Service + Model
  service       GenerationService
  model         GenerationModel
  externalTaskId String?

  // Status
  status        TaskStatus          // PENDING, SUCCESS, FAILED

  // Service+Model-specific params (JSON)
  // ★ fileUrls stored here for img2img workflows
  providerParams Json

  // Response
  resultJson    String?
  failCode      String?
  failMsg       String?

  // Assets
  assets        Asset[]

  // Timestamps
  createdAt     DateTime @default(now())
  completedAt   DateTime?

  @@index([promptId])
  @@index([service, model])
  @@index([externalTaskId])
  @@index([status])
}

enum GenerationService {
  KIE       // Kie.ai service (MVP)
  GOOGLE    // Google AI Platform (Future)
  AZURE     // Azure OpenAI Service (Future)
  OPENAI    // OpenAI API (Future)
}

enum GenerationModel {
  // Image Generation Models
  IMAGEN4      // MVP: Kie.ai
  MIDJOURNEY   // MVP: Kie.ai
  DALL_E_3     // Future

  // Video Generation Models
  VEO3         // MVP: Kie.ai
  SORA2        // MVP: Kie.ai

  // Multimodal Models
  GEMINI_2_0   // Future
  GPT_4O       // Future
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
  project         Project  @relation(...)

  type            PromptType
  content         String

  // Graph relationships
  parentId        String?
  parent          Prompt?  @relation("PromptTree", ...)
  children        Prompt[] @relation("PromptTree")

  // User Feedback
  feedbackScore   Int?
  feedbackComment String?
  aiComment       String?

  // Generation Tasks (1-to-many)
  generationTasks GenerationTask[]  // Track all generation attempts

  // Generated Assets
  assets          Asset[]

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Asset Model (No Changes)

```prisma
model Asset {
  id              String   @id @default(cuid())
  promptId        String
  prompt          Prompt   @relation(...)

  generationTaskId String?
  generationTask   GenerationTask? @relation(...)

  type            AssetType         // IMAGE, VIDEO
  url             String
  thumbnailUrl    String?
  metadata        Json?

  createdAt       DateTime @default(now())
}
```

**Design Note**: Assetには状態を持たせない（生成結果のみ）。状態はGenerationTaskで管理。

## API Analysis Summary

全4つのKie.ai APIは**非同期タスクベース**（ポーリング必須）:

| Model | Create Endpoint | Query Endpoint | Status Field | Result Field |
|-------|----------------|----------------|--------------|--------------| | **Imagen4** | `POST /api/v1/jobs/createTask` | `GET /api/v1/jobs/recordInfo` | `state` (string) | `resultJson.resultUrls` |
| **Veo3** | `POST /api/v1/veo/generate` | `GET /api/v1/veo/record-info` | `successFlag` (int) | `response.resultUrls` |
| **Midjourney** | `POST /api/v1/mj/generate` | `GET /api/v1/mj/record-info` | `successFlag` (int) | `response.resultUrls` |
| **Sora2** | `POST /api/v1/jobs/createTask` | `GET /api/v1/jobs/recordInfo` | `state` (string) | `resultJson.resultUrls` |

### Status Normalization

異なるステータス形式を統一:

**String-based (Imagen4, Sora2)**:
- `"waiting"` → PENDING
- `"success"` → SUCCESS
- `"fail"` → FAILED

**Integer-based (Veo3, Midjourney)**:
- `0` → PENDING
- `1` → SUCCESS
- `2` or `3` → FAILED

## Implementation Notes

### MVP Priority (Kie.ai only)

**Phase 1**: Kie.ai基盤実装
1. ディレクトリ構成: `lib/generation/services/kie/`
2. 共通クライアント: `kie/client.ts`
3. ポーリング戦略: `kie/polling.ts`
4. ★ ファイルアップロード: `lib/generation/upload.ts`

**Phase 2**: Kie.ai 4モデル実装（並列可能）
1. `kie/models/imagen4.ts`
2. `kie/models/veo3.ts`
3. `kie/models/midjourney.ts`
4. `kie/models/sora2.ts`

**Phase 3**: Server Actions + React Query Hooks
1. `actions/generation/create-task.ts`
2. `actions/generation/upload-file.ts` ★ NEW
3. `hooks/use-generation-tasks.ts`
4. UI統合（PromptGraphでステータス表示）
5. `components/generation/ImageUploader.tsx` ★ NEW

### Future Expansion (Post-MVP)

Google AI、Azure、OpenAIサービス追加時:

1. 新しいサービスディレクトリ作成: `services/google/`
2. サービス固有のクライアント: `google/client.ts`
3. モデル実装: `google/models/imagen4.ts`
4. Factory更新: `case 'GOOGLE': return google.createTask(params);`
5. 互換性マトリックス更新: `GOOGLE: ['IMAGEN4', 'VEO3', 'GEMINI_2_0']`

### Polling Strategy

```typescript
const POLLING_INTERVALS = {
  initial: 2000,      // 2秒
  standard: 5000,     // 5秒（3回試行後）
  max: 10000,         // 10秒（最大）
};

const MAX_POLLING_DURATION = 5 * 60 * 1000; // 5分タイムアウト
```

### Error Handling

| Code | Description | Handling |
|------|-------------|----------|
| 401 | Unauthorized | API key確認 |
| 402 | Insufficient credits | ユーザーに通知、課金ページへ |
| 422 | Validation error | フィールドエラー表示 |
| 429 | Rate limited | Exponential backoff |
| 500 | Server error | リトライ |
| TIMEOUT | Client timeout | 手動リトライ許可 |

## Related Documentation

- Full design doc: `/docs/development/generation-task-model.md`
- Kie.ai API docs: `/docs/kie/` (imagen, veo3, midjourney, sora2, upload)
- Prisma schema: `/prisma/schema.prisma`

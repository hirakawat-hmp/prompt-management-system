# Generation System Integration Guide

## 🎉 実装完了！

画像・動画生成システムが完全に実装されました。このドキュメントでは、システムの使い方と統合方法を説明します。

## 📦 実装済みコンポーネント

### Backend
- ✅ **Prisma Schema**: GenerationTask model + 3 enums
- ✅ **Type Definitions**: Discriminated unions with Zod validation
- ✅ **Kie.ai Client**: HTTP client with retry logic (40+ tests)
- ✅ **Polling Service**: Background polling with status normalization (45+ tests)
- ✅ **File Upload**: Temporary file storage (21 tests)
- ✅ **4 AI Models**: Imagen4, Veo3, Midjourney, Sora2 (96+ tests)
- ✅ **Server Actions**: create-task, query-task, upload-file
- ✅ **API Route**: `/api/generation/tasks`

### Frontend
- ✅ **React Query Hooks**: useGenerationTasks, useCreateGenerationTask, useUploadFile (17 tests)
- ✅ **UI Components**: GenerationTaskStatus, ImageUploader, GenerationTaskList (27 tests)
- ✅ **Storybook Stories**: 15+ stories for all components

## 🚀 クイックスタート

### 1. 環境変数の設定

`.env`ファイルにKIE_API_KEYが設定済みです：

```env
KIE_API_KEY=1eb55158bf842cec9a2514b82e0ae457
```

### 2. 基本的な使い方

#### 画像生成（Imagen4）

```typescript
import { useCreateGenerationTask } from '@/hooks/use-generation-tasks';

function MyComponent() {
  const createTask = useCreateGenerationTask();

  const handleGenerate = async () => {
    const result = await createTask.mutateAsync({
      promptId: 'prompt_123',
      providerParams: {
        service: 'KIE',
        model: 'IMAGEN4',
        apiModel: 'google/imagen4-fast',
        input: {
          prompt: 'A sunset over mountains',
          negative_prompt: 'blurry, low quality',
          aspect_ratio: '16:9',
          num_images: '4',
        },
      },
    });

    if (result.success) {
      console.log('Task created:', result.data.id);
    }
  };

  return <button onClick={handleGenerate}>Generate Image</button>;
}
```

#### 動画生成（Veo3）

```typescript
const result = await createTask.mutateAsync({
  promptId: 'prompt_456',
  providerParams: {
    service: 'KIE',
    model: 'VEO3',
    prompt: 'A dog playing in a park',
    modelVariant: 'veo3_fast',
    generationType: 'TEXT_2_VIDEO',
    aspectRatio: '16:9',
  },
});
```

#### Image-to-Video（Veo3 with upload）

```typescript
import { useUploadFile, useCreateGenerationTask } from '@/hooks/use-generation-tasks';

function ImageToVideo() {
  const uploadFile = useUploadFile();
  const createTask = useCreateGenerationTask();

  const handleConvert = async (file: File) => {
    // 1. Upload image
    const uploadResult = await uploadFile.mutateAsync(file);

    if (!uploadResult.success) {
      console.error('Upload failed:', uploadResult.error);
      return;
    }

    // 2. Create generation task
    const taskResult = await createTask.mutateAsync({
      promptId: 'prompt_789',
      providerParams: {
        service: 'KIE',
        model: 'VEO3',
        prompt: 'Transform this into a cinematic scene',
        modelVariant: 'veo3_fast',
        generationType: 'REFERENCE_2_VIDEO',
        imageUrls: [uploadResult.data.downloadUrl],
        aspectRatio: '16:9',
      },
    });

    console.log('Video generation started:', taskResult.data.id);
  };

  return <ImageUploader onUploadComplete={(result) => handleConvert(result)} />;
}
```

### 3. タスク状態の監視

```typescript
import { useGenerationTasks } from '@/hooks/use-generation-tasks';
import { GenerationTaskList } from '@/components/generation';

function TaskMonitor({ promptId }: { promptId: string }) {
  const { data: tasks, isLoading } = useGenerationTasks(promptId);

  if (isLoading) return <div>Loading...</div>;

  return <GenerationTaskList promptId={promptId} />;
}
```

## 🎨 UIコンポーネントの使い方

### GenerationTaskStatus

タスクのステータスを表示する小さなバッジコンポーネント：

```typescript
import { GenerationTaskStatus } from '@/components/generation';

<GenerationTaskStatus task={task} />
```

ステータスに応じて色が変わります：
- **PENDING**: オレンジ（アニメーション付き）
- **SUCCESS**: グリーン（チェックマーク）
- **FAILED**: レッド（エラーアイコン）

### ImageUploader

ファイルアップロード用のドラッグ&ドロップコンポーネント：

```typescript
import { ImageUploader } from '@/components/generation';

<ImageUploader
  onUploadComplete={(result) => {
    console.log('File uploaded:', result.downloadUrl);
    console.log('Expires at:', result.expiresAt); // 3 days
  }}
  maxSizeMB={10}
  accept="image/*,video/*"
/>
```

機能：
- ドラッグ&ドロップサポート
- ファイルサイズ・形式の検証
- アップロード進捗表示
- プレビュー表示
- 3日期限の警告

### GenerationTaskList

プロンプトに関連するすべてのタスクを表示：

```typescript
import { GenerationTaskList } from '@/components/generation';

<GenerationTaskList promptId="prompt_123" />
```

機能：
- ステータスインジケーター
- モデル/サービスバッジ
- 結果プレビュー（成功時）
- エラーメッセージ（失敗時）
- 自動リフレッシュ（3秒ごと、PENDING時のみ）

## 🔄 自動ポーリング

React Query hooksは自動的にポーリングを行います：

```typescript
const { data: tasks } = useGenerationTasks(promptId);
// ↑ PENDING状態のタスクがある場合、3秒ごとに自動リフレッシュ
// SUCCESS/FAILEDのみの場合は停止
```

ポーリング戦略（バックエンド）：
- **初回1-3回**: 2秒間隔
- **4-19回**: 5秒間隔
- **20回以降**: 10秒間隔（最大）
- **タイムアウト**: 5分

## 📊 サポートされるモデルとパラメータ

### Imagen4（画像生成）

```typescript
{
  service: 'KIE',
  model: 'IMAGEN4',
  apiModel: 'google/imagen4-fast',
  input: {
    prompt: string,                              // 必須、最大5000文字
    negative_prompt?: string,                    // 除外したい要素
    aspect_ratio?: '1:1' | '16:9' | '9:16' | '3:4' | '4:3',
    num_images?: '1' | '2' | '3' | '4',         // 生成枚数
    seed?: number,                               // 再現性のためのシード
  },
  callBackUrl?: string,                          // 完了通知URL
}
```

### Veo3（動画生成）

```typescript
{
  service: 'KIE',
  model: 'VEO3',
  prompt: string,                                // 必須、最大5000文字
  modelVariant: 'veo3' | 'veo3_fast',           // 品質 vs 速度
  generationType?: 'TEXT_2_VIDEO'                // テキストから
    | 'FIRST_AND_LAST_FRAMES_2_VIDEO'           // 最初と最後のフレーム指定
    | 'REFERENCE_2_VIDEO',                       // 参照画像から
  imageUrls?: string[],                          // 0-3枚（generationTypeに依存）
  aspectRatio?: '16:9' | '9:16' | 'Auto',
  seeds?: number,                                // 10000-99999
  watermark?: string,
  callBackUrl?: string,
  enableTranslation?: boolean,
}
```

### Midjourney（画像/動画生成）

```typescript
{
  service: 'KIE',
  model: 'MIDJOURNEY',
  taskType: 'mj_txt2img'                         // テキストから画像
    | 'mj_img2img'                                // 画像から画像
    | 'mj_style_reference'                        // スタイル参照
    | 'mj_omni_reference'                         // 全方位参照
    | 'mj_video'                                  // ビデオ生成
    | 'mj_video_hd',                              // HDビデオ
  prompt: string,                                // 最大2000文字
  speed?: 'relaxed' | 'fast' | 'turbo',         // 生成速度
  fileUrls?: string[],                           // 参照画像
  aspectRatio?: '1:2' | '9:16' | '2:3' | '3:4' | '5:6'
    | '6:5' | '4:3' | '3:2' | '1:1' | '16:9' | '2:1',
  version?: '7' | '6.1' | '6' | '5.2' | '5.1' | 'niji6',
  variety?: number,                              // 0-100（5刻み）
  stylization?: number,                          // 0-1000（50刻み）
  weirdness?: number,                            // 0-3000（100刻み）
  ow?: number,                                   // 1-1000（omni_reference用）
  waterMark?: string,
  enableTranslation?: boolean,
  callBackUrl?: string,
  videoBatchSize?: 1 | 2 | 4,                   // ビデオ生成用
  motion?: 'high' | 'low',                       // ビデオモーション
}
```

### Sora2（動画生成）

```typescript
{
  service: 'KIE',
  model: 'SORA2',
  apiModel: 'sora-2-text-to-video',
  input: {
    prompt: string,                              // 必須、最大5000文字
    aspect_ratio?: 'portrait' | 'landscape',
    n_frames?: '10' | '15',                      // 10秒 or 15秒
    remove_watermark?: boolean,
  },
  callBackUrl?: string,
}
```

## ⚠️ 重要な制約事項

### 1. ファイルの有効期限（3日）

Kie.aiにアップロードしたファイルは**3日後に自動削除**されます：

```typescript
const uploadResult = await uploadFile.mutateAsync(file);
console.log('Expires at:', uploadResult.data.expiresAt);
// → 2025-01-07T12:00:00.000Z（3日後）
```

**対策**:
- アップロード後、速やかに生成タスクを実行
- UIで期限警告を表示（ImageUploaderに実装済み）
- 必要に応じて再アップロード機能を追加

### 2. API制限

- **Rate Limiting**: 429エラー時は自動リトライ（指数バックオフ）
- **Credit Exhaustion**: 402エラー時はユーザーに通知
- **Validation**: Zodスキーマで事前検証

### 3. タスクタイムアウト

- バックグラウンドポーリングは**5分でタイムアウト**
- タイムアウト時は`status: FAILED, failCode: TIMEOUT`

## 🧪 テスト

### 単体テスト

```bash
# すべてのテストを実行
npm test

# 特定のモジュールのみ
npm test src/lib/generation
npm test src/actions/generation
npm test src/hooks/use-generation-tasks
npm test src/components/generation
```

### Storybook

```bash
# Storybookを起動（すべてのコンポーネントを確認）
npm run storybook
```

ストーリー例：
- `GenerationTaskStatus` - PENDING/SUCCESS/FAILED states
- `ImageUploader` - Default/WithPreview/WithError
- `GenerationTaskList` - Loading/WithTasks/Empty

## 📂 ファイル構成

```
src/
├── types/
│   ├── generation-compatibility.ts    # Service+Model検証
│   └── generation.ts                  # 型定義 + Zod
│
├── lib/generation/
│   ├── services/kie/
│   │   ├── client.ts                  # HTTP client
│   │   ├── polling.ts                 # Polling service
│   │   └── models/
│   │       ├── imagen4.ts             # Imagen4 model
│   │       ├── veo3.ts                # Veo3 model
│   │       ├── midjourney.ts          # Midjourney model
│   │       └── sora2.ts               # Sora2 model
│   └── upload.ts                      # File upload
│
├── actions/generation/
│   ├── create-task.ts                 # Server Action
│   ├── query-task.ts                  # Server Action
│   └── upload-file.ts                 # Server Action
│
├── app/api/generation/tasks/
│   └── route.ts                       # GET /api/generation/tasks
│
├── hooks/
│   └── use-generation-tasks.ts        # React Query hooks
│
└── components/generation/
    ├── GenerationTaskStatus.tsx       # Status badge
    ├── ImageUploader.tsx              # File uploader
    └── GenerationTaskList.tsx         # Task list
```

## 🎯 PromptGraphへの統合（次ステップ）

PromptGraphに生成機能を統合する方法：

### 1. PromptNodeに生成ボタンを追加

```typescript
// src/components/prompt-graph/PromptNode.tsx

import { useCreateGenerationTask } from '@/hooks/use-generation-tasks';
import { Button } from '@/components/ui/button';

export function PromptNode({ data }: NodeProps<PromptNodeData>) {
  const createTask = useCreateGenerationTask();

  const handleGenerate = async () => {
    const result = await createTask.mutateAsync({
      promptId: data.prompt.id,
      providerParams: {
        service: 'KIE',
        model: data.prompt.type === 'IMAGE' ? 'IMAGEN4' : 'VEO3',
        // ... パラメータ設定
      },
    });
  };

  return (
    <div className="prompt-node">
      <div>{data.prompt.content}</div>
      <Button onClick={handleGenerate}>Generate</Button>
    </div>
  );
}
```

### 2. ステータスインジケーターを追加

```typescript
import { useGenerationTasks } from '@/hooks/use-generation-tasks';
import { GenerationTaskStatus } from '@/components/generation';

export function PromptNode({ data }: NodeProps<PromptNodeData>) {
  const { data: tasks } = useGenerationTasks(data.prompt.id);
  const latestTask = tasks?.[0]; // 最新タスク

  return (
    <div className="prompt-node">
      {latestTask && <GenerationTaskStatus task={latestTask} />}
      <div>{data.prompt.content}</div>
    </div>
  );
}
```

### 3. タスクリストモーダルを追加

```typescript
import { GenerationTaskList } from '@/components/generation';
import { Dialog } from '@/components/ui/dialog';

export function PromptNode({ data }: NodeProps<PromptNodeData>) {
  const [showTasks, setShowTasks] = useState(false);

  return (
    <>
      <div className="prompt-node">
        <Button onClick={() => setShowTasks(true)}>View Tasks</Button>
      </div>

      <Dialog open={showTasks} onOpenChange={setShowTasks}>
        <GenerationTaskList promptId={data.prompt.id} />
      </Dialog>
    </>
  );
}
```

## 🔧 トラブルシューティング

### Q: タスクが PENDING のまま進まない

**A**: 以下を確認：
1. `KIE_API_KEY`が正しく設定されているか（`.env`）
2. バックグラウンドポーリングが動作しているか（ログ確認）
3. Kie.ai APIが正常か（ステータスページ確認）
4. 5分タイムアウトに達していないか

### Q: ファイルアップロードが失敗する

**A**: 以下を確認：
1. ファイルサイズが制限内か（推奨≤10MB）
2. MIME typeがサポートされているか
3. `KIE_API_KEY`が有効か
4. ネットワーク接続が安定しているか

### Q: 型エラーが出る

**A**: Zodスキーマで検証：
```typescript
import { ProviderParamsSchema } from '@/types/generation';

const result = ProviderParamsSchema.safeParse(params);
if (!result.success) {
  console.error('Validation failed:', result.error);
}
```

## 📚 参考資料

- [Kie.ai API Documentation](/docs/kie/)
- [Generation Task Model Design](/docs/development/generation-task-model.md)
- [Serena Memory: generation-task-architecture](/docs/development/generation-task-model.md)
- [React Query Documentation](https://tanstack.com/query/latest)
- [shadcn/ui Components](https://ui.shadcn.com/)

---

**実装完了！** 🎊 これで画像・動画生成システムが完全に動作します。

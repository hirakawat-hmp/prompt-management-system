# Claude Code 実装方針

このプロジェクトでは、Claude Codeのカスタムsubagentを活用した**TDD（Test-Driven Development）による高速並列開発**を実践します。

## 📋 プロジェクト概要

### プロジェクトの目的
**AI画像・動画生成用のプロンプト管理システム**

ユーザーがAI生成モデル（Midjourney, Imagen, Veo等）用のプロンプトを階層的に管理し、生成タスクを実行・追跡できるWebアプリケーション。

### 主要機能
1. **プロジェクト管理**: 複数のプロンプトプロジェクトを管理
2. **プロンプト作成**: 画像/動画生成用のプロンプトをAI支援で作成
3. **階層構造**: プロンプトの親子関係を持った階層的管理
4. **グラフ可視化**: プロンプト間の関係を視覚的に表示
5. **AI生成実行**: Kie.ai API経由で複数のAIモデルを使用
6. **生成履歴管理**: 各プロンプトの生成タスク履歴を追跡
7. **アセット管理**: 生成された画像/動画を紐付けて管理

### ユースケース
- プロンプトエンジニアがプロンプトのバリエーションを体系的に管理
- チームでプロンプトのテンプレートを共有・再利用
- 生成結果と元プロンプトの紐付けを保持
- プロンプトの改善履歴を追跡

## 🎯 開発戦略

### 2フェーズ並列開発

1. **探索フェーズ** - 既存コードと外部情報の並列調査
2. **TDD開発フェーズ** - 計画→並列実装

## 🤖 利用可能なAgent

### Phase 1: 探索
- **serena-explore** (Sonnet) - 内部コードベース分析（Serena MCP使用）
- **research** (Haiku) - 外部ドキュメント調査（Context7 + WebFetch）

### Phase 2: TDD開発
- **tdd-planner** (Sonnet) - TDD実装計画立案（Red-Green-Refactor設計）
- **ui-implementor** (Sonnet) - フロントエンド実装（テストファースト）
- **backend-implementor** (Sonnet) - バックエンド実装（テストファースト）

## 📚 技術スタック

### Frontend
- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript 5
- **Styling**: Tailwind CSS v4
- **Components**: shadcn/ui (New York style, Neutral colors)
- **State Management**: React Query (@tanstack/react-query v5)
- **Form Management**: React Hook Form v7 + Zod v4
- **Graph Visualization**: React Flow (@xyflow/react) + ELKjs
- **Layout**: React Resizable Panels v3
- **Stories**: Storybook v10
- **Testing**: Vitest v4 + Playwright + Testing Library

### Backend
- **Framework**: Next.js 16 API Routes + Server Actions
- **AI**: Mastra v0.23.3 + Google Gemini 2.5 Pro
- **Database**: Prisma v6 + SQLite (LibSQL)
- **Validation**: Zod v4
- **Testing**: Vitest v4

### Generation Services
- **Kie.ai**: Image & Video generation (Midjourney, Imagen4, Veo3)
- **Provider Abstraction**: Unified generation service layer

## 🔄 開発ワークフロー

### 例: 新機能実装

```typescript
// 1. 探索フェーズ（並列）
Task('serena-explore', '既存の類似機能パターンを分析')
Task('research', '最新のベストプラクティス調査（Context7使用）')

// 2. TDD計画
Task('tdd-planner', `
機能名のTDD実装計画:
- バックエンド: Mastra agent + API routes
- フロントエンド: shadcn/ui + Storybook
- テスト戦略（Vitest）
- 並列実装可能性の判断
`)

// 3. 並列TDD実装（独立している場合）
Task('backend-implementor', `
APIのTDD実装:
1. [RED] Vitest統合テスト作成
2. [GREEN] Mastra agent実装
3. [GREEN] Next.js API routes実装
4. [REFACTOR] エラーハンドリング
`)

Task('ui-implementor', `
UIコンポーネントのTDD実装:
1. [RED] Vitestコンポーネントテスト作成
2. [GREEN] shadcn/ui使用して実装
3. [GREEN] Storybookストーリー作成
4. [REFACTOR] アクセシビリティ向上
`)

// 4. 統合確認（メインClaude）
// E2Eテスト、全体リファクタリング
```

## 📋 TDDプラクティス

### Red-Green-Refactor サイクル

**Backend:**
1. **RED**: Vitest統合テスト作成 → 失敗確認
2. **GREEN**: Mastra agent/API実装 → テストパス
3. **REFACTOR**: エラーハンドリング、パフォーマンス改善

**Frontend:**
1. **RED**: Vitestコンポーネントテスト作成 → 失敗確認
2. **GREEN**: shadcn/uiコンポーネント実装 → テストパス
3. **REFACTOR**: UX改善、アクセシビリティ向上

## 🗂️ ファイル構成

```
src/
├── actions/                   # Next.js Server Actions
│   └── generation/           # Generation-related actions
├── app/
│   ├── api/                   # Next.js API routes
│   │   ├── prompts/          # Prompt CRUD endpoints
│   │   ├── projects/         # Project CRUD endpoints
│   │   └── generation/       # Generation task endpoints
│   │       └── tasks/        # Task status polling
│   ├── page.tsx              # Main application page
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── ui/                    # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── button.stories.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── dialog.tsx        # Modal dialogs
│   │   ├── popover.tsx       # Popover menus
│   │   ├── tabs.tsx          # Tab navigation
│   │   ├── slider.tsx        # Range slider
│   │   └── ...               # 他の shadcn/ui components
│   ├── layout/               # Layout components
│   │   └── ThreeColumnLayout.tsx  # 3-column resizable layout
│   ├── prompts/              # Prompt-related components
│   │   └── PromptDetail.tsx
│   ├── projects/             # Project-related components
│   │   └── ProjectList.tsx
│   ├── graph/                # Graph visualization
│   │   ├── PromptGraph.tsx
│   │   ├── PromptNode.tsx
│   │   ├── PromptEdge.tsx
│   │   └── utils/
│   │       └── elkLayoutGraph.ts  # ELKjs layout algorithm
│   ├── generation/           # Generation UI components
│   │   └── modals/
│   │       └── CreatePromptModal.tsx
│   └── providers/            # React Context providers
│       └── QueryProvider.tsx # React Query provider
├── hooks/                    # Custom React hooks
│   ├── usePrompts.ts         # Prompt data fetching
│   ├── useProjects.ts        # Project data fetching
│   └── useGeneration.ts      # Generation task hooks
├── lib/
│   ├── utils.ts              # CN utility, etc.
│   └── generation/           # Generation service layer
│       └── services/
│           └── kie/          # Kie.ai integration
│               ├── client.ts
│               ├── types.ts
│               └── models/   # Model-specific implementations
│                   ├── midjourney.ts
│                   ├── imagen.ts
│                   └── veo.ts
├── mastra/                   # Mastra AI framework
│   ├── agents/               # AI agent definitions
│   ├── workflows/            # Workflow orchestrations
│   ├── tools/                # Tool implementations
│   └── index.ts              # Mastra instance setup
├── types/                    # TypeScript type definitions
│   ├── index.ts
│   ├── prompt.ts
│   ├── project.ts
│   ├── graph.ts
│   └── asset.ts
├── test-utils/               # Testing utilities
│   └── setup.ts
└── stories/                  # Storybook example stories

prisma/
├── schema.prisma             # Database schema definition
├── migrations/               # Database migrations
├── seed.ts                   # Database seeding script
└── dev.db                    # SQLite database file

docs/
├── development/              # 開発ドキュメント
│   ├── storybook.md
│   └── shadcn-storybook.md
└── kie/                      # Kie.ai API documentation
    ├── common/
    ├── imagen/
    ├── midjourney/
    └── upload/

.claude/
└── agents/                   # カスタムsubagent定義
    ├── serena-explore.md
    ├── research.md
    ├── tdd-planner.md
    ├── ui-implementor.md
    ├── backend-implementor.md
    └── README.md

.serena/
└── memories/                 # Serena memory storage
    ├── project_overview.md
    ├── codebase_structure.md
    ├── database_integration_strategy.md
    ├── generation-task-architecture.md
    ├── kie-api-implementation-lessons.md
    └── ...                   # 他のmemoryファイル
```

## 🎨 コードスタイル

### TypeScript
- Strict mode有効
- 明示的な型定義
- 関数型プログラミング優先

### React
- 関数コンポーネント + Hooks
- Server Components優先（App Router）
- Client Componentsは必要時のみ（`'use client'`）

### Tailwind CSS
- Utility-first
- CSS variables for theming
- Responsive design (mobile-first)

### Storybook
- 全shadcn/uiコンポーネントにストーリー作成
- インタラクティブな例を含める
- autodocs有効化

## 🧪 テスト戦略

### テストカバレッジ目標
- **Backend**: 統合テスト（API routes + Mastra agents）
- **Frontend**: コンポーネントテスト + アクセシビリティテスト
- **E2E**: 主要フロー（必要に応じて）

### テストコマンド
```bash
# すべてのテスト実行
npm run test

# Watch mode
npm run test:watch

# カバレッジ
npm run test:coverage

# Storybook起動
npm run storybook
```

## 🚀 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start

# Storybook起動
npm run storybook

# データベース
npm run db:seed        # データベースをシードデータで初期化
npm run db:reset       # データベースをリセット（マイグレーション再実行+シード）
npx prisma studio      # Prisma Studio起動（データベースGUI）
npx prisma migrate dev # 新しいマイグレーション作成

# shadcn/uiコンポーネント追加
npx shadcn@latest add [component-name]
```

## 📖 参考ドキュメント

- [Storybook Setup](./docs/development/storybook.md)
- [shadcn/ui + Storybook Integration](./docs/development/shadcn-storybook.md)
- [Custom Agents Guide](./.claude/agents/README.md)
- [Kie.ai API Documentation](./docs/kie/)
- [Serena Memories](./.serena/memories/) - プロジェクト固有の知識ベース

## 💡 ベストプラクティス

### 1. 常にテストファースト
実装前に必ずテストを書く（TDD原則）

### 2. 並列実行を活用
独立したタスクは並列Taskで高速化

### 3. Serena memoryを活用
実装前にプロジェクトパターンを確認

### 4. shadcn/ui優先
既存コンポーネントを最大限再利用

### 5. アクセシビリティ重視
WCAG準拠、キーボードナビゲーション対応

### 6. Storybook実行の制限
- **実装者agentはStorybookを起動しない**
- Storybookストーリーファイル（`.stories.tsx`）は作成するが、`npm run storybook`コマンドは実行しない
- Storybook起動はメインClaude（ユーザーとの対話セッション）のみが行う
- 理由: 複数のStorybookインスタンスが並列実行されるとポート競合やリソース問題が発生する

### 7. 外部API実装時の徹底検証 ⚠️
**実装前に必ず実際のAPIレスポンスを確認する**

#### 必須プロセス
1. **ドキュメント精読**: APIドキュメントを完全に読み、レスポンス例を確認
2. **実レスポンス検証**: 実装前に実際のAPIを叩いて構造を確認
   ```bash
   # 過去のタスクIDや実データで検証
   curl -X GET "https://api.example.com/endpoint?id=REAL_ID" \
     -H "Authorization: Bearer ${API_KEY}"
   ```
3. **構造の文書化**: レスポンス構造をコメント/ドキュメントに明記
4. **実データベースのテスト**: 実際のレスポンス構造に基づいてテストケース作成

#### 絶対にやってはいけないこと ❌
- ドキュメントを読まずに他のエンドポイントから**推測**で実装
- テストデータだけで検証し、実際のAPIレスポンスを確認しない
- レスポンス構造が似ているという理由で同じ処理を使い回す

#### 特記事項: Kie.ai API
- **モデルごとにレスポンス構造が異なる**（文字列配列/オブジェクト配列/JSON文字列）
- エンドポイント命名規則も異なる（camelCase/kebab-case）
- 詳細は `.serena/memories/kie-api-implementation-lessons.md` 参照

### 8. React Query使用時の注意点
- **サーバー/クライアント境界を意識する**
  - `useQuery`/`useMutation`は Client Component でのみ使用
  - Server Component では直接 Prisma を呼び出す
- **適切なキャッシュ無効化**
  - Mutation成功時は関連するクエリを `invalidateQueries` で更新
  - 楽観的更新（Optimistic Updates）は慎重に使用
- **エラーハンドリング**
  - `onError` コールバックでユーザーフレンドリーなエラー表示

### 9. Prismaベストプラクティス
- **トランザクション使用**
  - 複数テーブルの更新は `prisma.$transaction` でアトミックに実行
- **リレーション取得の最適化**
  - 必要なリレーションのみ `include` で取得（N+1問題回避）
- **型安全性**
  - Prisma生成型を活用（`Prisma.PromptGetPayload<...>`）

### 10. フォームバリデーション（Zod + React Hook Form）
- **Zodスキーマ定義を一箇所に集約**
  - `src/lib/schemas/` にスキーマを配置
  - フロントエンド・バックエンドで共有
- **明確なエラーメッセージ**
  - `.refine()` でカスタムバリデーション
  - ユーザーフレンドリーなメッセージを設定

---

## 🏗️ アーキテクチャパターン

### データベース設計（Prisma）

#### 主要モデル

**Project（プロジェクト）**
- プロンプト管理の最上位単位
- 複数のPromptを持つ

**Prompt（プロンプト）**
- プロジェクトに紐づく
- 階層構造（親子関係）を持つ
- 画像/動画生成用のプロンプト
- 複数のAsset（生成物）を持つ
- 複数のGenerationTask（生成履歴）を追跡

**Asset（生成物）**
- 画像または動画
- Provider情報（Midjourney, Veo, etc.）
- メタデータ（幅、高さ、ファイルサイズ、etc.）

**GenerationTask（生成タスク）**
- AI生成の実行履歴
- ステータス追跡（PENDING, SUCCESS, FAILED）
- 外部API（Kie.ai）のタスクID管理
- エラー情報の記録

#### データベース操作パターン

```typescript
// ❌ 直接Prisma Clientを使用しない
import { prisma } from '@/lib/prisma'

// ✅ React Query経由で使用
import { usePrompts } from '@/hooks/usePrompts'
const { data, isLoading } = usePrompts(projectId)

// ✅ Server Actions経由で更新
import { createPrompt } from '@/actions/generation/createPrompt'
await createPrompt({ projectId, content, type })
```

### データフェッチング（React Query）

#### クエリキー設計

```typescript
// プロジェクト一覧
['projects']

// 特定プロジェクトのプロンプト一覧
['prompts', projectId]

// 特定プロンプトの詳細
['prompt', promptId]

// 生成タスクのステータス
['generation-task', taskId]
```

#### Mutation パターン

```typescript
const mutation = useMutation({
  mutationFn: createPrompt,
  onSuccess: () => {
    // キャッシュを無効化して再フェッチ
    queryClient.invalidateQueries({ queryKey: ['prompts', projectId] })
  }
})
```

### Server Actions vs API Routes

#### Server Actions を使うケース
- データ変更操作（Create, Update, Delete）
- フォーム送信
- サーバー側バリデーションが必要な処理

```typescript
// src/actions/generation/createPrompt.ts
'use server'

export async function createPrompt(data: CreatePromptInput) {
  const validated = schema.parse(data)
  return await prisma.prompt.create({ data: validated })
}
```

#### API Routes を使うケース
- ポーリングが必要な処理（生成タスクのステータス確認）
- Webhook受信
- 外部サービスとの連携

```typescript
// src/app/api/generation/tasks/[id]/route.ts
export async function GET(request: Request, { params }: { params: { id: string } }) {
  const task = await prisma.generationTask.findUnique({
    where: { id: params.id }
  })
  return Response.json(task)
}
```

### 生成サービスアーキテクチャ

#### レイヤー構造

```
UI Component (CreatePromptModal)
    ↓
React Query Hook (useGenerateImage)
    ↓
Server Action (createPromptAndGenerate)
    ↓
Generation Service (KieService)
    ↓
Model-specific Handler (MidjourneyHandler, ImagenHandler, VeoHandler)
    ↓
Kie.ai API Client
```

#### 新しいモデル追加時の手順

1. **Prismaスキーマ更新**: `enum GenerationModel` に追加
2. **型定義追加**: `src/lib/generation/services/kie/types.ts`
3. **モデルハンドラー作成**: `src/lib/generation/services/kie/models/[model].ts`
4. **KieService統合**: メインサービスに登録
5. **UIオプション追加**: CreatePromptModalの選択肢に追加
6. **テスト作成**: TDD原則に従う

### グラフ可視化アーキテクチャ

#### ELKjs + React Flow

```typescript
// 1. データ変換（Prompt[] → ReactFlow Nodes/Edges）
const { nodes, edges } = convertPromptsToGraph(prompts)

// 2. ELKjsでレイアウト計算
const layoutedGraph = await elkLayoutGraph(nodes, edges)

// 3. React Flowで描画
<ReactFlow nodes={layoutedGraph.nodes} edges={layoutedGraph.edges} />
```

---

## 🔐 環境変数と設定

### 必須環境変数

```bash
# .env ファイル

# Database
DATABASE_URL="file:./prisma/dev.db"

# Kie.ai API
KIE_API_KEY="your-kie-api-key-here"

# Google Generative AI (Mastra用)
GOOGLE_GENERATIVE_AI_API_KEY="your-google-ai-api-key-here"

# Next.js
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 設定ファイル

**Prisma (`prisma.config.ts`)**
- データベース接続設定
- マイグレーション設定

**Next.js (`next.config.ts`)**
- ビルド設定
- 環境変数の検証

**Tailwind (`postcss.config.mjs`)**
- Tailwind CSS v4設定
- PostCSS設定

**Vitest (`vitest.config.ts`)**
- テスト環境設定
- カバレッジ設定

**shadcn/ui (`components.json`)**
- コンポーネントスタイル: "new-york"
- カラーテーマ: "neutral"
- パスエイリアス設定

---

## 🔧 ドキュメントメンテナンス

### このファイルの更新タイミング

**CLAUDE.mdは以下の変更時に必ず更新してください:**

1. **新しいディレクトリ追加時**
   - `src/`配下に新しいディレクトリを作成したとき
   - 例: `src/hooks/`, `src/services/`, `src/types/`
   - → 「ファイル構成」セクションを更新

2. **新しい技術スタックの導入時**
   - 新しいライブラリ・フレームワークを追加したとき
   - 例: Zustand、React Query、Prisma
   - → 「技術スタック」セクションを更新

3. **開発ワークフローの変更時**
   - 新しいagentを追加したとき
   - 開発フローを改善したとき
   - → 「開発ワークフロー」セクションを更新

4. **新しいコーディング規約の追加時**
   - プロジェクト固有のルールを追加したとき
   - → 「コードスタイル」または「ベストプラクティス」を更新

5. **新しいドキュメント追加時**
   - `docs/`配下に新しいドキュメントを作成したとき
   - → 「参考ドキュメント」セクションを更新

### 更新方法

```typescript
// Claude Codeに依頼する場合
"CLAUDE.mdを更新してください。[変更内容の説明]"

// 例
"src/services/ ディレクトリを追加したので、CLAUDE.mdのファイル構成を更新してください"
"Zustandを導入したので、CLAUDE.mdの技術スタックを更新してください"
```

### 自動更新のリマインダー

Claude Codeは以下のアクションを検出したら、自動的にCLAUDE.mdの更新を提案すべきです：
- 新しいディレクトリの作成
- package.jsonへの依存関係追加
- docs/配下への新規ファイル作成
- .claude/agents/配下への新規agent追加

---

**Agent定義ファイル**: `.claude/agents/`配下のファイルは**汎用的**に設計されており、プロジェクト固有情報はSerena memoryから取得します。

# Claude Code 実装方針

このプロジェクトでは、Claude Codeのカスタムsubagentを活用した**TDD（Test-Driven Development）による高速並列開発**を実践します。

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
- **Stories**: Storybook v10
- **Testing**: Vitest v4 + Playwright

### Backend
- **Framework**: Next.js 16 API Routes
- **AI**: Mastra v0.23.3 + Google Gemini 2.5 Pro
- **Database**: LibSQL (via Mastra storage)
- **Testing**: Vitest v4

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
├── agents/                    # Mastra AI agents
│   ├── weatherAgent.ts
│   ├── weatherAgent.test.ts
│   └── tools/
├── app/
│   ├── api/                   # Next.js API routes
│   │   └── [endpoint]/
│   │       ├── route.ts
│   │       └── route.test.ts
│   └── [pages]/              # Next.js pages
├── components/
│   ├── ui/                    # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── button.stories.tsx
│   │   └── button.test.tsx
│   └── [features]/           # Feature components
├── lib/
│   └── utils.ts              # CN utility, etc.
└── mastra.config.ts          # Mastra configuration

docs/
├── development/              # 開発ドキュメント
│   ├── storybook.md
│   └── shadcn-storybook.md
└── kie/                      # Kieサービス用

.claude/
└── agents/                   # カスタムsubagent定義
    ├── serena-explore.md
    ├── research.md
    ├── tdd-planner.md
    ├── ui-implementor.md
    ├── backend-implementor.md
    └── README.md
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

# shadcn/uiコンポーネント追加
npx shadcn@latest add [component-name]
```

## 📖 参考ドキュメント

- [Storybook Setup](./docs/development/storybook.md)
- [shadcn/ui + Storybook Integration](./docs/development/shadcn-storybook.md)
- [Custom Agents Guide](./.claude/agents/README.md)

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

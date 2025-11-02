# Prompt Management System

Next.js + Mastra AIフレームワークを使用したプロンプト管理システム。

## 🚀 クイックスタート

### 開発サーバーの起動
```bash
npm run dev
```
http://localhost:3000 でアクセス

### Storybookの起動
```bash
npm run storybook
```
http://localhost:6006 でアクセス

## 📚 ドキュメント

- **[開発ドキュメント](./docs/development/)** - UI開発、Storybook、shadcn/uiガイド
- **[Kieドキュメント](./docs/kie/)** - Kieサービスドキュメント

### UI開発
- [Storybookガイド](./docs/development/storybook.md) - コンポーネント開発環境
- [shadcn/ui + Storybook](./docs/development/shadcn-storybook.md) - UIコンポーネント統合

## 🛠️ 技術スタック

### コア
- **Next.js 16** - React フレームワーク (App Router)
- **React 19** - UIライブラリ
- **TypeScript 5** - 型安全な開発

### AI/エージェント
- **Mastra Core** - AIエージェントフレームワーク
- **Google Gemini 2.5 Pro** - LLMモデル
- **LibSQL** - データベース/ストレージ

### UI開発
- **Storybook 10** - コンポーネント開発環境
- **shadcn/ui** - UIコンポーネントライブラリ
- **Tailwind CSS 4** - ユーティリティファーストCSS
- **Radix UI** - アクセシブルなプリミティブ

### テスト
- **Vitest 4** - ユニット・コンポーネントテスト
- **@testing-library/react** - React コンポーネントテスト
- **jest-axe** - アクセシビリティテスト
- **Playwright** - E2Eテスト (via @vitest/browser-playwright)
- **@storybook/addon-vitest** - Storybook統合テスト

## 📦 主要コマンド

### 開発
```bash
npm run dev          # 開発サーバー起動
npm run build        # プロダクションビルド
npm run start        # プロダクションサーバー起動
npm run lint         # ESLintでコードチェック
```

### Storybook
```bash
npm run storybook         # Storybook開発サーバー
npm run build-storybook   # Storybookビルド
```

### テスト
```bash
npm run test              # テスト実行
npm run test:watch        # ウォッチモード
npm run test:coverage     # カバレッジレポート
```

### UI コンポーネント
```bash
npx shadcn@latest add <component>  # shadcn/uiコンポーネント追加
npx shadcn@latest add button       # 例: Buttonコンポーネント追加
```

## 🏗️ プロジェクト構造

```
prompt-management-system/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # メインアプリケーション（統合デモ）
│   │   └── page.test.tsx # アプリケーションテスト
│   ├── components/
│   │   ├── ui/          # shadcn/ui コンポーネント (10+ components)
│   │   ├── layout/      # レイアウトコンポーネント
│   │   │   └── ThreeColumnLayout.tsx  # リサイズ可能3カラム
│   │   ├── prompts/     # プロンプト関連コンポーネント
│   │   │   └── PromptDetail.tsx       # プロンプト詳細表示
│   │   ├── projects/    # プロジェクト関連コンポーネント
│   │   │   └── ProjectList.tsx        # プロジェクト一覧
│   │   └── graph/       # グラフビジュアライゼーション
│   │       ├── PromptGraph.tsx        # ReactFlow + ELKjs
│   │       ├── PromptNode.tsx         # カスタムノード
│   │       └── utils/elkLayoutGraph.ts # レイアウトアルゴリズム
│   ├── types/           # TypeScript型定義
│   │   ├── prompt.ts    # Prompt型
│   │   ├── project.ts   # Project型
│   │   └── graph.ts     # Graph型
│   ├── mastra/          # Mastra AI設定
│   │   ├── agents/      # AIエージェント
│   │   ├── workflows/   # ワークフロー
│   │   └── tools/       # ツール定義
│   └── lib/             # ユーティリティ関数
├── docs/                # ドキュメント
│   ├── development/     # 開発ガイド
│   └── kie/            # Kieサービスドキュメント
├── .claude/            # Claude Code設定
│   └── agents/         # カスタムsubagent定義
├── .storybook/         # Storybook設定
├── public/             # 静的ファイル
├── CLAUDE.md           # Claude Code開発ガイドライン
└── components.json     # shadcn/ui設定
```

## 🎨 UI開発ワークフロー

1. **コンポーネント追加**
   ```bash
   npx shadcn@latest add dialog
   ```

2. **Storybook ストーリー作成**
   - `src/components/ui/dialog.stories.tsx` を作成

3. **Storybookで確認**
   ```bash
   npm run storybook
   ```

4. **アプリケーションで使用**
   ```typescript
   import { Dialog } from '@/components/ui/dialog';
   ```

## 🌍 環境変数

`.env.example` をコピーして `.env` を作成：

```bash
cp .env.example .env
```

必要な環境変数：
```
GOOGLE_GENERATIVE_AI_API_KEY=your-api-key
```

## ✨ 実装済み機能

### コアコンポーネント
- ✅ **3カラムレイアウト** - `react-resizable-panels`によるリサイズ可能レイアウト
- ✅ **プロジェクト一覧** - プロジェクト選択UI（バッジ付き）
- ✅ **プロンプト詳細表示** - 名前、説明、タグ、親子関係の表示
- ✅ **グラフビジュアライゼーション** - ReactFlow + ELKjs自動レイアウト
- ✅ **統合アプリケーション** - 全コンポーネント統合済み (`src/app/page.tsx`)

### UIコンポーネントライブラリ
- ✅ **shadcn/ui** - 10+コンポーネント実装済み
- ✅ **Storybook** - 全コンポーネントのストーリー作成済み
- ✅ **テストカバレッジ** - Vitestによる包括的なテスト

### グラフ機能
- ✅ ReactFlowによるインタラクティブグラフ
- ✅ ELKjs階層的自動レイアウト
- ✅ カスタムノード・エッジコンポーネント
- ✅ ミニマップ、ズーム、パンコントロール

## 🚧 今後の実装予定

### 短期目標
- [ ] API routesによるCRUD操作
- [ ] LibSQLデータベース統合
- [ ] プロンプト編集UI
- [ ] 検索・フィルタ機能

### 中期目標
- [ ] Mastra AIエージェント統合
- [ ] ユーザー認証・認可
- [ ] ワークフロービルダー
- [ ] エクスポート/インポート機能

### 長期目標
- [ ] リアルタイムコラボレーション
- [ ] AI駆動プロンプト提案
- [ ] バージョン管理
- [ ] チーム管理機能

## 🧪 テスト状況

### パス率
- ✅ `src/app/page.test.tsx` - 15/15 テスト
- ✅ `src/components/projects/ProjectList.test.tsx` - 12/12 テスト
- ✅ `src/components/prompts/PromptDetail.test.tsx` - 全テストパス
- ⚠️ `src/components/layout/ThreeColumnLayout.test.tsx` - 5/8 テスト (3件失敗)
- ⚠️ `src/components/graph/PromptGraph.test.tsx` - コア機能正常（警告あり）

### 既知の問題
- ThreeColumnLayout: パネル/ハンドル検証テスト失敗中
- PromptGraph: テスト環境でのReactFlow警告（サイズ/スタイル設定）

## 🔗 リソース

- [Next.js Documentation](https://nextjs.org/docs)
- [Mastra Documentation](https://mastra.ai/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Storybook Documentation](https://storybook.js.org)
- [Tailwind CSS Documentation](https://tailwindcss.com)
- [ReactFlow Documentation](https://reactflow.dev)
- [ELKjs Documentation](https://eclipse.dev/elk/)

## 📝 開発ガイドライン

プロジェクト固有の開発方針やTDDプラクティスについては [CLAUDE.md](./CLAUDE.md) を参照してください。

## 📝 ライセンス

Private
